import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import paperRoutes from "./routes/paperRoutes.js";

dotenv.config()

const app = express();

app.use(cors())
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.use("/api/papers", paperRoutes)


app.get('/home', (req, res) => {
    res.send("Api is running!")
})


app.listen(5000, () => {console.log("the server is running")});