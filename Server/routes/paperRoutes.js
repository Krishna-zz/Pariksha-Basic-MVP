const express = require("express");
const  { createPaper, getPapers } = require("../controllers/paperController")


const router = express.Router();

router.post("/", createPaper);
router.get("/", getPapers)


module.exports =  router;
