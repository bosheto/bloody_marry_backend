const express = require('express')
const db = require('../database')
const authenticate_user = require('../middleware/auth_middleware').authenticate_jwt

const donor_router = express.Router()

donor_router.use(express.json())

donor_router.get('/', (req, res) => {
    res.send('Ok')
})

// Get donor data
donor_router.get('/:email', authenticate_user, async (req, res) => {
    const email = req.params.email

    const token = req.user
    if(email !== token.email) { 
        res.status(401).json({message: "You don't have access to this resource"})
    }

    try {
        const donor = await db.get_donor_by_email(email)
        if (donor === undefined) {
            res.status(404).json({message: `Donor data not present for user ${email}`})
        }

        res.status(200).json(donor)
    } catch (e) {
        res.status(500).json({message: 'Internal server error'})
    }

})

// Configure donor
donor_router.post('/init/:email', authenticate_user, async (req, res) => {
    const email = req.params.email
    
    const token = req.user
    if(email !== token.email) { 
        res.status(401).json({message: "You don't have access to this resource"})
    }

    try{
        const user = await db.get_user_by_email(email)

        if(user.new == 0) {
            return res.status(400).json({message: 'Donor already initialized'})
        }
        
        const donor = {
            user_id: user.id,
            dob: req.body.dob,
            city: req.body.city,
            gender: req.body.gender
        }

        user.new = 0

        await db.create_donor(donor)
        await db.update_user_new(user)
        res.status(201).json({message: "Donor created"})

    } catch (e) {
        res.status(400).json({message: "Wrong data inserted", e})
    }
})

// Update donor information, change city
donor_router.put('/:email', authenticate_user, async (req, res) => {
    const email = req.params.email
    const new_city = req.body.city

    const token = req.user
    if(email !== token.email) { 
        return res.status(401).json({message: "You don't have access to this resource"})
    }

    try {
        if (new_city !== undefined)
        {
            await db.change_donor_city(email, new_city)
        }
        res.json({message: "Success"})
    } catch (e) {
        res.status(500).send()
    }
})


module.exports = donor_router