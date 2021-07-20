const mongoose = require('mongoose')
const Schema = mongoose.Schema
const slugify = require('slugify')

const BootcampSchema = new Schema({
    name:{
        type:String,
        required:[true,'Please add a name'],
        unique:true,
        trim:true,
        maxlength:[50,'Name can not be more than 50 characters']
    },
    slug:String,
    description:{
        type:String,
        required:[true,'Please add a description'],
        maxlength:[500,'Description can not be more than 500 characters']
    },
    website: {
        type:String,
        match:[
            /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi,
            'Please add a valid URL with HTTP or HTTPS'
        ]
    },
    phone:{
        type:String,
        maxlength:[20,'Phone no. can not be longer than 20 characters']
    },
    email:{
        type:String,
        match:[
            /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
            'Please add a valid email address'
        ]
    },
    address:{
        type:String,
        required:[true,'Please add an address']
    },
    location:{
        type: {
            type: String,
            enum: ['Point'],
            // required: true
          },
          coordinates: {
            type: [Number],
            // required: true,
            index:'2dsphere'
          },
          formattedAddress:String,
          street:String,
          city:String,
          state:String,
          zipcode:String,
          country:String,
    },
    careers:{
        type:[String],
        required:true,
        enum:[
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other',
        ]
    },
    averageRating:{
        type:Number,
        min:[1,'Rating must be at least 1'],
        max:[10,'Rating can not be more than 10']
    },
    averageCost:Number,
    photo:{
        type:String,
        default:'no-photo.jpg'
    },
    housing:{
        type:Boolean,
        default:false
    },
    jobAssistance:{
        type:Boolean,
        default:false
    },
    jobGuarantee:{
        type:Boolean,
        default:false
    },
    acceptGi:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
},{
    toJSON: {virtuals:true},
    toObject:{virtuals:true}
})

// Create a bootcamp slug from the name
BootcampSchema.pre('save',function(next) {
    this.slug = slugify(this.name,{lower:true})
    next()
})

//  Geocode and create location field
// BootcampSchema.pre('save', function(next) {
//     // const randomNumber = Math.random() * 100
//     // const anotherRandomNumber = Math.random() * 200
//     this.location = {
//         coordinates:'52651',
//         street:'New york street',
//         city:'New york',
//         state:'London',
//         zipcode:125039,
//         country:'USA',
//     }
    
//     // do not save address in DB
//     this.address = undefined

//     next()
// })

// Cascade delete courses when a bootcamp is deleted  => for running this middleware we need to fix (delele
// bootcamp controller )  ==>  Replace (findByIdRemove) by (findById) and remove() method  
BootcampSchema.pre('remove' , async function(next) {
    console.log(`Courses being removed from bootcamp ${this._id}`)
    await this.model('Course').deleteMany({bootcamp:this._id})
    next()
})


// Reverse populate with virtuals
BootcampSchema.virtual('courses',{
    ref:'Course',
    localField:'_id',
    foreignField:'bootcamp',
    justOne:false
})

module.exports = mongoose.model('Bootcamp',BootcampSchema)