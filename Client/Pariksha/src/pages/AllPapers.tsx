import React, { useEffect, useState } from "react";

type Question = {
  questionText: string;
  options: string[];
  correctAnswer: string;
  marks: number;
};

type Paper = {
  _id: string;
  title: string;
  questions: Question[];
};

const OPTION_LABELS = ["A", "B", "C", "D"];

const AllPapers = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/papers");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setPapers(data);
      } catch {
        setError("Could not load papers. Is your server running?");
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">
        Loading papers...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-400">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              All Papers
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {papers.length} paper{papers.length !== 1 ? "s" : ""} saved
            </p>
          </div>
        
          
           <a href="/create"
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
          >
            + New Paper
          </a>
        </div>

        {papers.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            No papers yet. Create your first one!
          </div>
        ) : (
          <div className="space-y-4">
            {papers.map((paper) => {
              const isOpen = expandedId === paper._id;
              const totalMarks = paper.questions.reduce((s, q) => s + q.marks, 0);

              return (
                <div
                  key={paper._id}
                  className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpand(paper._id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition"
                  >
                    <div>
                      <p className="text-base font-semibold text-slate-800">
                        {paper.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {paper.questions.length} question{paper.questions.length !== 1 ? "s" : ""}
                        {" · "}
                        {totalMarks} marks
                      </p>
                    </div>
                    <span className="text-slate-300 text-lg">
                      {isOpen ? "▲" : "▼"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 divide-y divide-slate-100">
                      {paper.questions.map((q, qi) => (
                        <div key={qi} className="px-5 py-4">
                          <p className="text-sm font-medium text-slate-700 mb-2">
                            <span className="text-indigo-400 font-bold mr-1">
                              Q{qi + 1}.
                            </span>
                            {q.questionText}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2">
                            {q.options.map((opt, oi) => (
                              <div
                                key={oi}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border
                                  ${
                                    q.correctAnswer.toUpperCase() === OPTION_LABELS[oi]
                                      ? "border-emerald-300 bg-emerald-50 text-emerald-700 font-medium"
                                      : "border-slate-100 bg-slate-50 text-slate-600"
                                  }`}
                              >
                                <span className="font-bold text-xs w-4">
                                  {OPTION_LABELS[oi]}
                                </span>
                                {opt || <span className="text-slate-300 italic">—</span>}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-slate-400">
                            Correct: <span className="text-emerald-600 font-semibold">{q.correctAnswer}</span>
                            {" · "}
                            {q.marks} mark{q.marks !== 1 ? "s" : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPapers;