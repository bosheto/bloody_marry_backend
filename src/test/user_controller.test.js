const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const user_controller = require('../controllers/user_controller')
const user_model = require('../models/user_model')


jest.mock('../models/user_model')
jest.mock('bcrypt')
jest.mock('jsonwebtoken')


describe('user_controller.get_by_email', () => {
    let req, res

    beforeEach(() => {
        req = {
            params: { email: 'test@example.com' },
            user: { email: 'test@example.com' }
        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
    })

    it('should return user if found and authorized', async () => {
        const fakeUser = { id: 1, email: 'test@example.com' }
        user_model.get_by_email.mockResolvedValue(fakeUser)

        await user_controller.get_by_email(req, res)

        expect(user_model.get_by_email).toHaveBeenCalledWith('test@example.com')
        expect(res.json).toHaveBeenCalledWith(fakeUser)
    })

    it('should return 401 if not authorized', async () => {
        req.user.email = 'other@example.com'

        await user_controller.get_by_email(req, res)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({message: "You don't have access to this resource"})
    })

    it('should return 404 if user not found', async () => {
        user_model.get_by_email.mockRejectedValue(new Error('Not found'))

        await user_controller.get_by_email(req, res)

        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({message: `User with email test@example.com not found.`})
    })
})

describe('user_controller.register', () => {
    let req, res

    beforeEach(() => {
        req = {
            body: {
                email: 'test@example.com',
                password: 'test_password'
            }
        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        bcrypt.hash.mockResolvedValue('hashed_password')
    })

    it('should create a user of email is not taken', async () => {
        user_model.get_by_email.mockResolvedValue(undefined)
        user_model.create = jest.fn().mockResolvedValue({})

        await user_controller.register(req, res)

        expect(user_model.get_by_email).toHaveBeenCalledWith('test@example.com')
        expect(user_model.create).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith({message: "user created"})
    })

    it('should return 400 if email already exists', async () => {
        user_model.get_by_email.mockResolvedValue({email: 'test@example.com'})

        await user_controller.register(req, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith(`User with email test@example.com already exists`)
        
    })

    it('should return 400 if no user passed', async () => {
        user_model.get_by_email.mockResolvedValue(undefined)

        req.body.email = undefined
        req.body.password = undefined
        await user_controller.register(req, res)

        expect(res.status).toHaveBeenCalledWith(400)

    })

    it('should return 500 if there is an error', async () => {
        user_model.get_by_email.mockRejectedValue(new Error ('SQL error'))

        await user_controller.register(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
    })

    
})

describe('user_controller.login', () => {
    let req, res

    beforeEach(() => {
        req = {
            body: {
                email: 'test@example.com',
                password: 'test_password'
            }
        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
    })

    it('should return 404 if no user found', async () => {
        user_model.get_by_email.mockResolvedValue(undefined)

        await user_controller.login(req, res)

        expect(res.status).toHaveBeenCalledWith(404)
    })

    it('should return 200 when login successful', async () => {
        user_model.get_by_email.mockResolvedValue({id:0, email: 'test@example.com', password: 'test_password'})
        user_model.get_role_name.mockResolvedValue({role_name: 'donor'})
        jwt.sign.mockResolvedValue('token')
        bcrypt.compare.mockResolvedValue(true)

        await user_controller.login(req, res)

        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalled()
    })

    it('should return 401 when credentials are wrong', async () => {
        user_model.get_by_email.mockResolvedValue({id:0, email: 'test@example.com', password: 'test_password'})
        user_model.get_role_name.mockResolvedValue({role_name: 'donor'})
        
        bcrypt.compare.mockResolvedValue(false)
        
        await user_controller.login(req, res)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalled()
    })

    it('should return 400 when no credentials are passed', async () => {
        req.body.password = undefined
        req.body.email = undefined
        
        await user_controller.login(req, res)

        expect(res.status).toHaveBeenCalledWith(400)
    
    })

    it('should return 500 if error', async () => {
        user_model.get_by_email.mockRejectedValue(new Error ('SQL error'))

        await user_controller.login(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
    })
})


describe('user_controller.update', () => {
    let req, res

    beforeEach(() => {
        req = {
            body: {
                email: 'test@example.com',
                password: 'test_password'
            },
            user: { email: 'test@example.com'},
            params: { email: 'test@example.com' }

        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
    })

    it('should return 401 if not authorized', async () => {
        req.user.email = 'other@example.com'

        await user_controller.update(req, res)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({message: "You don't have access to this resource"})
    })

    it('should return 402 if no request body', async () => {
        req.body = undefined
        
        await user_controller.update(req, res)

        expect(res.status).toHaveBeenCalledWith(402)
        expect(res.json).toHaveBeenCalledWith({message: 'Body cannot be empty'})
    })

    it('should return 402 if request body is empty', async () => {
        req.body = {}

        await user_controller.update(req, res)

        expect(res.status).toHaveBeenCalledWith(402)
        expect(res.json).toHaveBeenCalledWith({message: 'Body cannot be empty'})
    })

    it('should return 200 if user updated successfully', async () => {
        user_model.get_by_email.mockResolvedValue({id:1, email:req.email, password:req.password})
        bcrypt.hash.mockResolvedValue('password')
        user_model.update_credentials =  jest.fn().mockResolvedValue({})

        await user_controller.update(req, res)

        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith({message: "user updated"})
    })

    it('should return 500 if get_by_email error', async () => {
        user_model.get_by_email.mockRejectedValue(new Error ('SQL error'))

        await user_controller.update(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
    })

     it('should return 500 if update error', async () => {
        user_model.get_by_email.mockResolvedValue({id:1, email:req.email, password:req.password})
        bcrypt.hash.mockResolvedValue('password')
        user_model.update_credentials.mockRejectedValue(new Error ('SQL error'))

        await user_controller.update(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
    })
})


describe('user_controller.remove', () => {
     let req, res

    beforeEach(() => {
        req = {
            user: { email: 'test@example.com'},
            params: { email: 'test@example.com' }

        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
    })

    it('should return 401 if not logged in', async () => {
        req.user = undefined
        user_model.get_by_email.mockResolvedValue({role: 1})

        await user_controller.remove(req, res)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({message: "No login token provided"})
    })

    it('should return 404 if no user found', async () => {
        user_model.get_by_email.mockResolvedValue(undefined)

        await user_controller.remove(req, res)

        expect(res.status).toHaveBeenCalledWith(404)
    })

    it('should return 200 if deleted user', async () => {
        user_model.get_by_email.mockResolvedValue({role: 1})
        user_model.remove_donor.mockResolvedValue({})

        await user_controller.remove(req, res)

        expect(res.status).toHaveBeenCalledWith(200)
    })

    //TODO once proper logic is implemented finish this test

    // it('should return 500 if get_by_email error', async () => {
    //     user_model.get_by_email.mockRejectedValue(new Error ('SQL error'))
        
    //     await user_controller.remove(req, res)

    //     expect(res.status).toHaveBeenCalledWith(500)
    // })
})