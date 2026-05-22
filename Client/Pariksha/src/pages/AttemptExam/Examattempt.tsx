import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios"; 

type Question = {
  index: number;
  questionText: string;
  options: string[];
  marks: number;
};

const OPTION_LABELS = ["A", "B", "C", "D"];
const MAX_VIOLATIONS = 3;

const ExamAttempt = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  // Session Data
  const attemptId = sessionStorage.getItem("attemptId") || "";
  const studentName = sessionStorage.getItem("studentName") || "Student";
  const durationMins = Number(sessionStorage.getItem("durationMinutes") || 30);
  const questions: Question[] = JSON.parse(sessionStorage.getItem("questions") || "[]");
  const antiCheat = JSON.parse(sessionStorage.getItem("antiCheat") || "{}");
  
  const requireFullscreen = antiCheat.fullscreenRequired || false;

  // Exam State
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(durationMins * 60);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Anti-Cheat State
  const [isFullScreen, setIsFullScreen] = useState(!requireFullscreen);
  const [violations, setViolations] = useState(0);
  const [violationMsg, setViolationMsg] = useState("");

  // ─────────────────────────────────────────
  // ANTI-CHEAT LOGIC
  // ─────────────────────────────────────────
  
  // Handle 3-Strikes Auto-Submit
  useEffect(() => {
    if (violations >= MAX_VIOLATIONS) {
      setViolationMsg("Maximum violations reached. Your exam is being automatically submitted.");
      setTimeout(() => handleSubmit(true), 3000);
    }
  }, [violations]);

  useEffect(() => {
    if (!attemptId || questions.length === 0) {
      navigate(`/exam/${examId}`);
      return;
    }

    // 1. Tab-Switching Detection
    const handleVisibilityChange = () => {
      if (document.hidden && violations < MAX_VIOLATIONS && !submitting) {
        setViolations((prev) => prev + 1);
        setViolationMsg("You switched tabs or minimized the browser.");
      }
    };

    // 2. Fullscreen Exit Detection
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && requireFullscreen && violations < MAX_VIOLATIONS && !submitting) {
        setIsFullScreen(false);
        setViolations((prev) => prev + 1);
        setViolationMsg("You exited fullscreen mode.");
      } else if (document.fullscreenElement) {
        setIsFullScreen(true);
      }
    };

    // Add Listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    if (requireFullscreen) {
      document.addEventListener("fullscreenchange", handleFullscreenChange);
    }

    // Prevent accidental reload / tab close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (requireFullscreen) document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [requireFullscreen, violations, submitting]);

  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullScreen(true);
    } catch (err) {
      alert("Browser blocked fullscreen. Please try again.");
    }
  };

  // ─────────────────────────────────────────
  // EXAM LOGIC
  // ─────────────────────────────────────────

  useEffect(() => {
    // Only run timer if they are not blocked by a violation or fullscreen lock
    if ((requireFullscreen && !isFullScreen) || violationMsg || submitting) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [isFullScreen, violationMsg, submitting, requireFullscreen]);

  const handleAnswer = useCallback(
    async (qIndex: number, option: string) => {
      setAnswers((prev) => ({ ...prev, [qIndex]: option }));
      try {
        // Upgraded to use api client!
        await api.patch(`/attempts/${attemptId}/answer`, {
          questionIndex: qIndex,
          selectedOption: option,
        });
      } catch {
        /* fail silently, ideally we'd save to localStorage here as a fallback */
      }
    },
    [attemptId]
  );

  const handleSubmit = async (auto = false) => {
    if (submitting) return;
    setSubmitting(true);
    setShowConfirm(false);
    clearInterval(timerRef.current!);
    
    // Exit fullscreen cleanly on submit
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    try {
      const res = await api.post(`/attempts/${attemptId}/submit`);
      sessionStorage.setItem("result", JSON.stringify(res.data));
      navigate(`/exam/${examId}/result`);
    } catch (err: any) {
      alert(err.response?.data?.message || "Submission failed. Please try again.");
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────
  // RENDER BLOCKS
  // ─────────────────────────────────────────

  // BLOCK 1: Fullscreen Required Gate
  if (requireFullscreen && !isFullScreen && !violationMsg && violations < MAX_VIOLATIONS) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-indigo-900/50 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
            ⛶
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-3">Fullscreen Required</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            This exam requires fullscreen mode to prevent cheating. Exiting fullscreen will result in a violation strike.
          </p>
          <button
            onClick={enterFullscreen}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            Enter Fullscreen to Begin
          </button>
        </div>
      </div>
    );
  }

  // BLOCK 2: Violation Warning Modal
  if (violationMsg && violations < MAX_VIOLATIONS) {
    return (
      <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center px-4 z-50">
        <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-8 max-w-md text-center shadow-2xl shadow-red-500/10">
          <div className="w-16 h-16 bg-red-900/50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-black">
            !
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Rule Violation Detected</h2>
          <p className="text-red-400 font-medium text-sm mb-4">{violationMsg}</p>
          <div className="bg-slate-950 rounded-lg py-3 px-4 mb-8 border border-slate-800">
            <span className="text-slate-400 text-xs uppercase tracking-widest font-bold">Strike</span>
            <div className="text-2xl font-black text-slate-100">{violations} / {MAX_VIOLATIONS}</div>
          </div>
          <button
            onClick={() => {
              setViolationMsg("");
              if (requireFullscreen) enterFullscreen();
            }}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all active:scale-95"
          >
            Acknowledge & Resume
          </button>
        </div>
      </div>
    );
  }

  // Formatting helpers
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const timerClass =
    timeLeft < 60
      ? "text-red-400 border-red-500/30 bg-red-500/10 animate-pulse"
      : timeLeft < 300
      ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
      : "text-green-400 border-green-500/30 bg-green-500/5";

  const answered = Object.keys(answers).length;
  const unanswered = questions.length - answered;
  const q = questions[current];

  if (!q) return null;

  // BLOCK 3: The Main Exam UI
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans select-none">
      
      {/* If 3 strikes hit, show this blocking overlay while auto-submitting */}
      {violations >= MAX_VIOLATIONS && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-black text-red-500 mb-2">Exam Terminated</h2>
          <p className="text-slate-400">{violationMsg}</p>
        </div>
      )}

      {/* ── TOP BAR ── */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-5 h-16 bg-slate-900 border-b border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-300 bg-slate-950 border border-slate-700 rounded-full px-4 py-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {studentName}
          </span>
          {violations > 0 && (
             <span className="text-xs font-bold text-red-400 border border-red-500/30 bg-red-500/10 rounded-full px-3 py-1">
               Strikes: {violations}/{MAX_VIOLATIONS}
             </span>
          )}
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-2 text-2xl font-black border-2 rounded-xl px-5 py-1 transition-colors ${timerClass}`}>
          {formatTime(timeLeft)}
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          disabled={submitting}
          className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold rounded-xl transition disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Exam"}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── SIDEBAR PALETTE ── */}
        <aside className="w-56 shrink-0 bg-slate-900 border-r border-slate-800 p-5 flex flex-col gap-6 overflow-y-auto">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Question Palette</p>

          <div className="grid grid-cols-4 gap-2">
            {questions.map((_, i) => {
              const isAnswered = answers[i] !== undefined;
              const isCurrent = i === current;
              return (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`aspect-square rounded-xl text-xs font-bold transition-all shadow-sm
                    ${isCurrent
                      ? "bg-indigo-600 border-2 border-indigo-400 text-white scale-110 z-10"
                      : isAnswered
                      ? "bg-emerald-900/40 border-2 border-emerald-500/50 text-emerald-400 hover:border-emerald-400"
                      : "bg-slate-950 border-2 border-slate-800 text-slate-500 hover:border-slate-600"
                    }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-emerald-500/20 border border-emerald-500/50" /> Answered
              </span>
              <span className="text-emerald-400">{answered}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-slate-950 border border-slate-800" /> Skipped
              </span>
              <span className="text-slate-500">{unanswered}</span>
            </div>
            
            <div className="h-2 bg-slate-950 rounded-full overflow-hidden mt-2 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(answered / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </aside>

        {/* ── QUESTION PANEL ── */}
        <main className="flex-1 overflow-y-auto p-8 flex justify-center bg-[#0a0f1a]">
          <div className="w-full max-w-3xl">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl">
              
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
                <span className="text-sm font-black text-indigo-500 tracking-widest uppercase">
                  Question {current + 1} <span className="text-slate-600">of {questions.length}</span>
                </span>
                <span className="text-xs font-bold text-slate-400 bg-slate-950 border border-slate-700 rounded-full px-4 py-1.5">
                  {q.marks} Mark{q.marks !== 1 ? "s" : ""}
                </span>
              </div>

              <p className="text-xl font-medium text-slate-100 leading-relaxed mb-10 select-none">
                {q.questionText}
              </p>

              <div className="flex flex-col gap-4 mb-10">
                {q.options.map((opt, oi) => {
                  const label = OPTION_LABELS[oi];
                  const isSelected = answers[q.index] === label;
                  return (
                    <button
                      key={oi}
                      onClick={() => handleAnswer(q.index, label)}
                      className={`flex items-center gap-5 px-6 py-5 rounded-2xl border-2 text-left transition-all
                        ${isSelected
                          ? "bg-indigo-900/20 border-indigo-500 ring-4 ring-indigo-500/10 translate-x-2"
                          : "bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                        }`}
                    >
                      <span
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 transition-colors
                          ${isSelected ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" : "bg-slate-800 text-slate-400"}`}
                      >
                        {label}
                      </span>
                      <span className={`text-base flex-1 ${isSelected ? "text-indigo-100 font-medium" : "text-slate-300"}`}>
                        {opt}
                      </span>
                      {isSelected && (
                        <span className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold ml-auto">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setCurrent((p) => Math.max(0, p - 1))}
                  disabled={current === 0}
                  className="px-6 py-3 bg-slate-950 border border-slate-800 text-slate-400 text-sm font-bold rounded-xl disabled:opacity-30 hover:bg-slate-800 transition"
                >
                  ← Previous
                </button>

                {current < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrent((p) => p + 1)}
                    className="px-8 py-3 bg-indigo-600/20 border border-indigo-500/50 text-indigo-400 text-sm font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition"
                  >
                    Next Question →
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-xl hover:from-emerald-400 hover:to-teal-400 transition shadow-lg shadow-emerald-500/20"
                  >
                    Review & Submit ✓
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── CONFIRM MODAL ── */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-10 w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-slate-100 mb-4">Submit Exam?</h2>
            <div className="bg-slate-950 rounded-2xl p-5 mb-6 border border-slate-800">
              <p className="text-sm text-slate-400 leading-relaxed flex justify-between mb-2">
                <span>Questions Answered:</span>
                <span className="text-emerald-400 font-bold">{answered} / {questions.length}</span>
              </p>
              {unanswered > 0 && (
                <p className="text-sm text-red-400 font-medium flex justify-between pt-2 border-t border-slate-800">
                  <span>Questions Skipped:</span>
                  <span>{unanswered}</span>
                </p>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-8 font-medium">
              Are you sure? You cannot change your answers after submitting.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-xl transition"
              >
                Go Back
              </button>
              <button
                onClick={() => handleSubmit(false)}
                className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-indigo-600/20"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamAttempt;