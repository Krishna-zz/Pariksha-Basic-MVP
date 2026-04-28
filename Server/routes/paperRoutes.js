const express = require("express");
const createPaper = require("../controllers/paperController")
const getPapers = require("../controllers/paperController")

const router = express.Router();

router.post("/", createPaper);
router.get("/", getPapers)


module.exports =  router;
