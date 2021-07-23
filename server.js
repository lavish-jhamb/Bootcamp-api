const path = require('path') 

const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const colors = require('colors')
const fileupload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')


// Routes files
const bootcampRoutes = require('./routes/bootcamps')
const courseRoutes = require('./routes/courses')
const authRoutes = require('./routes/auth')
const reviewRoutes = require('./routes/reviews')

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

// Cookie parser
app.use(cookieParser())

// Register middlewares
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Fileupload middleware
app.use(fileupload())

// Sanatize data (prevent no-sql injection)
app.use(mongoSanitize())

// Set security header in req
app.use(helmet())

// Prevent cross site scripting(xss attacts)
app.use(xss())

// Making api public (preventing cors errors)
app.use(cors())

// Preventing http params pollution
app.use(hpp())

// limiting req per specific time
const limiter = rateLimit({
    windowMs:60 * 1000 * 10,
    max:100
}) 

// apply to all req
app.use(limiter)

// Set static folder
app.use(express.static(path.join(__dirname,'public')))

// Register routes
app.use('/api/v1/bootcamps', bootcampRoutes)
app.use('/api/v1/courses', courseRoutes)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/reviews',reviewRoutes)


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