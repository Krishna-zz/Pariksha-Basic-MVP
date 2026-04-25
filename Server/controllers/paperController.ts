import { Request, Response } from "express";
import { Paper } from "../models/Paper";

export const createPaper = async(req: Request, res: Response) => {
    try {
        const paper  = new Paper(req.body);
        await paper.save();
        res.status(201).json(paper);

    } catch (error) {
        res.status(500).json({message:"Error Creating paper"})
    }
}

export const getPapers = async(req: Request, res: Response) => {
    try {
        const papers = await Paper.find()
        res.json(papers);
    } catch (error) {
        res.status(500).json({message: "Paper doesn't found"})
    }
}