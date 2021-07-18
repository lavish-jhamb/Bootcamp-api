const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const colors = require('colors')

// Routes files
const bootcampRoutes = require('./routes/bootcamps')
const courseRoutes = require('./routes/courses')

// middleware files
const errorHandler = require('./middleware/error')

// Database files
const connectDB = require('./config/db')

// Load env vars
dotenv.config({ path: '.env' })

// Connect to databse
connectDB()

const app = express()

// Body parser => parse incoming body to json
app.use(express.json())

// Register middlewares
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Register routes
app.use('/api/v1/bootcamps', bootcampRoutes)
app.use('/api/v1/courses', courseRoutes)


// Register error middlewares
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = app.listen(PORT,
    () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold))

// Handle unhandled promise rejections
process.on('unhandledRejection' , (err,promise) => {
    console.log(`Error: ${err.message}`.red.bold)
    // Close server & exit process
    server.close(() => process.exit(1))
})