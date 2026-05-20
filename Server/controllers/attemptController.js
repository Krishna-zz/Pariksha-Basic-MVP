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

    
    } catch (error) {
        
    }
}