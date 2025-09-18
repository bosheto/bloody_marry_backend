const user_model = require('../models/user_model')

const get_by_email = async (req, res) => {
    const email = req.params.email
    
    const token = req.user
    if(email !== token.email) { 
        res.status(401).json({message: "You don't have access to this resource"})
    }

    try {
        const user = await user_model.get_by_email(email)
        res.json(user)
    } catch (e) {
        res.status(404).json({message: `User with email ${email} not found.`})
    }
}

module.exports = {
    get_by_email
}