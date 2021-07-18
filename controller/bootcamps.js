const asyncHandler = require('../middleware/async')
const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')

exports.getBootcamps = asyncHandler(async (req, res, next) => {
        let query
        const reqQuery = {...req.query}

        // Field To exculde
        const removeField = ['select','sort','page','limit']

        // Loop over remove fields and delete them from req query
        removeField.forEach(params => delete reqQuery[params])

        console.log(reqQuery)

        let queryString = JSON.stringify(reqQuery)
        queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b/g, match =>`$${match}`)

        // Findind Resources
        query = Bootcamp.find(JSON.parse(queryString)).populate('courses')

        // Select Fields
        if(req.query.select){
            const fields = req.query.select.split(',').join(' ')
            query = query.select(fields)
        }

        // Sort
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ')
            query= query.sort(sortBy)
        }else{
            query = query.sort('-createdAt')
        }

        // Pagination
        const page = parseInt(req.query.page,10) || 1
        const limit = parseInt(req.query.limit,10) || 100
        const startIndex = (page - 1) * limit
        const lastIndex = page * limit
        const total = await Bootcamp.countDocuments()

        query = query.skip(startIndex).limit(limit)

        // Executing Query
        const bootcamp = await query

        // Pagination result
        const pagination = {}

        if(lastIndex < total){
            pagination.next = {
                page:page + 1,
                limit
            }
        }

        if(startIndex > 0){
            pagination.prev = {
                page:page - 1,
                limit
            }
        }
        
        res.status(200).json({
            success: true,
            count:bootcamp.length,
            pagination:pagination,
            message: 'list of all the available bootcamps',
            data: bootcamp
        })
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
        const bootcamp = await Bootcamp.create(req.body)
        res.status(201).json({
            success: true,
            message: 'bootcamp created',
            data: bootcamp
        })
})

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
        const id = req.params.id
        const bootcamp = await Bootcamp.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        })

        if (!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404))
        }

        res.status(200).json({ 
            sucess: true,
            message: 'Bootcamp updated successfully',
            data: bootcamp })
})

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
        const id = req.params.id
        const bootcamp = await Bootcamp.findById(id)

        if (!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404))
        }

        await bootcamp.remove()

        res.status(200).json({ 
            success: true,
            message: 'Bootcamp deleted successfully',
            data: [] 
        }) 
})

// exports.getBootcampsRadius = asyncHandler(async (req,res,next) => {
    
// })