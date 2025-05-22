const listHelper = require('../utils/list_helper')

describe('dummy', () => {
    test('returns one', () => {
        const blogs = []
        const result = listHelper.dummy(blogs)
        expect(result).toBe(1)
    })
})

describe('total likes', () => {
    const listWithOneBlog = [
        {
            title: 'React patterns',
            author: 'Michael Chan',
            url: 'https://reactpatterns.com/',
            likes: 7,
            id: '1'
        }
    ]

    const blogs = [
        { title: 'A', author: 'Author A', url: 'url.com', likes: 5 },
        { title: 'B', author: 'Author B', url: 'url.com', likes: 8 },
        { title: 'C', author: 'Author C', url: 'url.com', likes: 0 }
    ]

    test('of empty list is zero', () => {
        expect(listHelper.totalLikes([])).toBe(0)
    })

    test('when list has one blog equals the likes of that', () => {
        expect(listHelper.totalLikes(listWithOneBlog)).toBe(7)
    })

    test('of a bigger list is calculated right', () => {
        expect(listHelper.totalLikes(blogs)).toBe(13)
    })
})

describe('favorite blog', () => {
    const blogs = [
        { title: 'Blog A', author: 'Author A', likes: 3 },
        { title: 'Blog B', author: 'Author B', likes: 10 },
        { title: 'Blog C', author: 'Author C', likes: 7 }
    ]

    test('returns the blog with most likes', () => {
        const result = listHelper.favoriteBlog(blogs)
        expect(result).toEqual({
            title: 'Blog B',
            author: 'Author B',
            likes: 10
        })
    })

    test('returns null for empty list', () => {
        expect(listHelper.favoriteBlog([])).toBeNull()
    })
})

describe('most blogs', () => {
    const blogs = [
        { author: 'A', title: '1' },
        { author: 'B', title: '2' },
        { author: 'A', title: '3' },
        { author: 'B', title: '4' },
        { author: 'B', title: '5' }
    ]

    test('returns author with most blogs', () => {
        const result = listHelper.mostBlogs(blogs)
        expect(result).toEqual({ author: 'B', blogs: 3 })
    })

    test('returns null for empty list', () => {
        expect(listHelper.mostBlogs([])).toBeNull()
    })
})

describe('most likes', () => {
    const blogs = [
        { author: 'A', likes: 5 },
        { author: 'B', likes: 7 },
        { author: 'A', likes: 8 },
        { author: 'C', likes: 12 }
    ]

    test('returns author with highest total likes', () => {
        const result = listHelper.mostLikes(blogs)
        expect(result).toEqual({ author: 'A', likes: 13 })
    })

    test('returns null for empty list', () => {
        expect(listHelper.mostLikes([])).toBeNull()
    })
})
