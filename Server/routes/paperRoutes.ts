import express from "express";
import { createPaper, getPapers } from "../controllers/paperController";

const router = express.Router();

router.post("/", createPaper);
router.get("/", getPapers)

export default router;
