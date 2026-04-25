const mongoose = require("mongoose");


const questionSchema = new mongoose.Schema({
    questionText : String,
    options : [String],
    correctAnswer : String,
    marks: Number,

})

const paperSchema = new mongoose.Schema({
    title : String,
    questions : [questionSchema]
})


 const Paper = mongoose.model("Paper", paperSchema)

 module.exports = Paper;