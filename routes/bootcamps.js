const express = require('express')
const router = express.Router()

// Controller Files
const bootcampControllers = require('../controller/bootcamps')

// Include Other resource router
const courseRouter = require('./courses')

// Re-route into other resource routers
router.use('/:bootcampId/courses',courseRouter)

router.get('/',bootcampControllers.getBootcamps)

router.get('/:id',bootcampControllers.getBootcamp)

router.post('/',bootcampControllers.createBootcamps)

router.put('/:id',bootcampControllers.updateBootcamp)

router.delete('/:id',bootcampControllers.deleteBootcamp)

module.exports = router