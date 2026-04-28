const Paper = require("../models/Paper")

 const createPaper = async(req, res) => {                //Create and save paper
    try {
        const paper  = new Paper(req.body);              //create a new Paper document using req.body data
        await paper.save();                             //save to the database
        res.status(201).json(paper);

    } catch (error) {
        res.status(500).json({message:"Error Creating paper"})
    }
}

const getPapers = async(req, res) => {
    try {
        const papers = await Paper.find()                               //get (find) the papers from the database
        res.json(papers);                                              //send the paper document data to the frontend
    } catch (error) {
        res.status(500).json({message: "Paper doesn't found"})
    }
}


module.exports = {
    createPaper,
    getPapers
};
