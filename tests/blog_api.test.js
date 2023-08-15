const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

let token

beforeEach(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)

  const user = {
    username: 'root',
    password: 'password',
  }

  await api.post('/api/users').send(user)
  const result = await api.post('/api/login').send(user)
  token = result.body.token
})

describe('When there is initially some blogs saved', () => {
  test('all blogs are returned', async () => {
    const response = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('unique identifier of a blog, id is defined', async () => {
    const response = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
    response.body.forEach((blog) => {
      expect(blog.id).toBeDefined()
    })
  })
})

describe('when a new blog is added', () => {
  test('a valid blog can be added ', async () => {
    const newBlog = {
      title: 'Express',
      author: 'Chan',
      url: 'https://react',
      likes: 7,
    }
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map((n) => n.title)
    expect(titles).toContain('Express')
  })

  test('if likes is missing in the request it will default to zero', async () => {
    const newBlog = {
      title: 'How to go to Wonderland',
      author: 'Alice',
      url: 'https://rabbithole.com',
    }
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const response = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
    const like = response.body.at(-1).likes
    expect(like).toEqual(0)
  })

  test('blog without title is not added', async () => {
    const newBlog = {
      author: 'Chan',
      url: 'https://react',
      likes: 71,
    }
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('blog without url is not added', async () => {
    const newBlog = {
      title: 'Bless',
      author: 'Chan',
      likes: 71,
    }
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('adding a blog fails if there is no token', async () => {
    const newBlog = {
      title: 'hello',
      author: 'Chan',
      url: 'https://react',
      likes: 71,
    }
    await api.post('/api/blogs').send(newBlog).expect(401)
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe('deleting a blog', () => {
  test('when a blog is deleted, we get 204', async () => {
    const newBlog = {
      title: 'The Blog',
      author: 'Sasha',
      url: 'www.url',
      likes: 2,
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart.find(
      (blog) => blog.title === newBlog.title
    )
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).not.toContain(blogToDelete.title)

    const titles = blogsAtEnd.map((r) => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('updating a blog', () => {
  test('when likes are updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const updatedBlog = { ...blogToUpdate, likes: blogToUpdate.likes + 1 }

    const response = await api
      .put(`/api/blogs/${updatedBlog.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedBlog)
    expect(response.body.likes).toEqual(helper.initialBlogs[0].likes + 1)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
