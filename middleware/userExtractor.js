const jwt = require('jsonwebtoken')
const User = require('../models/user')

const userExtractor = async (request, response, next) => {
    try {
        const decodedToken = jwt.verify(request.token, process.env.SECRET)

        if (!decodedToken.id) {
            return response.status(401).json({ error: 'token missing or invalid' })
        }

        const user = await User.findById(decodedToken.id)
        if (!user) {
            return response.status(401).json({ error: 'user not found' })
        }

        request.user = user
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = userExtractor
