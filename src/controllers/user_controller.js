const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const user_model = require('../models/user_model')
const { getDateTimeForDB } = require('../utils')

const get_by_email = async (req, res) => {
    const email = req.params.email
    
    const token = req.user
    if(token === undefined || email !== token.email) { 
        res.status(401).json({message: "You don't have access to this resource"})
    }

    try {
        const user = await user_model.get_by_email(email)
        res.json(user)
    } catch (e) {
        res.status(404).json({message: `User with email ${email} not found.`})
    }
}


const register = async (req, res) => {
    
    try {

        if(req.body.email === undefined || req.body.password === undefined){
            return res.status(400).json({message: "Please provide email and password"})
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = {
            email: req.body.email,
            password: hashedPassword,
            role: 1,
        }

        const check = await user_model.get_by_email(user.email)
        if (check) {
            return res.status(400).json(`User with email ${user.email} already exists`)
        }
        
        await user_model.create(user)
        res.status(201).json({message: "user created"})
    } catch (e) { 
        res.status(500).json(e)
    }
}


const login = async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    
    if(req.body.email === undefined || req.body.password === undefined){
        return res.status(400).json({message: "Please provide email and password"})
    }    

    try {

        const user = await user_model.get_by_email(email)

        if (!user) {
            return res.status(404).json({message: `No user found with email ${email}`})
        }
        const role_name = await user_model.get_role_name(user.role)
        
            if (await bcrypt.compare(password, user.password)) {
                const payload = {
                    id: user.id,
                    email: email,
                    role: role_name.role_name
                }
                const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1h"})
                await user_model.update_login_date(user.id, getDateTimeForDB())
                
                return res.status(200).json({message: 'Login successful ', token})
            } else {
                return res.status(401).json({message: "Wrong credentials"})
            }
    

    } catch (e) {
        res.status(500).json({message: 'internal server error'})
    }
} 


const update = async (req, res) => {
    const email = req.params.email
    
    const token = req.user
    if(token === undefined || email !== token.email) { 
        return res.status(401).json({message: "You don't have access to this resource"})
    }

    if (!req.body || Object.keys(req.body).length === 0){
        return res.status(402).json({message: 'Body cannot be empty'})
    }

    try {
        const caller = await user_model.get_by_email(email)

        const new_user_data = {
            email: req.body.email,
            password: req.body.password,
            id: caller.id
        }

        if(new_user_data.password !== undefined){
            const hashedPassword = await bcrypt.hash(new_user_data.password, 10)
            new_user_data.password = hashedPassword
        }

        await user_model.update_credentials(new_user_data)
        return res.status(200).json({message: "user updated"})
    } catch (e) {
        res.status(500).json({message: "internal server error"})
    }
}


const remove = async (req, res) => {
     const email = req.params.email
        
        try {
            const user = await user_model.get_by_email(email)
            
            // User role
            if ( user.role === 1) {
                const token = req.user
                if(token === undefined || email !== token.email) { 
                    return res.status(401).json({message: "You don't have access to this resource"})
                }
                user_model.remove_donor(user)
            }
            
    
            res.status(200).json({message: 'user deleted'})
       } catch (e) {
            return res.status(404).json({message: `No user found with email: ${email}`})
    
       }
}


module.exports = {
    get_by_email,
    register,
    login,
    update,
    remove
}