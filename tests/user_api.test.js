const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const api = supertest(app)

const User = require('../models/user')

beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })
    await user.save()
})

test('a valid user can be created', async () => {
    const usersAtStart = await User.find({})

    const newUser = {
        username: 'newuser',
        name: 'Nuevo Usuario',
        password: 'clave123'
    }

    await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const usersAtEnd = await User.find({})
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
})

test('creation fails with too short username', async () => {
    const newUser = {
        username: 'ab',
        name: 'Shorty',
        password: 'valid123'
    }

    const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

    expect(result.body.error).toContain('Username is required')
})

test('creation fails with too short password', async () => {
    const newUser = {
        username: 'validuser',
        name: 'Shortpass',
        password: 'pw'
    }

    const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

    expect(result.body.error).toContain('Password is required')
})

test('creation fails with missing username', async () => {
    const newUser = {
        name: 'NoUsername',
        password: 'validpass'
    }

    const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

    expect(result.body.error).toContain('Username is required')
})

test('creation fails with missing password', async () => {
    const newUser = {
        username: 'nouserpass',
        name: 'NoPass'
    }

    const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

    expect(result.body.error).toContain('Password is required')
})

test('creation fails if username already exists', async () => {
    const newUser = {
        username: 'root',
        name: 'Duplicate',
        password: 'somepass'
    }

    const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

    expect(result.body.error).toContain('expected `username` to be unique')
})

afterAll(async () => {
    await mongoose.connection.close()
})
