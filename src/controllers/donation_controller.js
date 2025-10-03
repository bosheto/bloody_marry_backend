const donation_model = require('../models/donation_model')
const user_model = require('../models/user_model')

const get_all = async (req, res) => {
   const token = req.user
    if(!token) { 
        return res.status(401).json({message: "You need to be logged in to create a new request"})
    }

    try{ 
        const requests = await donation_model.get_all()
        
        if (requests.length === 0) {
            return res.status(404).json({message: "no requests found"})
        }
        else {

            res.status(200).json(requests)
        }


    } catch (e) {
        res.status(500).json({message: 'internal server error'})
    }
}

const get_by_id = async (req, res) => {
    const request_id = req.params.id
    const token = req.user
    if(!token) { 
        return res.status(401).json({message: "You need to be logged in to create a new request"})
    }

    if(!request_id){
        return res.status(406).json({message: "No id provided"})
    }

    try {
        const result = await donation_model.get_by_id(request_id)
        return res.status(200).json(result)
    } catch (e) {
        return res.status(500).json({message: 'Internal server error', e})
    } 
}

const create = async (req, res) => {
    const token = req.user
    if(!token) { 
        return res.status(401).json({message: "You need to be logged in to create a new request"})
    }

    // TODO add input verification
    const donation_request = {
        message: req.body.message,
        hospital: req.body.hospital,
        donation_point: req.body.donation_point,
        amount: req.body.amount,
        patient: req.body.patient,
        creator: token.id
    }
    
    try {
        await donation_model.create(donation_request)
        res.status(200).json({message: 'Donation request created'})
    } catch (e) {
        res.status(500).json(e)
    }
}

const update = async (req, res) => {
    const token = req.user
    const request_id = req.params.id
    

    if(!token) {
        return res.status(401).json({message: 'You need to be logged in to create a donation request'})
    }

    if(!request_id){
        return res.status(406).json({message: 'No id provided, please provide id of donation request you want to upgrade'})
    }

    if(!req.body){
        return res.status(406).json({message: 'No body provided in POST method'})
    }

    try {
        const old_request = await donation_model.get_by_id(request_id)
        
        if(old_request === undefined) {
            return res.status(404).json({message: `No request with ${request_id} found`})
        }

        if(token.email !== old_request.creator) {
            return res.status(401).json({message: 'You cannot change request that are not created by you'})
        }
        
        const new_request = {
            id: old_request.id,
            message: req.body.message ? req.body.message : old_request.message,
            hospital: req.body.hospital ? req.body.hospital : old_request.hospital, 
            donation_point: req.body.donation_model ? req.body.donation_point : old_request.donation_point,
            amount: req.body.amount ? req.body.amount : old_request.amount,
            patient: req.body.patient ? req.body.patient : old_request.patient
        }

        await donation_model.update(new_request)
        res.status(201).json({message: 'Donation request updated'})
    } catch (e) {
        res.status(500).json({message: 'internal server error'})
    }
}

const close = async (req, res) => {
    const token = req.user
    if(!token) {
        return res.status(401).json({message: 'You need to be logged in to create a donation request'})
    }

    const donation_id = req.params.id
    if(!donation_id) {
        return res.status(406).json({message: 'No id provided, please provide id of donation request you want to close'})
    }

    try {
        const donation = await donation_model.get_by_id(donation_id)
        if (donation === undefined) {
            return res.status(404).json({message: `No donation with id ${donation_id} found`})
        }

        await donation_model.mark_closed(donation_id)
        res.status(200).json({message: 'Donation closed'})

    } catch (e) {
        res.status(500).json({message: 'Internal server error'})
    }

}

const remove = async (req, res) => {
    const token = req.user
    if(!token) {
        return res.status(401).json({message: 'You need to be logged in to create a donation request'})
    }

    const donation_id = req.params.id
    if(!donation_id) {
        return res.status(406).json({message: 'No id provided, please provide id of donation request you want to close'})
    }
    try {
        const donation = await donation_model.get_by_id(donation_id)
        const user = await user_model.get_by_email(token.email)

        if (donation.creator !== user.id) {
            return res.status(401).json({message: 'Only donation request owner can delete request'})
        }
    } catch (e) {
        return res.status(500).json({message: 'Internal server error'})
    }
    
}

const add_donation_to_request = async (req, res) => {
    const token = req.user
    const donation_id = req.params.id
    if(!token) {
        return res.status(401).json({message: 'You need to be logged in to donate to a donation request'})
    }
    
    if(donation_id === undefined){
        return res.status(406).json({message: 'Please provide id'})
    }
    // const user = user_model.get_by_email(token.email)
    let donation_request = await donation_model.get_by_id(donation_id)
    donation_request = donation_request[0]

    if(donation_request.open === 0){
        return res.status(406).json({message: 'Cannot donate to closed donation request'})
    }
    
    donation_request.donations += 1

    await donation_model.add_to_donation(donation_request.id, donation_request.donations)
    if (donation_request.donations === donation_request.amount) {
        donation_model.mark_closed(donation_id)
    }

    return res.status(200).json({message: 'Successfully donated', donation_request})
}

module.exports = {
    get_all,
    get_by_id,
    create,
    update,
    close,
    remove,
    add_donation_to_request
}