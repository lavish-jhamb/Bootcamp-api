const mongoose = require('mongoose')

const connectDB  = async () => {
    const database_connection = await mongoose.connect(process.env.MONGODB_URI , {
        useNewUrlParser:true,
        useCreateIndex:true,
        useFindAndModify:false,
        useUnifiedTopology:true
    })

    console.log(`MongoDB Connected: ${database_connection.connection.host}`.cyan.bold)
}

module.exports = connectDB