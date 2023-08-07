const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const sum = blogs.map(blog => (
    blog.likes
  )).reduce((sum, likes) => sum + likes, 0)
  return sum
}

module.exports = {
  dummy, totalLikes
}