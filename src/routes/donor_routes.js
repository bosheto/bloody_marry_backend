const express = require('express')
const authenticate_user = require('../middlewares/auth_middleware').authenticate_jwt
const donor_controller = require('../controllers/donor_controller')

const donor_router = express.Router()
donor_router.use(express.json())


// Configure donor
donor_router.post('/init/:email', authenticate_user, donor_controller.init)

// Update donor information, change city
donor_router.put('/:email', authenticate_user, donor_controller.update)

// Get donor data
donor_router.get('/:email', authenticate_user, donor_controller.get_by_email)


module.exports = donor_router