require('dotenv').config()

const express = require('express')

const donor_router = require('./routes/donor_routes')
const admin_router = require ('./routes/admin')
const user_router = require('./routes/user_routes')

const PORT = process.env.WS_PORT
const BASE_URL = process.env.WS_BASE_URL

const app = express()

// App config
app.use(express.json())

// Routes 
app.use(BASE_URL + 'donor' , donor_router)
app.use(BASE_URL + 'admin', admin_router)
app.use(BASE_URL + 'user', user_router)

// Run server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})
