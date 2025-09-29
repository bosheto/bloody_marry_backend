const express = require('express')
const donation_controller = require('../controllers/donation_controller')
const authenticate_user = require('../middlewares/auth_middleware').authenticate_jwt


const donation_router = express.Router()
donation_router.use(express.json)


// Create donation request
donation_router.post('', authenticate_user, donation_controller.create)

// Update donation request
donation_router.put('/:id', authenticate_user, donation_controller.update)

// Close donation request
donation_router.post('/close/:id', authenticate_user, donation_controller.close)

// Delete donation request
donation_router.delete('/:id', authenticate_user, donation_controller.remove)

// Get all donation requests
donation_router.get('', authenticate_user, donation_controller.get_all)

// Get single donation request
donation_router.get('/:id', authenticate_user, donation_controller.get_by_id)

module.exports = donation_router