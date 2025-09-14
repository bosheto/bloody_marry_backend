const express = require('express')
const db = require('../database')

const admin_router = express.Router()

admin_router.get('/users', async (req, res) => {
    try {
        const users = await db.get_all_users()
        res.json(use)
    } catch (e) {
        return res.status(500).send()
    }
})

module.exports = admin_router