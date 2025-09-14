const express = require('express')
const db = require('../database')
const uuidV6 = require('uuid').v6

const donor_router = express.Router()

donor_router.use(express.json())

// Utils 
const check_user_by_uuid = async (uuid) => {
    const user = await db.get_user_by_uuid(uuid)
    if (user) {
        return true
    } 
    return false 
}

donor_router.get('/', (req, res) => {
    res.send('Ok')
})

// Register User
donor_router.post('/register', async (req, res) => {
   
    try {
        const user = {
            uuid: uuidV6(),
            email: req.body.email,
            password: req.body.password,
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
donor_router.get('/user/:uuid', async (req, res) => {
    const uuid = req.params.uuid

    try {
        const user = await db.get_user_by_uuid(uuid)
        res.json(user)
    } catch (e) {
        res.status(404).json({message: `User with uuid ${uuid} not found.`})
    }
})

// Get donor data
donor_router.get('/:uuid', async (req, res) => {
    const uuid = req.params.uuid

    try {
        const user = await db.get_user_by_uuid(uuid)
        
        if(user === undefined) {
            res.status(404).json({message: `No user with uuid ${uuid}`})
        }

        const donor = await db.get_donor_by_user_id(user.id)
        if (donor === undefined) {
            res.status(404).json({message: `Donor data not present for user ${user.email}`})
        }

        res.status(200).json(donor)
    } catch (e) {
        res.status(500).json({message: e})
    }

})

// Configure donor
donor_router.post('/init/:uuid', async (req, res) => {
    const uuid = req.params.uuid
    
    try{
        const user = await db.get_user_by_uuid(uuid)

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
donor_router.delete('/:uuid', async (req, res) => {
    const uuid = req.params.uuid
    
   try {
        const user = await db.get_user_by_uuid(uuid)

        if(user === undefined) {
            return res.status(404).json({message: `No user found with uuid: ${uuid}`})
        }
        
        await db.delete_donor(user.id)
        await db.delete_user(uuid)
        res.status(200).json({message: 'user deleted'})
   } catch (e) {
        res.status(500).json({message: e})
   }
}) 

module.exports = donor_router