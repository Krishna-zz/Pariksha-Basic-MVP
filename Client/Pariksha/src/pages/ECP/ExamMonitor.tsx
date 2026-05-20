import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

type AttemptSummary = {
  total: number;
  ongoing: number;
  submitted: number;
};

type Attempt = {
  _id: string;
  studentName: string;
  status: "ongoing" | "submitted";
  score: number | null;
  totalMarks: number | null;
  startedAt: string;
  submittedAt: string | null;
};

const ExamMonitor = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<AttemptSummary | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/attempts?examId=${examId}`);
      if (!res.ok) throw new Error("Failed to fetch attempts");
      const data = await res.json();
      setSummary(data.summary);
      setAttempts(data.attempts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await fetchData();
    })();

    // Auto-refresh every 10 seconds to watch live progress
    const interval = setInterval(() => {
      void fetchData();
    }, 10000);
    return () => clearInterval(interval);
  }, [examId]);

  if (loading) return <div className="p-10 text-slate-500">Loading monitor...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        
        <button onClick={() => navigate("/ecp/dashboard")} className="text-sm font-semibold text-slate-400 hover:text-slate-600 mb-6 flex items-center gap-1 transition">
          ← Back to Dashboard
        </button>

        {/* Top Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Students</p>
            <p className="text-3xl font-black text-slate-800">{summary?.total}</p>
          </div>
          <div className="bg-white border border-emerald-200 rounded-xl p-6 shadow-sm">
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Live / Ongoing</p>
            <p className="text-3xl font-black text-emerald-600">
              <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-full mr-2 animate-pulse mb-1.5"/>
              {summary?.ongoing}
            </p>
          </div>
          <div className="bg-white border border-indigo-200 rounded-xl p-6 shadow-sm">
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Submitted</p>
            <p className="text-3xl font-black text-indigo-600">✓ {summary?.submitted}</p>
          </div>
        </div>

        {/* Student Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-widest text-slate-500">
                <th className="px-6 py-4 font-bold">Student Name</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Started At</th>
                <th className="px-6 py-4 font-bold">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attempts.map((a) => (
                <tr key={a._id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">{a.studentName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${
                      a.status === "ongoing" ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(a.startedAt).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">
                    {a.status === "submitted" ? (
                      <span className="text-indigo-600">{a.score} / {a.totalMarks}</span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {attempts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No students have joined the exam yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExamMonitor;