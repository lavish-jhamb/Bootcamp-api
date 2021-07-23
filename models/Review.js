const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ReviewSchema = new Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a title'],
        maxlength: 100
    },
    text: {
        type: String,
        required: [true, 'Please add some text']
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Please add a rating between 1 to 10']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    bootcamp: {
        type: Schema.Types.ObjectId,
        ref: 'Bootcamp',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

// Prvent user from submitting more than one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true })

// Static method to get average rating and save

ReviewSchema.statics.getAverageRating = async function (bootcampId) {
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        },
        {
            $group: {
                _id: '$bootcamp',
                averageRating: { $avg: '$rating' }
            }
        }
    ])

    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageRating: obj[0].averageRating
        })
    } catch (err) {
        console.error(err)
    }
}

// Call getAverageRating after save
ReviewSchema.post('save',function(){
    this.constructor.getAverageRating(this.bootcamp)
})

// Call getAverageRating before save
ReviewSchema.pre('save',function(){
    this.constructor.getAverageRating(this.bootcamp)
})

module.exports = mongoose.model('Review', ReviewSchema)