const express = require('express')

const authenticate_user = require('../middlewares/auth_middleware').authenticate_jwt
const user_controller = require('../controllers/user_controller')

const user_router = express.Router()

user_router.use(express.json())

user_router.post('/register', user_controller.register)

user_router.get('/:email', authenticate_user, user_controller.get_by_email)

user_router.post('/login', user_controller.login)

user_router.put('/:email', authenticate_user, user_controller.update)

user_router.delete('/:email', authenticate_user, user_controller.remove) 


module.exports = user_router