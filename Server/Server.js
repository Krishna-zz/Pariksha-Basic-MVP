const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors")
const paperRoutes = require("./routes/paperRoutes")
const mongoose = require("mongoose");
const { log } = require("console");
const examRoutes = require("./routes/examRoutes")

dotenv.config()

const app = express();

app.use(cors())
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));


mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Mongodb Connected"))
.catch(err => console.log(err)
)


app.use("/api/papers", paperRoutes) 

app.use("/api/exams", examRoutes)





app.listen(5000, () => {console.log("the server is running on port 5000")});