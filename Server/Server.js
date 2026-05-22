const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors")
const cookieParser = require("cookie-parser"); 
const paperRoutes = require("./routes/paperRoutes")
const mongoose = require("mongoose");
const { log } = require("console");
const examRoutes = require("./routes/examRoutes")
const attemptRoutes = require("./routes/attemptRoutes")
const authRoutes = require("./routes/authroutes");

dotenv.config()

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your exact frontend URL
    credentials: true,               // Allows cookies to be sent back and forth
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())


mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Mongodb Connected"))
.catch(err => console.log(err)
)

app.use("/api/auth", authRoutes)
app.use("/api/papers", paperRoutes) 
app.use("/api/exams", examRoutes)
app.use("/api/attempts", attemptRoutes);






app.listen(5000, () => {console.log("the server is running on port 5000")});