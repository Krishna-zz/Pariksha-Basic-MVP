const express = require('express')
const router = express.Router()
const { protect, studentOnly, teacherOnly } = require("../Middleware/auth");

const {
  startAttempt,
  saveAnswer,
  submitAttempt,
  getResult,
  getAttemptsByExam,
} = require('../controllers/attemptController')

//Teacher route for live monitoring
router.get("/",protect, teacherOnly, getAttemptsByExam)


//Student routes for taking the exam
router.post("/start",protect, studentOnly, startAttempt)
router.patch("/:id/answer",protect, studentOnly, saveAnswer)
router.post("/:id/submit",protect, studentOnly, submitAttempt)
router.get("/:id/result",protect, studentOnly, getResult)


module.exports = router;