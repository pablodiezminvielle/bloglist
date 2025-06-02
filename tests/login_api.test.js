const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const api = supertest(app)

const User = require('../models/user')

beforeEach(async () => {
    await api.post('/api/testing/reset')

    const newUser = {
        username: 'pablodiez',
        name: 'Pablo',
        password: 'clave123'
    }

    await api.post('/api/users').send(newUser)
})



test('login succeeds with valid credentials', async () => {
    const credentials = {
        username: 'pablodiez',
        password: 'clave123'
    }

    const response = await api
        .post('/api/login')
        .send(credentials)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    expect(response.body.token).toBeDefined()
    expect(response.body.username).toBe('pablodiez')
})

test('login fails with invalid password', async () => {
    const credentials = {
        username: 'pablodiez',
        password: 'wrongpass'
    }

    const response = await api
        .post('/api/login')
        .send(credentials)
        .expect(401)

    expect(response.body.error).toBe('invalid username or password')
    expect(response.body.token).not.toBeDefined()
})

afterAll(async () => {
    await mongoose.connection.close()
})
