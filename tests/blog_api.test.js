const mongoose = require('mongoose')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog))
  const promiseArray = blogObjects.map((blog) => blog.save())
  await Promise.all(promiseArray)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
}, 100000)

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('a specific blog is within the returned blogs', async () => {
  const response = await api.get('/api/blogs')
  const titles = response.body.map((r) => r.title)
  expect(titles).toContain('Canonical string reduction')
})

test('a valid blog can be added ', async () => {
  const newBlog = {
    title: 'Express',
    author: 'Chan',
    url: 'https://react',
    likes: 7,
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map((n) => n.title)
  expect(titles).toContain('Express')
})

test('blog without title is not added', async () => {
  const newBlog = {
    author: 'Chan',
    url: 'https://react',
    likes: 71,
  }
  await api.post('/api/blogs').send(newBlog).expect(400)
  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

test('blog without url is not added', async () => {
  const newBlog = {
    title: 'Bless',
    author: 'Chan',
    likes: 71,
  }
  await api.post('/api/blogs').send(newBlog).expect(400)
  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

test('unique identifier of a blog, id is defined', async () => {
  const response = await api.get('/api/blogs')
  const id = response.body[0].id
  expect(id).toBeDefined()
})

test('if likes is missing in the request it will default to zero', async () => {
  const newBlog = {
    title: 'How to go to Wonderland',
    author: 'Alice',
    url: 'https://rabbithole.com',
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  const like = response.body.at(-1).likes
  expect(like).toEqual(0)
})

afterAll(async () => {
  await mongoose.connection.close()
})
