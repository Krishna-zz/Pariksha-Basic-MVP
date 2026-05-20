const express = require('express')
const router = express.Router()

const {
  createExam,
  getAllExams,
  getExamById,
  startExam,
  endExam,
  updateExam,
  deleteExam,
} = require("../controllers/examController")


router.post ("/", createExam)
router.get ("/", getAllExams)
router.get ("/:id", getExamById)
router.patch ("/:id", updateExam)
router.patch ("/:id/start", startExam);
router.patch ("/:id/end",   endExam);
router.delete ("/:id" , deleteExam)


module.exports = router;