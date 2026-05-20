import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

type BreakdownItem = {
  questionIndex:  number;
  questionText:   string;
  options:        string[];
  selectedOption: string | null;
  correctAnswer:  string;
  isCorrect:      boolean;
  marksAwarded:   number;
  totalMarks:     number;
};

type Result = {
  studentName: string;
  score:       number;
  totalMarks:  number;
  percentage:  number;
  timeTaken:   string;
  breakdown:   BreakdownItem[];
};

const OPTION_LABELS = ["A", "B", "C", "D"];

const ExamResult = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate   = useNavigate();

  const [result, setResult]   = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const attemptId = sessionStorage.getItem("attemptId");
    if (attemptId) {
      fetch(`http://localhost:5000/api/attempts/${attemptId}/result`)
        .then((r) => r.json())
        .then((data) => { setResult(data); setLoading(false); })
        .catch(() => {
          const cached = sessionStorage.getItem("result");
          if (cached) {
            setResult({
              ...JSON.parse(cached),
              studentName: sessionStorage.getItem("studentName") || "Student",
              timeTaken: "—",
            });
          }
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-9 h-9 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Loading results...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500">No result found.</p>
        <button
          onClick={() => navigate(`/exam/${examId}`)}
          className="px-5 py-2 bg-slate-900 border border-slate-700 text-slate-400 text-sm rounded-xl"
        >
          Go Back
        </button>
      </div>
    );
  }

  const pct        = result.percentage;
  const grade      = pct >= 90 ? "A+" : pct >= 75 ? "A" : pct >= 60 ? "B" : pct >= 45 ? "C" : "F";
  const gradeColor = pct >= 75 ? "text-green-400" : pct >= 45 ? "text-yellow-400" : "text-red-400";
  const ringColor  = pct >= 75 ? "border-green-500/40" : pct >= 45 ? "border-yellow-500/40" : "border-red-500/40";
  const correct    = result.breakdown?.filter((b) => b.isCorrect).length ?? 0;
  const wrong      = (result.breakdown?.length ?? 0) - correct;

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        {/* ── SCORE HERO ── */}
        <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center overflow-hidden">
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">
            Exam Complete
          </p>
          <h1 className="text-3xl font-black text-slate-100 mb-8">{result.studentName}</h1>

          {/* Score ring */}
          <div className={`inline-flex flex-col items-center justify-center w-40 h-40 rounded-full border-4 ${ringColor} mb-8`}>
            <span className={`text-4xl font-black leading-none ${gradeColor}`}>{grade}</span>
            <span className="text-lg font-bold text-slate-300">{pct}%</span>
            <span className="text-xs text-slate-600 mt-0.5">{result.score} / {result.totalMarks} marks</span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center bg-slate-950 rounded-2xl px-6 py-4 gap-0">
            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="text-2xl font-black text-green-400">{correct}</span>
              <span className="text-xs text-slate-600 uppercase tracking-widest">Correct</span>
            </div>
            <div className="w-px h-9 bg-slate-800" />
            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="text-2xl font-black text-red-400">{wrong}</span>
              <span className="text-xs text-slate-600 uppercase tracking-widest">Wrong</span>
            </div>
            <div className="w-px h-9 bg-slate-800" />
            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="text-2xl font-black text-slate-400">{result.timeTaken}</span>
              <span className="text-xs text-slate-600 uppercase tracking-widest">Time</span>
            </div>
          </div>
        </div>

        {/* ── ANSWER BREAKDOWN ── */}
        {result.breakdown?.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-slate-100">Answer Review</h2>
              <button
                onClick={() => setShowAll((p) => !p)}
                className="text-xs font-semibold text-indigo-400 border border-indigo-500/50 rounded-lg px-3 py-1 hover:bg-indigo-500/10 transition"
              >
                {showAll ? "Wrong Only" : "Show All"}
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {result.breakdown
                .filter((b) => showAll || !b.isCorrect)
                .map((b, i) => (
                  <div
                    key={i}
                    className={`bg-slate-950 rounded-xl p-5 border-l-4 ${
                      b.isCorrect ? "border-green-500" : "border-red-500"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black text-indigo-400 tracking-widest">
                        Q{b.questionIndex + 1}
                      </span>
                      <span
                        className={`text-xs font-bold px-3 py-0.5 rounded-full ${
                          b.isCorrect
                            ? "bg-green-950 text-green-400"
                            : "bg-red-950 text-red-400"
                        }`}
                      >
                        {b.isCorrect ? `+${b.marksAwarded}` : "0"} / {b.totalMarks}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-slate-300 leading-relaxed mb-4">
                      {b.questionText}
                    </p>

                    {/* Options */}
                    <div className="flex flex-col gap-2">
                      {b.options?.map((opt, oi) => {
                        const label     = OPTION_LABELS[oi];
                        const isCorrect = label === b.correctAnswer?.toUpperCase();
                        const isChosen  = label === b.selectedOption;

                        return (
                          <div
                            key={oi}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm border
                              ${isCorrect
                                ? "bg-green-950 border-green-600 text-green-300"
                                : isChosen && !isCorrect
                                ? "bg-red-950 border-red-600 text-red-300"
                                : "bg-slate-900 border-slate-800 text-slate-500"
                              }`}
                          >
                            <span className="font-black text-xs w-5 shrink-0">{label}</span>
                            <span className="flex-1">{opt}</span>
                            {isCorrect && <span className="ml-auto font-bold">✓</span>}
                            {isChosen && !isCorrect && <span className="ml-auto font-bold">✗</span>}
                          </div>
                        );
                      })}
                    </div>

                    {!b.selectedOption && (
                      <p className="text-xs text-yellow-500 mt-3">⚠ Skipped — no answer selected</p>
                    )}
                  </div>
                ))}

              {!showAll && correct === result.breakdown.length && (
                <div className="text-center py-8 text-green-400 font-semibold text-base">
                  🎉 All answers correct!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pb-8">
          <button
            onClick={() => navigate(`/exam/${examId}`)}
            className="px-6 py-2.5 bg-slate-900 border border-slate-700 text-slate-400 text-sm font-semibold rounded-xl hover:border-slate-500 transition"
          >
            ← Back to Exam Page
          </button>
        </div>

      </div>
    </div>
  );
};

export default ExamResult;