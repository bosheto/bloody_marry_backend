const donor_controller = require('../controllers/donor_controller')
const donor_model = require('../models/donor_model')
const user_model = require('../models/user_model')

jest.mock('../models/donor_model')
jest.mock('../models/user_model')

describe('donor_controller.get_by_email', () => {
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

    it('should return 401 if user not authorized', async () => {
        req.user.email = 'other@example.com'

        await donor_controller.get_by_email(req, res)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({message: "You don't have access to this resource"})
    })

    it('should return 404 if no user found', async () => {
        donor_model.get_by_email.mockResolvedValue(undefined)

        await donor_controller.get_by_email(req, res)

        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({message: `Donor data not present for user ${req.params.email}`})

    })

    it('should return donor', async () => {
        const fake_donor = {id: 1, email: req.user.email}
        donor_model.get_by_email.mockResolvedValue(fake_donor)

        await donor_controller.get_by_email(req, res)

        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(fake_donor)
    
    })

    it('should return 500 if error', async () => {
        donor_model.get_by_email.mockRejectedValue(new Error ('SQL Error'))

        await donor_controller.get_by_email(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({message: 'Internal server error'})
    })
}) 

describe('donor_controller.init', () => {
    let req, res
    
    beforeEach(() => {
        req = {
            params: { email: 'test@example.com' },
            user: { email: 'test@example.com' },
            body: {dob: '17/09/1996', city: 'Sofia', gender: 'Male'}
        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
    })

    it('should return 401 if user not authorized', async () => {
        req.user.email = 'other@example.com'

        await donor_controller.init(req, res)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({message: "You don't have access to this resource"})
    })

    it('should return 400 if donor already initiated', async () => {
        user_model.get_by_email.mockResolvedValue({id: 1, new: 0})

        await donor_controller.init(req, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({message: 'Donor already initialized'})
    })

    it('should return 201 if donor initialized', async () => {
        user_model.get_by_email.mockResolvedValue({id: 1, new: 1})
        donor_model.create.mockResolvedValue({})

        await donor_controller.init(req, res)

        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith({message: "Donor created"})

    })
})

describe('donor_controller.init', () => {
    let req, res
    
    beforeEach(() => {
        req = {
            params: { email: 'test@example.com' },
            user: { email: 'test@example.com' },
            body: {city: 'Vratza'}
        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
    })

    it('should return 401 if not authorized', async () => {
        req.user.email = 'other@example.com'

        await donor_controller.update(req, res)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({message: "You don't have access to this resource"})
        
    })

    it('should return 400 if no city provided', async () => {
        req.body.city = undefined

        await donor_controller.update(req, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({message: 'Must provide city'})
    })

    it('should return 200 if update successful', async () => {
        donor_model.change_city.mockResolvedValue({})

        await donor_controller.update(req, res)

        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith({message: 'Success'})
    })

    it('should return 500 if error', async () => {
        donor_model.change_city.mockRejectedValue(new Error ('SQL error'))

        await donor_controller.update(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({message: 'Internal server error'})
    })
})