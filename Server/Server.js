const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors")
const paperRoutes = require("./routes/paperRoutes")

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