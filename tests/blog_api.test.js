const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

let token = null

beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('clave123', 10)
    const user = new User({ username: 'pablodiez', passwordHash })
    await user.save()

    const loginResponse = await api
        .post('/api/login')
        .send({ username: 'pablodiez', password: 'clave123' })

    token = loginResponse.body.token

    const initialBlog = new Blog({
        title: 'Initial blog',
        author: 'Pablo',
        url: 'http://example.com',
        likes: 7,
        user: user._id
    })

    await initialBlog.save()
    user.blogs = [initialBlog._id]
    await user.save()
})

test('blogs are returned as JSON', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(1)
})

test('blog objects have field id defined', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
})

test('a valid blog can be added with valid token', async () => {
    const newBlog = {
        title: 'Nuevo blog test',
        author: 'Tester',
        url: 'http://test.com',
        likes: 10
    }

    await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const titles = response.body.map(b => b.title)

    expect(response.body).toHaveLength(2)
    expect(titles).toContain('Nuevo blog test')
})

test('adding a blog fails with 401 if no token is provided', async () => {
    const newBlog = {
        title: 'Debe fallar',
        author: 'Anonimo',
        url: 'http://fail.com',
        likes: 1
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)

    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(1)
})

test('if likes property is missing, default it to 0', async () => {
    const newBlog = {
        title: 'Blog sin likes',
        author: 'Desconocido',
        url: 'http://nolikes.com'
    }

    const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)

    expect(response.body.likes).toBe(0)
})

test('blog without title is not added and returns 400', async () => {
    const newBlog = {
        author: 'Desconocido',
        url: 'http://faltatitulo.com',
        likes: 3
    }

    await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400)

    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(1)
})

test('blog without url is not added and returns 400', async () => {
    const newBlog = {
        title: 'Falta URL',
        author: 'Desconocido',
        likes: 3
    }

    await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400)

    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(1)
})

test('likes of a blog can be updated', async () => {
    const blogsAtStart = await api.get('/api/blogs')
    const blogToUpdate = blogsAtStart.body[0]

    const updatedData = {
        ...blogToUpdate,
        likes: blogToUpdate.likes + 1
    }

    const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedData)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    expect(response.body.likes).toBe(blogToUpdate.likes + 1)
})

test('a comment can be added to a blog', async () => {
    const blogsAtStart = await api.get('/api/blogs')
    const blogToComment = blogsAtStart.body[0]

    const newComment = {
        comment: '¡Test Comment!'
    }

    const response = await api
        .post(`/api/blogs/${blogToComment.id}/comments`)
        .send(newComment)
        .expect(201)
        .expect('Content-Type', /application\/json/)


    expect(response.body.comments).toContain(newComment.comment)

    const blogsAtEnd = await api.get('/api/blogs')
    const updatedBlog = blogsAtEnd.body.find(b => b.id === blogToComment.id)

    expect(updatedBlog.comments).toContain('¡Test Comment!')
})


afterAll(async () => {
    await mongoose.connection.close()
})
