const donation_model = require('../models/donation_model')

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

}

const remove = async (req, res) => {

}

module.exports = {
    get_all,
    get_by_id,
    create,
    update,
    close,
    remove
}