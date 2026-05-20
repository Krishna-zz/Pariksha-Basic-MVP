import React, { useState } from "react";
import API from "../api/api";

type Question = {
  questionText: string;
  options: string[];
  correctAnswer: string;
  marks: number;
};
 
const DEFAULT_QUESTION = (): Question => ({
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  marks: 1,
});

const OPTION_LABELS = ["A", "B", "C", "D"];

const CreatePaper = () => {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([DEFAULT_QUESTION()]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
 
  const handleQuestionChange = <K extends keyof Question>(
    index: number,
    field: K,
    value: Question[K]
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };
 
  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const options = [...q.options];
        options[optIndex] = value;
        return { ...q, options };
      })
    );
  };
 
  const addQuestion = () => {
    setQuestions((prev) => [...prev, DEFAULT_QUESTION()]);
  };
 
  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };
 
  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please enter a paper title.");
      return;
    }
    setSubmitting(true);
    try {
      // await API.post("/papers", { title, questions });

      const res = await fetch("http://localhost:5000/api/papers",{
        method: "POST",
        headers: {
          "Content-Type" : "application/json"
        },
        body: JSON.stringify({
          title,
          questions
        })
      })
      alert("Paper has been created")

      console.log(res)
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      alert("Failed to create paper. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
     <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
 
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Create Question Paper
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Build your paper by adding questions, options, and correct answers.
          </p>
        </div>
 
        {/* Paper title */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-sm">
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
            Paper Title
          </label>
          <input
            type="text"
            placeholder="e.g. Biology Mid-Term 2025"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-lg font-medium text-slate-800 placeholder-slate-300 border-none outline-none bg-transparent"
          />
        </div>
 
        {/* Questions */}
        <div className="space-y-5">
          {questions.map((q, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Question {i + 1}
                </span>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(i)}
                    className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
 
              <div className="p-5 space-y-5">
                {/* Question text */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                    Question
                  </label>
                  <textarea
                    placeholder="Enter your question here..."
                    value={q.questionText}
                    rows={2}
                    onChange={(e) =>
                      handleQuestionChange(i, "questionText", e.target.value)
                    }
                    className="w-full resize-none text-sm text-slate-700 placeholder-slate-300 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                  />
                </div>
 
                {/* Options grid */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Options
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-md bg-indigo-50 text-indigo-500 text-xs font-bold">
                          {OPTION_LABELS[j]}
                        </span>
                        <input
                          type="text"
                          placeholder={`Option ${OPTION_LABELS[j]}`}
                          value={opt}
                          onChange={(e) => handleOptionChange(i, j, e.target.value)}
                          className="flex-1 text-sm text-slate-700 placeholder-slate-300 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                        />
                      </div>
                    ))}
                  </div>
                </div>
 
                {/* Correct answer + marks */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                      Correct Answer
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. A"
                      value={q.correctAnswer}
                      onChange={(e) =>
                        handleQuestionChange(i, "correctAnswer", e.target.value)
                      }
                      className="w-full text-sm text-slate-700 placeholder-slate-300 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                      Marks
                    </label>
                    <input
                      type="number"
                      min={1}
                      title="Marks"
                      placeholder="e.g. 1"
                      value={q.marks}
                      onChange={(e) =>
                        handleQuestionChange(i, "marks", Number(e.target.value))
                      }
                      className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
 
        {/* Add question button */}
        <button
          onClick={addQuestion}
          className="mt-5 w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-indigo-300 hover:text-indigo-400 text-sm font-medium transition-colors"
        >
          + Add Question
        </button>
 
        {/* Footer / submit bar */}
        <div className="mt-8 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
          <span className="text-sm text-slate-400">
            {questions.length} question{questions.length !== 1 ? "s" : ""}&nbsp;&middot;&nbsp;
            {questions.reduce((sum, q) => sum + q.marks, 0)} marks total
          </span>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all
              ${
                submitted
                  ? "bg-emerald-500"
                  : submitting
                  ? "bg-indigo-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 active:scale-95"
              }`}
          >
            {submitted ? "Paper Created!" : submitting ? "Creating..." : "Create Paper"}
          </button>
        </div>
 
      </div>
    </div>
  );
};

export default CreatePaper;