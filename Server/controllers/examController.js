const Exam = require("../models/Exam")
const Paper = require("../models/Paper")


const createExam = async(req, res) => {
    try {
        const { paperId, title, scheduledAt, durationMinutes, antiCheat } = req.body;
        
        //validate if paper exists
        const paper = await Paper.findById(paperId)
        if(!paper){
             return res.status(404).json({message: "Paper not found"})
             }

          // Validate required fields
      if (!title || !scheduledAt || !durationMinutes) {
      return res.status(400).json({ message: "title, scheduledAt, and durationMinutes are required" });
    }    

    const exam = await Exam.create({
        paperId,
      title,
      scheduledAt,
      durationMinutes,
      antiCheat: antiCheat || {},
    })

     res.status(201).json({ message: "Exam created successfully", exam });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}


const getExamById = async(req, res) => {
    try {
        const exam = await Exam.findById(req.params.id).populate("paperId", "title questions");

        if(!exam){
            return res.status(404).json({message: "Exam not found"})
        }

        res.status(200).json(exam)
    } catch (err) {
        res.status(500).json({message: "Server error", error: err.message})
    }
}

// PATCH /api/exams/:id/start
// Start the exam → status becomes "live"

const startExam = async(req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
          return res.status(404).json({ message: "Exam not found" });
         }

        if (exam.status === "live"){
            return res.status(400).json({message: "Exam is already live"})
        }

        if (exam.status === "ended"){
            return res.status(400).json({message : "Exam has already ended"})
        }

        exam.status = "live";
        exam.startedAt = new Date();
        await exam.save();

    } catch (err) {
        return res.status(500).json({message:"Server error", error: err.message})
    }
}