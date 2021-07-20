const path = require('path')

const asyncHandler = require('../middleware/async')
const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')

exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults)
})

exports.getBootcamp = asyncHandler(async (req, res, next) => {
        const id = req.params.id
        const bootcamp = await Bootcamp.findById(id)

        if (!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404))
        }

        res.status(200).json({
            success: true,
            message: 'Bootcamp fetched succesfully',
            data: bootcamp
        })
})

exports.createBootcamps = asyncHandler(async (req, res, next) => {
        // Add user to req.body
        req.body.user = req.user.id

        // Check for published bootcamp
        const publishedBootcamp = await Bootcamp.findOne({user:req.user.id})

        // If the user is not admin , they can only add one Bootcamp
        if(publishedBootcamp && req.user.role !== 'admin'){
            return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp`,400))
        }

        const bootcamp = await Bootcamp.create(req.body)
        res.status(201).json({
            success: true,
            message: 'bootcamp created',
            data: bootcamp
        })
})

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
        const id = req.params.id
        let bootcamp = await Bootcamp.findById(id)

        if (!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404))
        }

        // Make sure user is bootcamp owner
        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return next(new ErrorResponse(`User ${id} is not authorized to update this bootcamp`,401))
        }

        // Update bootcamp
        bootcamp = await Bootcamp.findByIdAndUpdate(id,req.body,{
            new: true,
            runValidators: true
        })

        res.status(200).json({ 
            sucess: true,
            message: 'Bootcamp updated successfully',
            data: bootcamp 
        })
})

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
        const id = req.params.id
        const bootcamp = await Bootcamp.findById(id)

        if (!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404))
        }

        // Make sure user is bootcamp owner
        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return next(new ErrorResponse(`User ${id} is not authorized to delete this bootcamp`,401))
        }

        await bootcamp.remove()

        res.status(200).json({ 
            success: true,
            message: 'Bootcamp deleted successfully',
            data: [] 
        }) 
})


// @ desc   Upload photos for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  private


exports.bootcampPhotoUpload = asyncHandler(async(req,res,next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)

    if(!bootcamp){
        return next(new ErrorResponse(`No bootcamp found with id ${req.params.id}`,404))
    }

    // Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${id} is not authorized to update this bootcamp`, 401))
    }

    if(!req.files){
        return next(new ErrorResponse(`Please upload a file`,400))
    }

    const file = req.files.file

    // Make sure image is a photo
    if(!file.mimetype.startsWith('image')){
        return next(new ErrorResponse(`Please upload a valid image file`,400))
    }

    // Check filesize
    if(file.size > process.env.MAX_FILE_UPLOAD){
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,400))
    }

    // Create custom file name
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
        if(err){
            console.error(err)
            return next(new ErrorResponse(`Problem with file upload`,500))
        }
        await Bootcamp.findByIdAndUpdate(req.params.id , {photo : file.name})

        res.status(200).json({
            success:true,
            message:'file uploaded succesfully',
            data:file.name
        })
    })
})
