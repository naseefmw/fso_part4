//require('dotenv').config()
const express = require('express')
//const morgan = require('morgan')
const app = express()
//const cors = require('cors')

//app.use(express.static('build'))
app.use(express.json())
//app.use(cors())
//app.use(morgan('tiny'))

//app.get()
//app.post()
//app.put()
//app.delete()

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error) => {
  console.error(error.message)
}
app.use(errorHandler)