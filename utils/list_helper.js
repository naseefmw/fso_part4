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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
}
