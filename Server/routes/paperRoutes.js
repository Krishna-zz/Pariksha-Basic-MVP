const express = require("express");
const createPaper = require("../models/Paper")
const getPapers = require("../models/Paper")

const router = express.Router();

router.post("/", createPaper);
router.get("/", getPapers)

module.exports =  router;
