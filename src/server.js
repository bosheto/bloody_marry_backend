require('dotenv').config()

const express = require('express')

const dr = require('./routes/donors')
const ar = require ('./routes/admin')

const PORT = process.env.WS_PORT
const BASE_URL = process.env.WS_BASE_URL

const app = express()

// App config
app.use(express.json())

// Routes 
app.use(BASE_URL + 'donor' , dr)
app.use(BASE_URL + 'admin', ar)

// Endpoints
app.get(BASE_URL, (req, res) => {
    res.status(200).json({
        message: "API home"
    })
})

// Run server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})
