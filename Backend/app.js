require("dotenv").config();
const express = require('express')
const cors = require('cors')
const DbConnect = require('./db/db.js');
const router = require("./routes/userRoute.js");

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors())
DbConnect()


// app.use('/', (req, res) => {
//     res.send('Hello wolrd!')
// })

app.use('/api/v1/user', router)

module.exports = app