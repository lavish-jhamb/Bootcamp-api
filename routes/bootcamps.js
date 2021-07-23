const express = require('express')
const router = express.Router()

// Controller Files
const bootcampControllers = require('../controller/bootcamps')
const advancedResults = require('../middleware/advancedResult')
const Bootcamp = require('../models/Bootcamp')

// Protected middleware
const { protect,authorize } = require('../middleware/auth')

// Include Other resource router
const courseRouter = require('./courses')
const reviewRouter = require('./reviews')

// Re-route into other resource routers
router.use('/:bootcampId/courses',courseRouter)
router.use('/:bootcampId/reviews',reviewRouter)

router.get('/', advancedResults(Bootcamp,'courses'),bootcampControllers.getBootcamps)

router.get('/:id',bootcampControllers.getBootcamp)

router.post('/', protect,authorize('publisher','admin'), bootcampControllers.createBootcamps)

router.put('/:id', protect,authorize('publisher','admin'), bootcampControllers.updateBootcamp)

router.delete('/:id',protect,authorize('publisher','admin'), bootcampControllers.deleteBootcamp)

router.put('/:id/photo',protect,authorize('publisher','admin'), bootcampControllers.bootcampPhotoUpload)

module.exports = router