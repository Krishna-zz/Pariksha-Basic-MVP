const Paper = require("../models/Paper")

 const createPaper = async(req, res) => {                //Create and save paper
    try {
        const paper  = new Paper(req.body);              //create
        await paper.save();                             //save
        res.status(201).json(paper);

    } catch (error) {
        res.status(500).json({message:"Error Creating paper"})
    }
}

const getPapers = async(req, res) => {
    try {
        const papers = await Paper.find()                               //get the paper(to frontend)
        res.json(papers);
    } catch (error) {
        res.status(500).json({message: "Paper doesn't found"})
    }
}


module.exports = {
    createPaper,
    getPapers
};
