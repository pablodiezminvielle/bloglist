const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const userExtractor = require('../middleware/userExtractor')

// GET público
blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
})

// POST protegido
blogsRouter.post('/', userExtractor, async (request, response) => {
    const user = request.user

    const blog = new Blog({
        ...request.body,
        user: user._id
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    await savedBlog.populate('user', { username: 1, name: 1 }) //  populate user data

    response.status(201).json(savedBlog)
})

// PUT público (para actualizar likes y user)
blogsRouter.put('/:id', async (request, response) => {
    const { title, author, url, likes, user } = request.body

    const updatedBlog = await Blog.findByIdAndUpdate(
        request.params.id,
        { title, author, url, likes, user },
        { new: true, runValidators: true, context: 'query' }
    ).populate('user', { username: 1, name: 1 })

    if (updatedBlog) {
        response.json(updatedBlog)
    } else {
        response.status(404).end()
    }
})

// DELETE protegido
blogsRouter.delete('/:id', userExtractor, async (request, response) => {
    const user = request.user
    const blog = await Blog.findById(request.params.id)

    if (!blog) {
        return response.status(404).json({ error: 'blog not found' })
    }

    if (blog.user.toString() !== user.id.toString()) {
        return response.status(401).json({ error: 'unauthorized: not the blog owner' })
    }

    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
})

// POST /:id/comments (público)
blogsRouter.post('/:id/comments', async (request, response) => {
    const { comment } = request.body
    const blog = await Blog.findById(request.params.id)

    if (!blog) {
        return response.status(404).json({ error: 'blog not found' })
    }

    blog.comments = blog.comments.concat(comment)
    const updatedBlog = await blog.save()

    response.status(201).json(updatedBlog)
})

module.exports = blogsRouter
