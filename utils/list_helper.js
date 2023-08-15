const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const sum = blogs
    .map((blog) => blog.likes)
    .reduce((sum, likes) => sum + likes, 0)
  return sum
}

const favoriteBlog = (blogs) => {
  const likes = blogs.map((blog) => blog.likes)
  const maxLikes = Math.max(...likes)
  const maxLikedBlog = blogs.filter((blog) => blog.likes === maxLikes)[0]
  const result = {
    title: maxLikedBlog.title,
    author: maxLikedBlog.author,
    likes: maxLikedBlog.likes,
  }
  return result
}

const mostBlogs = (blogs) => {
  const count = _.countBy(blogs, (blog) => blog.author)
  const mostBlogged = _(count)
    .keys()
    .reduce((a, b) => (count[a] > count[b] ? a : b))

  const result = {
    author: mostBlogged,
    blogs: count[mostBlogged],
  }
  return result
}

const mostLikes = (blogs) => {
  const groupedBlogs = _.groupBy(blogs, 'author')
  const count = _.mapValues(groupedBlogs, (blog) =>
    _.reduce(blog, (likes, b) => likes + b.likes, 0)
  )

  const mostLiked = _(count)
    .keys()
    .reduce((a, b) => (count[a] > count[b] ? a : b))

  const result = {
    author: mostLiked,
    likes: count[mostLiked],
  }

  return result
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
