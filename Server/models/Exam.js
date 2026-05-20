const mongoose = require('mongoose')

const examSchema = new mongoose.Schema({

    paperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Paper",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["scheduled", "live", "ended"],
      default: "scheduled",
    },
    antiCheat: {
      shuffleQuestions: { type: Boolean, default: false },
      shuffleOptions:   { type: Boolean, default: false },
      fullscreenRequired: { type: Boolean, default: false },
    },
    startedAt: { type: Date, default: null },
    endedAt:   { type: Date, default: null },
},
 {timestamps: true})

 module.exports = mongoose.model("Exam", examSchema)
