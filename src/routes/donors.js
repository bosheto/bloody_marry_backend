const express = require('express')
const db = require('../database')
const uuidV6 = require('uuid').v6
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const authenticate_user = require('../middleware/auth_middleware').authenticate_jwt

const donor_router = express.Router()

donor_router.use(express.json())

donor_router.get('/', (req, res) => {
    res.send('Ok')
})

// Register User
donor_router.post('/register', async (req, res) => {
   
    try {
        
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        const user = {
            uuid: uuidV6(),
            email: req.body.email,
            password: hashedPassword,
            role: 1,
        }

        const check = await db.get_user_by_email(user.email )
        if (check) {
            return res.status(400).json(`User with email ${user.email} already exists`)
        }
        
        await db.create_user(user)
        res.status(201).json({message: "user created"})
    } catch (e) { 
        res.status(500).send(e)
    }
})

// Get user data
donor_router.get('/user/:email', authenticate_user,  async (req, res) => {
    const email = req.params.email

    const token = req.user
    if(email !== token.email) { 
        res.status(401).json({message: "You don't have access to this resource"})
    }

    try {
        const user = await db.get_user_by_email(email)
        res.json(user)
    } catch (e) {
        res.status(404).json({message: `User with email ${email} not found.`})
    }
})

// Get donor data
donor_router.get('/:email', authenticate_user, async (req, res) => {
    const email = req.params.email

    const token = req.user
    if(email !== token.email) { 
        res.status(401).json({message: "You don't have access to this resource"})
    }

    try {
        const user = await db.get_user_by_email(email)
        if(user === undefined) {
            res.status(404).json({message: `No user with email ${email}`})
        }

        const donor = await db.get_donor_by_user_id(user.id)
        if (donor === undefined) {
            res.status(404).json({message: `Donor data not present for user ${user.email}`})
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
            age: req.body.age,
            city: req.body.city,
            gender: req.body.gender
        }

        user.new = 0

        await db.create_donor(donor)
        await db.update_user(user)
        res.status(201).json({message: "Donor created"})

    } catch (e) {
        res.status(400).json(e)
    }
})

// TODO finish this function
// Update donor information
donor_router.put('/:uuid', async (req, res) => {
    const uuid = req.params.uuid

    try {

        const user = await db.get_user_by_uuid(uuid)
        if (user === undefined) {
            return res.status(404).json({message: `no user with uuid ${uuid}`})
        }

        const donor = await db.get_donor_by_user_id(user.id)
        if (donor === undefined) {
            return res.status(404).json({message: `no donor with found for user`})
        }

        const updated_user = {
            
        }

    } catch (e) {
        res.status(500).send()
    }
})

// Delete donor
donor_router.delete('/:email', authenticate_user, async (req, res) => {
    const email = req.params.email
    
   try {
        const user = await db.get_user_by_email(email)
        
        await db.delete_donor(user.id)
        await db.delete_user(user.uuid)
        res.status(200).json({message: 'user deleted'})
   } catch (e) {
        return res.status(404).json({message: `No user found with email: ${email}`})

   }
}) 

// Login
donor_router.post('/login', async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    try {

        const user = await db.get_user_by_email(email)
        
        if (!user) {
            return res.status(404).json({message: `No user found with email ${email}`})
        }
        const role_name = await db.get_role_name(user.role)
        
        try {

            if (await bcrypt.compare(password, user.password)) {
                const payload = {
                    id: user.uuid,
                    email: email,
                    role: role_name.role_name
                }
                const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1h"})
                res.json({message: 'Login successful ', token, uuid: user.uuid})
            } else {
                res.status(401).json({message: "Wrong credentials"})
            }
        } catch (e) {
            res.status(500).json({message: "internal server error"})
        }

    } catch (e) {
        res.status(500).json({message: 'internal server error'})
    }



})

// Utils 


module.exports = donor_router