const express = require('express')
const authenticate_user = require('../middlewares/auth_middleware').authenticate_jwt
const donor_controller = require('../controllers/donor_controller')

const donor_router = express.Router()
donor_router.use(express.json())

// Get donor data
donor_router.get('/:email', authenticate_user, donor_controller.get_by_email)

// Configure donor
donor_router.post('/init/:email', authenticate_user, donor_controller.init)

// Update donor information, change city
donor_router.put('/:email', authenticate_user, donor_controller.update)

// Get donation requests
donor_router.get('/requests', authenticate_user, donor_controller.get_requests)

// Get donation request 
donor_router.get('/request:id', authenticate_user, donor_controller.get_request)

// Create donation request
donor_router.post('/request', authenticate_user, donor_controller.create_request)

// Update donation request
donor_router.put('/request:id', authenticate_user, donor_controller.update_request)

// Delete request
donor_router.delete('/request:id', authenticate_user, donor_controller.delete_request)

module.exports = donor_router