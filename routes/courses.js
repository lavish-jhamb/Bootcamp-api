const express = require('express')
const router = express.Router({mergeParams:true})

const coursesController = require('../controller/courses')
const advancedResults = require('../middleware/advancedResult')

const Course = require('../models/Course')

// Protect middleware
const { protect,authorize } = require('../middleware/auth')

router.get('/' , advancedResults(Course,{
    path:'bootcamp',
    select:'name description'
}), coursesController.getCourses)

router.get('/:id', coursesController.getCourse)

router.post('/' ,protect,authorize('publisher','admin'), coursesController.addCourse)

router.put('/:id',protect,authorize('publisher','admin'), coursesController.updateCourse)

router.delete('/:id',protect,authorize('publisher','admin'), coursesController.deleteCourse)

module.exports = router