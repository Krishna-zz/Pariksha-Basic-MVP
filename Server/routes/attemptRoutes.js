const express = require('express')
const router = express.Router()

const {
  startAttempt,
  saveAnswer,
  submitAttempt,
  getResult,
  getAttemptsByExam,
} = require('../controllers/attemptController')

router.post("/start", startAttempt)
router.get("/", getAttemptsByExam)
router.patch("/:id/answer", saveAnswer)
router.post("/:id/submit", submitAttempt)
router.get("/:id/result", getResult)


module.exports = router;