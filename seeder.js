const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const colors = require('colors')

// Load env variables
dotenv.config({ path: '.env' })

// Load models
const Bootcamp = require('./models/Bootcamp')
const Course = require('./models/Course')
const User = require('./models/User')

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})

// Read json file
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'))
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`,'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`,'utf-8'))


// Import into DB
const importData = async () => {
    try {
        await Bootcamp.create(bootcamps)
        await Course.create(courses)
        await User.create(users)

        console.log('Data Imported...'.green.inverse)
        process.exit()
    } catch (err) {
        console.error(err)
    }
}

// Delete data
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany()
        await Course.deleteMany()
        await User.deleteMany()

        console.log('Data Destroyed...'.red.inverse)
    } catch (err) {
        console.error(err)
    }
}

if (process.argv[2] === '-i') {
    importData()
} else if (process.argv[2] === '-d') {
    deleteData()
}