import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Exam = {
  _id: string;
  title: string;
  status: "scheduled" | "live" | "ended";
  durationMinutes: number;
  scheduledAt: string;
  paperId: { title: string; questions: unknown[] };
};

const ExamDashboard = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExams = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/exams");
      const data = await res.json();
      setExams(data);
    } catch {
      alert("Failed to fetch exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await fetchExams();
    })();
  }, []);

  const handleStatusChange = async (id: string, action: "start" | "end") => {
    if (!window.confirm(`Are you sure you want to ${action} this exam?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/exams/${id}/${action}`, { method: "PATCH" });
      if (!res.ok) throw new Error(`Failed to ${action} exam`);
      fetchExams(); // Refresh list to get new statuses
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete exam");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this scheduled exam?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/exams/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setExams((prev) => prev.filter((e) => e._id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete exam");
    }
  };

  if (loading) return <div className="p-10 text-slate-500 flex justify-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Exam Conduct Panel</h1>
            <p className="text-slate-500 text-sm mt-1">Manage, start, and monitor exam sessions.</p>
          </div>
          <button
            onClick={() => navigate("/ecp/create")}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition"
          >
            + Schedule Exam
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {exams.map((exam) => {
            const isLive = exam.status === "live";
            const isEnded = exam.status === "ended";

            return (
              <div key={exam._id} className="bg-white border border-slate-200 rounded-xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-lg font-bold text-slate-800">{exam.title}</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest border
                      ${isLive ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                      : isEnded ? "bg-slate-100 text-slate-500 border-slate-200" 
                      : "bg-amber-50 text-amber-600 border-amber-200"}`}
                    >
                      {isLive && <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />}
                      {exam.status}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500 flex items-center gap-4">
                    <span>📄 {exam.paperId?.title}</span>
                    <span>⏱ {exam.durationMinutes} mins</span>
                    <span>📅 {new Date(exam.scheduledAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* State Machine Actions */}
                <div className="flex items-center gap-3">
                  {exam.status === "scheduled" && (
                    <>
                      <button onClick={() => handleDelete(exam._id)} className="px-4 py-2 text-red-500 hover:bg-red-50 text-sm font-semibold rounded-lg transition">Delete</button>
                      <button onClick={() => handleStatusChange(exam._id, "start")} className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg transition shadow-sm">Start Exam</button>
                    </>
                  )}
                  {isLive && (
                    <>
                      <button onClick={() => navigate(`/ecp/monitor/${exam._id}`)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition">Live Monitor</button>
                      <button onClick={() => handleStatusChange(exam._id, "end")} className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition shadow-sm">End Exam</button>
                    </>
                  )}
                  {isEnded && (
                    <button onClick={() => navigate(`/ecp/monitor/${exam._id}`)} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition">View Results</button>
                  )}
                </div>
              </div>
            );
          })}
          {exams.length === 0 && (
            <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
              No exams scheduled yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamDashboard;