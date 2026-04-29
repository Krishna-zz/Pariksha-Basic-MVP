import React, { useState } from "react";
import API from "../api/api";

type Question = {
  questionText: string;
  options: string[];
  correctAnswer: string;
  marks: number;
};

const DEFAULT_QUESTION: Question = {
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  marks: 1,
};

const CreatePaper = () => {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([{ ...DEFAULT_QUESTION, options: [...DEFAULT_QUESTION.options] }]);

  // Generic: TypeScript infers the type of `value` from `field` — no `as any`
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
    setQuestions((prev) => [
      ...prev,
      { ...DEFAULT_QUESTION, options: [...DEFAULT_QUESTION.options] },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }
    try {
      await API.post("/papers", { title, questions });
      alert("Paper created!");
    } catch (err) {
      alert("Failed to create paper.");
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Create Paper</h2>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {questions.map((q, i) => (
        <div key={i} className="border-gray-700 m-2.5 p-2.5">
          <input
            placeholder="Question"
            value={q.questionText}
            onChange={(e) => handleQuestionChange(i, "questionText", e.target.value)}
          />

          {q.options.map((opt, j) => (
            <input
              key={j}
              placeholder={`Option ${j + 1}`}
              value={opt}
              onChange={(e) => handleOptionChange(i, j, e.target.value)}
            />
          ))}

          <input
            placeholder="Correct Answer"
            value={q.correctAnswer}
            onChange={(e) => handleQuestionChange(i, "correctAnswer", e.target.value)}
          />

          <input
            type="number"
            placeholder="Marks"
            value={q.marks}
            min={1}
            onChange={(e) => handleQuestionChange(i, "marks", Number(e.target.value))}
          />

          {questions.length > 1 && (
            <button onClick={() => removeQuestion(i)}>Remove</button>
          )}
        </div>
      ))}

      <button onClick={addQuestion}>Add Question</button>
      <button onClick={handleSubmit}>Create Paper</button>
    </div>
  );
};

export default CreatePaper;