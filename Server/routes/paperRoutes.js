const express = require("express");
const  { createPaper, getPapers } = require("../controllers/paperController")
const { protect, teacherOnly } = require("../Middleware/auth");


const router = express.Router();

router.post("/", protect, teacherOnly, createPaper);
router.get("/", protect, teacherOnly, getPapers)


module.exports =  router;
