const Attempt =  require("../models/Attempt")
const Exam = require("../models/Exam")
const Paper = require("../models/Paper")


// helper: shuffle an array (for anti-cheat)
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// POST /api/attempts/start
// Student enters exam — creates an attempt
// Returns exam questions WITHOUT correct answers.....must needed part aahe


const startAttempt = async(req, res) => {
    try {
        const  {examId, studentName} = req.body;

        if(!examId || !studentName){
            return res.status(400).json({message: "examId and studentName are required"})
        }

        // 1. Check exam exists and is live
        const exam = await Exam.findById(examId)
        if(!exam){
            return res.status(404).json({message:"Exam not found"})
        }

        if (exam.status !== "live"){
            return res.status(400).json({
                message: 
                exam.status === "scheduled"?
                "exam is yet to be started":
                "exam has already ended"
            })
        }


           // 2. Prevent duplicate attempts by same student in same exam
    const existing = await Attempt.findOne({ examId, studentName, status: "ongoing" });
    if (existing) {
      return res.status(400).json({
        message: "An ongoing attempt already exists for this student",
        attemptId: existing._id,
      });
    }

    // 3. Fetch paper
    const paper = await Paper.findById(exam.paperId);
    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }

     // 4. Build safe questions (strip correctAnswer)
    let questions = paper.questions.map((q, index) => ({
      index,
      questionText: q.questionText,
      options:      q.options,
      marks:        q.marks,
    }));

     // 6. Pre-fill answers array with null for every question
    const answers = paper.questions.map((_, i) => ({
      questionIndex:  i,
      selectedOption: null,
    }));


    //7. create the Attempt
    const attempt = await Attempt.create({
        examId,
      studentName,
      answers,
    })


    res.status(201).json({
      message:         "Attempt started",
      attemptId:       attempt._id,
      durationMinutes: exam.durationMinutes,
      antiCheat:       exam.antiCheat,
      questions,           // safe — no correct answers
    });

    } catch (error) {
         res.status(500).json({ message: "Server error", error: err.message });
    }
}


// PATCH /api/attempts/:id/answer
// Auto-save a single answer as student picks


const saveAnswer = async(req, res) => {
    try {
         const { questionIndex, selectedOption } = req.body;

          if (questionIndex === undefined || !selectedOption) {
      return res.status(400).json({ message: "questionIndex and selectedOption are required" });
    }

    const validOptions = ["A", "B", "C", "D"];

    if (!validOptions.includes(selectedOption)) {
      return res.status(400).json({ message: "selectedOption must be A, B, C, or D" });
    }

    const attempt = await Attempt.findById(req.params.id)
     if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

     if (attempt.status === "submitted") {
      return res.status(400).json({ message: "Attempt already submitted" });
    }

     // Update the specific answer in the answers array
    const answerIndex = attempt.answers.findIndex(
      (a) => a.questionIndex === questionIndex
    );

    if (answerIndex === -1){
        return res.status(400).json({message: "invalid questionIndex"})
    }

    attempt.answers[answerIndex].selectedOption = selectedOption;
    await attempt.save();

     res.status(200).json({ message: "Answer saved", questionIndex, selectedOption });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}


// POST /api/attempts/:id/submit
// Student submits — score is calculated here


const submitAttempt = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }
    if (attempt.status === "submitted") {
      return res.status(400).json({ message: "Attempt already submitted" });
    }

    // Fetch exam → paper to get correct answers
    const exam  = await Exam.findById(attempt.examId);
    const paper = await Paper.findById(exam.paperId);

    // Calculate score
    let score      = 0;
    let totalMarks = 0;

    const breakdown = paper.questions.map((q, i) => {
      const studentAnswer = attempt.answers.find((a) => a.questionIndex === i);
      const selected      = studentAnswer?.selectedOption ?? null;
      const isCorrect     = selected === q.correctAnswer.toUpperCase();

      totalMarks += q.marks;
      if (isCorrect) score += q.marks;

      return {
        questionIndex:  i,
        questionText:   q.questionText,
        selectedOption: selected,
        correctAnswer:  q.correctAnswer,
        isCorrect,
        marks:          isCorrect ? q.marks : 0,
      };
    });

    // Save result
    attempt.status      = "submitted";
    attempt.score       = score;
    attempt.totalMarks  = totalMarks;
    attempt.submittedAt = new Date();
    await attempt.save();

    res.status(200).json({
      message:     "Submitted successfully",
      score,
      totalMarks,
      percentage:  Math.round((score / totalMarks) * 100),
      breakdown,   // full per-question result
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// GET /api/attempts/:id/result
// Fetch result of a submitted attempt

const getResult = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }
    if (attempt.status !== "submitted") {
      return res.status(400).json({ message: "Attempt not yet submitted" });
    }

    const exam  = await Exam.findById(attempt.examId);
    const paper = await Paper.findById(exam.paperId);

    const breakdown = paper.questions.map((q, i) => {
      const studentAnswer = attempt.answers.find((a) => a.questionIndex === i);
      const selected      = studentAnswer?.selectedOption ?? null;
      const isCorrect     = selected === q.correctAnswer.toUpperCase();

      return {
        questionIndex:  i,
        questionText:   q.questionText,
        options:        q.options,
        selectedOption: selected,
        correctAnswer:  q.correctAnswer,
        isCorrect,
        marksAwarded:   isCorrect ? q.marks : 0,
        totalMarks:     q.marks,
      };
    });

    res.status(200).json({
      studentName:  attempt.studentName,
      score:        attempt.score,
      totalMarks:   attempt.totalMarks,
      percentage:   Math.round((attempt.score / attempt.totalMarks) * 100),
      startedAt:    attempt.startedAt,
      submittedAt:  attempt.submittedAt,
      timeTaken:    Math.round(
        (new Date(attempt.submittedAt) - new Date(attempt.startedAt)) / 60000
      ) + " mins",
      breakdown,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// GET /api/attempts?examId=xxx
// Get all attempts for an exam (for teacher monitoring)


const getAttemptsByExam = async (req, res) => {
  try {
    const { examId } = req.query;
    if (!examId) {
      return res.status(400).json({ message: "examId query param is required" });
    }

    const attempts = await Attempt.find({ examId }).select(
      "studentName status score totalMarks startedAt submittedAt"
    );

    const summary = {
      total:     attempts.length,
      ongoing:   attempts.filter((a) => a.status === "ongoing").length,
      submitted: attempts.filter((a) => a.status === "submitted").length,
    };

    res.status(200).json({ summary, attempts });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  startAttempt,
  saveAnswer,
  submitAttempt,
  getResult,
  getAttemptsByExam,
};