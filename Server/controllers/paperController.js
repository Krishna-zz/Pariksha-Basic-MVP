const Paper = require("../models/Paper")

 const createPaper = async(req, res) => {
    try {
        const paper  = new Paper(req.body);
        await paper.save();
        res.status(201).json(paper);

    } catch (error) {
        res.status(500).json({message:"Error Creating paper"})
    }
}

const getPapers = async(req, res) => {
    try {
        const papers = await Paper.find()
        res.json(papers);
    } catch (error) {
        res.status(500).json({message: "Paper doesn't found"})
    }
}


module.exports = createPaper;
module.exports = getPapers;