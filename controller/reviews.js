const asyncHandler = require("../middleware/async");
const Bootcamp = require("../models/Bootcamp");
const Review = require("../models/Review")
const ErrorResponse = require("../utils/errorResponse")


// @desc   Get Reviews
// @route  GET /api/v1/reviews
// @route  GET /api/v1/bootcamps/:bootcampId/reviews
// @access Public

exports.getReviews = asyncHandler(async (req,res,next) => {
    if(req.params.bootcampId){
        const reviews = await Review.find({bootcamp:req.params.bootcampId})

        res.status(200).json({
            success:true,
            count:reviews.length,
            message:`Reviews fetched successfully for bootcamp id ${req.params.bootcampId}`,
            data:reviews
        })
    }else{
        res.status(200).json(res.advancedResults)
    }
})


// @desc   Get Review
// @route  GET /api/v1/review
// @access Public

exports.getReview = asyncHandler(async (req,res,next) => {
    const review = await Review.findById(req.params.id).populate({
        path:'bootcamp',
        select:'name description'
    })

    if(!review){
        return next(new ErrorResponse(`No review found with the id of ${req.params.id}`,404))
    }

    res.status(200).json({
        success:true,
        message:'single review fetched successfully',
        data:review
    })
})


// @desc   Add Review
// @route  POST /api/v1/bootcamp/:bootcampId/review
// @access Private

exports.createReview = asyncHandler(async (req,res,next) => {
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id

    // Check if bootcamp exist or not
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if(!bootcamp){
        return next(new ErrorResponse(`No bootcamp found with the id of ${req.params.bootcampId}`))
    }

    // Create review based on Review model
    const review = await Review.create(req.body)

    res.status(201).json({
        success:true,
        message:'Review created successfully',
        data:review
    })
})


// @desc   Update Review
// @route  PUT /api/v1/reviews/:id
// @access Private

exports.UpdateReview = asyncHandler(async (req,res,next) => {
    let review = await Review.findById(req.params.id)

    if(!review){
        return next(new ErrorResponse(`No review found with the id of ${req.params.id}`,400))
    }

    // Make sure review belongs to particular user or user is admin
    if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`Not authorized to access this route`,401))
    }

    review = await Review.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    })


    res.status(200).json({
        success:true,
        message:'Review updated successfully',
        data:review
    })
})


// @desc   Delete Review
// @route  DELETE /api/v1/reviews/:id
// @access Private

exports.deleteReview = asyncHandler(async (req,res,next) => {
    // Check if Review exist or not
    const review = await Review.findById(req.params.id)

    if(!review){
        return next(new ErrorResponse(`No review found with the id ${req.params.id}`,404))
    }

    // Check if review belong to user and user is admin

    if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`No review found with the id ${req.params.id}`,404))
    }

    // Delete review 
    await review.remove()

    res.status(200).json({
        success:true,
        message:'Review deleted successfully',
        data:{}
    })
})

