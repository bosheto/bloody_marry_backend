const express = require('express')
const db = require('../database')

// const BASE_URL = process.env.BASE_URL + "donor"
const donor_router = express.Router()

donor_router.use(express.json())

donor_router.get('/', (req, res) => {
    res.send('Ok')
})

// Register
donor_router.post('/register', (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password,
        role: 1,
    }

    res.status(201).json({message: "user created"})
})

// Get donor data
donor_router.get('/:email', async (req, res) => {
    const email = req.params.email

    try {
        const user = await db.get_user_by_email(email)
        res.json(user)
    } catch (e) {
        res.status(404).json({message: `User with email ${email} not found.`})
    }
})

// Configure donor
donor_router.post('/init/:email', async (req, res) => {
    const email = req.params.email
    
    try{
        const user = await db.get_user_by_email(email)

        if(user.new == 0) {
            return res.status(400).json({message: 'Donor already initialized'})
        }
        
        const donor = {
            user_id: user.id,
            age: req.body.age,
            city: req.body.city,
            gender: req.body.gender
        }

        user.new = 0

        let result = await db.create_donor(donor)
        result = await db.update_user(user)
        res.status(201).json({message: "Donor created"})

    } catch (e) {
        res.status(400).json(e)
    }
})




module.exports = donor_router