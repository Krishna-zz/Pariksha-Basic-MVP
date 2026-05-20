import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

type ExamInfo = {
  _id: string;
  title: string;
  durationMinutes: number;
  status: string;
  paperId: {
    title: string;
    questions: unknown[];
  };
  antiCheat: {
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    fullscreenRequired: boolean;
  };
};

const ExamEntry = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<ExamInfo | null>(null);
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/exams/${examId}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setExam(data);
      } catch {
        setFetchError("Could not load exam. Check the link or ask your teacher.");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId]);

  const handleStart = async () => {
    if (!studentName.trim()) { setError("Please enter your name."); return; }
    setError("");
    setStarting(true);
    try {
      const res = await fetch("http://localhost:5000/api/attempts/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId, studentName: studentName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to start");

      sessionStorage.setItem("attemptId", data.attemptId);
      sessionStorage.setItem("studentName", studentName.trim());
      sessionStorage.setItem("durationMinutes", String(data.durationMinutes));
      sessionStorage.setItem("questions", JSON.stringify(data.questions));
      sessionStorage.setItem("antiCheat", JSON.stringify(data.antiCheat));

      navigate(`/exam/${examId}/attempt`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to start exam.");
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-9 h-9 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Loading exam...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center max-w-sm">
          <span className="text-4xl">⚠️</span>
          <p className="text-slate-400 text-sm mt-4">{fetchError}</p>
        </div>
      </div>
    );
  }

  const isLive = exam?.status === "live";

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden">
        {/* Accent bar */}
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />

        <div className="p-8">
          {/* Status badge */}
          <div
            className={`inline-flex items-center gap-2 text-xs font-bold tracking-widest px-3 py-1 rounded-full mb-5 ${
              isLive
                ? "bg-green-950 text-green-400"
                : "bg-yellow-950 text-yellow-500"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${isLive ? "bg-green-400" : "bg-yellow-400"}`}
            />
            {isLive ? "LIVE NOW" : exam?.status?.toUpperCase()}
          </div>

          <h1 className="text-2xl font-bold text-slate-100 leading-tight mb-1">
            {exam?.title}
          </h1>
          <p className="text-sm text-slate-500 mb-6">{exam?.paperId?.title}</p>

          {/* Info pills */}
          <div className="flex gap-3 mb-6">
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-full px-4 py-1.5 text-sm text-slate-400">
              ⏱ {exam?.durationMinutes} mins
            </div>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-full px-4 py-1.5 text-sm text-slate-400">
              📋 {exam?.paperId?.questions?.length ?? "—"} questions
            </div>
          </div>

          <div className="h-px bg-slate-800 mb-6" />

          {isLive ? (
            <>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                Your Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Arjun Sharma"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
              />
              {error && (
                <p className="text-red-400 text-xs mt-2">{error}</p>
              )}

              {/* Rules */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mt-5 mb-6">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">
                  Before you begin
                </p>
                <ul className="text-slate-500 text-sm space-y-1.5 list-disc list-inside">
                  <li>Do not refresh or close the tab</li>
                  <li>Your answers are saved automatically</li>
                  <li>Submit before the timer runs out</li>
                  <li>All questions are mandatory</li>
                </ul>
              </div>

              <button
                onClick={handleStart}
                disabled={starting}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {starting ? "Starting..." : "Start Exam →"}
              </button>
            </>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center">
              <p className="text-slate-500 text-sm leading-relaxed">
                {exam?.status === "scheduled"
                  ? "This exam hasn't started yet. Please wait for your teacher to begin."
                  : "This exam has ended. No new attempts are allowed."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamEntry;