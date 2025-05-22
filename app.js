require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')

const blogsRouter = require('./controllers/blogController')
const usersRouter = require('./controllers/userController')
const loginRouter = require('./controllers/login')

const tokenExtractor = require('./middleware/tokenExtractor')

const app = express()
app.use(express.json())

const mongoUrl = process.env.MONGODB_URI
console.log('Connecting with MongoDB...')

mongoose.connect(mongoUrl)
    .then(() => {
        console.log('Connected to MongoDB ✅')
    })
    .catch((error) => {
        console.error('Connection error MongoDB ❌:', error.message)
    })

app.use(tokenExtractor)

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

const errorHandler = (error, request, response, next) => {
    if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({ error: 'token inválido' })
    } else if (error.name === 'TokenExpiredError') {
        return response.status(401).json({ error: 'token expirado' })
    }

    next(error)
}

app.use(errorHandler)

module.exports = app
