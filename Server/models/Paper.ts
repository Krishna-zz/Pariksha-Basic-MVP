import mongoose from "mongoose";


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


export const Paper = mongoose.model("Paper", paperSchema)