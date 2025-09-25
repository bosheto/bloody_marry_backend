const donor_model = require('../models/donor_model')
const user_model = require('../models/user_model')

const get_by_email = async (req, res) => {
    const email = req.params.email
    
        const token = req.user
        if(email !== token.email) { 
            res.status(401).json({message: "You don't have access to this resource"})
        }
    
        try {
            const donor = await donor_model.get_by_email(email)
            if (donor === undefined) {
                res.status(404).json({message: `Donor data not present for user ${email}`})
            }
    
            res.status(200).json(donor)
        } catch (e) {
            res.status(500).json({message: 'Internal server error'})
        }
    
}

// TODO need input verification
const init = async (req, res) => {
    const email = req.params.email
        
        const token = req.user
        if(email !== token.email) { 
            res.status(401).json({message: "You don't have access to this resource"})
        }
    
        try{
            const user = await user_model.get_by_email(email)

            if(user.new === 0) {
                return res.status(400).json({message: 'Donor already initialized'})
            }
            
            const donor = {
                user_id: user.id,
                dob: req.body.dob,
                city: req.body.city,
                gender: req.body.gender
            }
    
            user.new = 0
            await donor_model.create(donor)

            res.status(201).json({message: "Donor created"})
    
        } catch (e) {
            res.status(400).json({message: "Wrong data inserted", e})
        }
}

const update = async (req, res) => {
    const email = req.params.email
    const new_city = req.body.city

    const token = req.user
    if(email !== token.email) { 
        return res.status(401).json({message: "You don't have access to this resource"})
    }

    try {
        if (new_city !== undefined)
        {
            await donor_model.change_city(email, new_city)
            return res.status(200).json({message: "Success"})
        }
        res.status(400).json({message: 'Must provide city'})
    } catch (e) {
        res.status(500).json({message: 'Internal server error'})
    }
}

const get_requests = async (req, res) => {

}

const get_request = async (req, res) => {
    
}

const create_request = async (req, res) => {
    
    const token = req.user
    if(!token) { 
        return res.status(401).json({message: "You need to be logged in to create a new request"})
    }

    // TODO add input verification
    const donor_request = {
        message: req.body.message,
        hospital: req.body.hospital,
        donation_point: req.body.donation_point,
        amount: req.body.amount,
        patient: req.body.patient,
        creator: token.id
    }
    
    try {
        await donor_model.create_donor_request(donor_request)
        res.status(200).json({message: 'Donation request created'})
    } catch (e) {
        res.status(500).json(e)
    }


}

const update_request = async (req, res) => {

}

const delete_request = async (req, res) => {

}

module.exports = {
    get_by_email,
    init,
    update,
    get_requests,
    get_request,
    get_requests,
    create_request,
    update_request,
    delete_request
    // remove
}