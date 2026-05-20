import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type Question = {
  [key: string]: unknown;
};

type Paper = {
  _id: string;
  title: string;
  questions: Question[];
};

const CreateExam = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    paperId: "",
    scheduledAt: "",
    durationMinutes: 60,
    antiCheat: {
      shuffleQuestions: false,
      shuffleOptions: false,
    },
  });

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/papers");
        const data = await res.json();
        setPapers(data);
      } catch {
        alert("Failed to load question papers");
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create exam");
      
      alert("Exam Scheduled Successfully!");
      navigate("/ecp/dashboard");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-slate-500">Loading blueprint papers...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Schedule New Exam</h1>
          <p className="text-slate-500 text-sm mt-1">Convert a Question Paper into a live exam session.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exam Title */}
          <div>
            <label htmlFor="exam-title" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Exam Title</label>
            <input
              id="exam-title"
              type="text"
              required
              placeholder="e.g. CS101 Final Exam - Batch A"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-sm text-slate-800 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>

          {/* Paper Selection */}
          <div>
            <label htmlFor="paper-select" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Select Blueprint (Paper)</label>
            <select
              id="paper-select"
              required
              title="Select a question paper to create an exam"
              value={formData.paperId}
              onChange={(e) => setFormData({ ...formData, paperId: e.target.value })}
              className="w-full text-sm text-slate-800 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition bg-white"
            >
              <option value="" disabled>-- Select a Question Paper --</option>
              {papers.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title} ({p.questions.length} questions)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Schedule Date */}
            <div>
              <label htmlFor="schedule-time" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Schedule Time</label>
              <input
                id="schedule-time"
                type="datetime-local"
                required
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                className="w-full text-sm text-slate-800 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>
            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Duration (Mins)</label>
              <input
                id="duration"
                type="number"
                min="1"
                required
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                className="w-full text-sm text-slate-800 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>
          </div>

          {/* Anti-Cheat Rules */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Anti-Cheat Protocols</h3>
            <div className="space-y-3">
              <label htmlFor="shuffle-questions" className="flex items-center gap-3 cursor-pointer">
                <input
                  id="shuffle-questions"
                  type="checkbox"
                  checked={formData.antiCheat.shuffleQuestions}
                  onChange={(e) => setFormData({
                    ...formData,
                    antiCheat: { ...formData.antiCheat, shuffleQuestions: e.target.checked }
                  })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-slate-700">Shuffle Questions for each student</span>
              </label>
              <label htmlFor="shuffle-options" className="flex items-center gap-3 cursor-pointer">
                <input
                  id="shuffle-options"
                  type="checkbox"
                  checked={formData.antiCheat.shuffleOptions}
                  onChange={(e) => setFormData({
                    ...formData,
                    antiCheat: { ...formData.antiCheat, shuffleOptions: e.target.checked }
                  })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-slate-700">Shuffle Options inside questions</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all active:scale-95 disabled:opacity-60"
          >
            {submitting ? "Scheduling..." : "Create Exam Session"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateExam;