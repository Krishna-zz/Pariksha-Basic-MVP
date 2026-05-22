const express = require('express')
const router = express.Router()
const { protect, teacherOnly } = require("../Middleware/auth");

const {
  createExam,
  getAllExams,
  getExamById,
  startExam,
  endExam,
  updateExam,
  deleteExam,
} = require("../controllers/examController")


router.use(protect, teacherOnly);    //now protected routes are applied to all routes below


router.post ("/", createExam)
router.get ("/", getAllExams)
router.get ("/:id", getExamById)
router.patch ("/:id", updateExam)
router.patch ("/:id/start", startExam);
router.patch ("/:id/end",   endExam);
router.delete ("/:id" , deleteExam)


module.exports = router;