import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config()

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/home', (req, res) => {
    res.send("the server is on!")
})


app.listen(3000, () => {console.log("the server is running")}) ;