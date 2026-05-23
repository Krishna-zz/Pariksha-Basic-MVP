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

// ✅ 1. Apply ONLY 'protect' to the whole file. 
// This ensures everyone (Teachers AND Students) must be logged in.
router.use(protect); 

// ✅ 2. Open this specific route to BOTH Students and Teachers
router.get("/:id", getExamById);

// ✅ 3. Lock all these management routes to TEACHERS ONLY
router.post("/", teacherOnly, createExam);
router.get("/", teacherOnly, getAllExams); // Students shouldn't see the whole dashboard
router.patch("/:id", teacherOnly, updateExam);
router.patch("/:id/start", teacherOnly, startExam);
router.patch("/:id/end", teacherOnly, endExam);
router.delete("/:id", teacherOnly, deleteExam);

module.exports = router;