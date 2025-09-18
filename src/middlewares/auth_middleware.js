const jwt = require('jsonwebtoken')

const authenticate_jwt = (req, res, next) => {

    const auth_header = req.headers.authorization

    if (!auth_header) {
        return res.status(401).json({ message: "Authorization header missing"})
    }

    const token = auth_header.split(' ')[1]

    if (!token) {
        return res.status(401).json({ message: 'Token missing'})
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (e) {
        return res.status(403).json({ message: 'Invalid or expired token'})
    }
}

module.exports = {
    authenticate_jwt,
}