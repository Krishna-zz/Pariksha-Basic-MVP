const mongoose = require('mongoose')
const { type } = require('node:os')


const answerSchema = new mongoose.Schema({
    
     questionIndex:  { type: Number, required: true },
     selectedOption: { type: String, enum: ["A", "B", "C", "D", null], default: null },
}, 
{_id: false})


const attemptSchema = new mongoose.Schema(
    {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    answers: [answerSchema],

    status: {
      type: String,
      enum: ["ongoing", "submitted"],
      default: "ongoing",
    },

    score:          { type: Number, default: null },
    totalMarks:     { type: Number, default: null },
    startedAt:      { type: Date, default: Date.now },
    submittedAt:    { type: Date, default: null },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Attempt", attemptSchema)