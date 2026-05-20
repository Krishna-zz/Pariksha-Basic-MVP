import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

type Question = {
  index: number;
  questionText: string;
  options: string[];
  marks: number;
};

const OPTION_LABELS = ["A", "B", "C", "D"];

const ExamAttempt = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const attemptId    = sessionStorage.getItem("attemptId") || "";
  const studentName  = sessionStorage.getItem("studentName") || "Student";
  const durationMins = Number(sessionStorage.getItem("durationMinutes") || 30);
  const questions: Question[] = JSON.parse(sessionStorage.getItem("questions") || "[]");

  const [answers, setAnswers]         = useState<Record<number, string>>({});
  const [current, setCurrent]         = useState(0);
  const [timeLeft, setTimeLeft]       = useState(durationMins * 60);
  const [submitting, setSubmitting]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!attemptId || questions.length === 0) navigate(`/exam/${examId}`);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); handleSubmit(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const timerClass =
    timeLeft < 60
      ? "text-red-400 border-red-500/30"
      : timeLeft < 300
      ? "text-yellow-400 border-yellow-500/30"
      : "text-green-400 border-green-500/30";

  const handleAnswer = useCallback(
    async (qIndex: number, option: string) => {
      setAnswers((prev) => ({ ...prev, [qIndex]: option }));
      try {
        await fetch(`http://localhost:5000/api/attempts/${attemptId}/answer`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionIndex: qIndex, selectedOption: option }),
        });
      } catch { /* fail silently */ }
    },
    [attemptId]
  );

  const handleSubmit = async (auto = false) => {
    if (submitting) return;
    setSubmitting(true);
    setShowConfirm(false);
    clearInterval(timerRef.current!);
    try {
      const res = await fetch(`http://localhost:5000/api/attempts/${attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      sessionStorage.setItem("result", JSON.stringify(data));
      navigate(`/exam/${examId}/result`);
    } catch {
      alert("Submission failed. Please try again.");
      setSubmitting(false);
    }
  };

  const answered   = Object.keys(answers).length;
  const unanswered = questions.length - answered;
  const q          = questions[current];

  if (!q) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">

      {/* ── TOP BAR ── */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-5 h-14 bg-slate-900 border-b border-slate-800">
        <span className="text-xs text-slate-400 bg-slate-950 border border-slate-800 rounded-full px-3 py-1">
          👤 {studentName}
        </span>

        {/* Timer */}
        <div className={`flex items-center gap-2 text-xl font-black border rounded-xl px-4 py-1 transition-colors ${timerClass}`}>
          ⏱ {formatTime(timeLeft)}
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          disabled={submitting}
          className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── SIDEBAR PALETTE ── */}
        <aside className="w-48 shrink-0 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Questions</p>

          {/* Palette grid */}
          <div className="grid grid-cols-4 gap-1.5">
            {questions.map((_, i) => {
              const isAnswered = answers[i] !== undefined;
              const isCurrent  = i === current;
              return (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`aspect-square rounded-lg text-xs font-bold transition-all
                    ${isCurrent
                      ? "bg-indigo-600 border-2 border-indigo-400 text-white scale-110"
                      : isAnswered
                      ? "bg-green-900 border-2 border-green-500 text-green-300"
                      : "bg-slate-950 border-2 border-slate-700 text-slate-500 hover:border-slate-500"
                    }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              Answered ({answered})
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              Skipped ({unanswered})
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-green-500 rounded-full transition-all duration-300"
                style={{ width: `${(answered / questions.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-600">{answered}/{questions.length} answered</p>
          </div>
        </aside>

        {/* ── QUESTION PANEL ── */}
        <main className="flex-1 overflow-y-auto p-6 flex justify-center">
          <div className="w-full max-w-2xl">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-black text-indigo-400 tracking-widest uppercase">
                  Question {current + 1}
                </span>
                <span className="text-xs font-bold text-slate-500 bg-slate-950 border border-slate-800 rounded-full px-3 py-1">
                  {q.marks} mark{q.marks !== 1 ? "s" : ""}
                </span>
              </div>

              <p className="text-lg font-semibold text-slate-100 leading-relaxed mb-8">
                {q.questionText}
              </p>

              {/* Options */}
              <div className="flex flex-col gap-3 mb-8">
                {q.options.map((opt, oi) => {
                  const label      = OPTION_LABELS[oi];
                  const isSelected = answers[q.index] === label;
                  return (
                    <button
                      key={oi}
                      onClick={() => handleAnswer(q.index, label)}
                      className={`flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left transition-all
                        ${isSelected
                          ? "bg-indigo-950 border-indigo-500 translate-x-1.5"
                          : "bg-slate-950 border-slate-800 hover:border-slate-600"
                        }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-colors
                          ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-500"}`}
                      >
                        {label}
                      </span>
                      <span className="text-sm text-slate-300 flex-1">{opt}</span>
                      {isSelected && <span className="text-indigo-400 font-black ml-auto">✓</span>}
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-5 border-t border-slate-800">
                <button
                  onClick={() => setCurrent((p) => Math.max(0, p - 1))}
                  disabled={current === 0}
                  className="px-5 py-2 bg-slate-950 border border-slate-700 text-slate-400 text-sm font-semibold rounded-xl disabled:opacity-30 hover:border-slate-500 transition"
                >
                  ← Prev
                </button>

                <span className="text-xs text-slate-600">
                  {current + 1} / {questions.length}
                </span>

                {current < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrent((p) => p + 1)}
                    className="px-5 py-2 bg-blue-950 border border-blue-700 text-blue-300 text-sm font-bold rounded-xl hover:bg-blue-900 transition"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition"
                  >
                    Submit ✓
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── CONFIRM MODAL ── */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-9 w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold text-slate-100 mb-3">Submit Exam?</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-2">
              You've answered{" "}
              <strong className="text-green-400">{answered}</strong> of{" "}
              <strong className="text-slate-200">{questions.length}</strong> questions.
              {unanswered > 0 && (
                <span className="text-red-400"> {unanswered} unanswered.</span>
              )}
            </p>
            <p className="text-xs text-slate-600 mb-7">
              You cannot change answers after submitting.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 bg-slate-950 border border-slate-700 text-slate-400 text-sm font-semibold rounded-xl hover:border-slate-500 transition"
              >
                Go Back
              </button>
              <button
                onClick={() => handleSubmit(false)}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition"
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