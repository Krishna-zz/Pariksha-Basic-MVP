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

    
    } catch (error) {
        
    }
}