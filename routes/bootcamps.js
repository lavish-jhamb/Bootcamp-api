const express = require('express')
const router = express.Router()

// Controller Files
const bootcampControllers = require('../controller/bootcamps')

router.get('/',bootcampControllers.getBootcamps)

router.get('/:id',bootcampControllers.getBootcamp)

router.post('/',bootcampControllers.createBootcamps)

router.put('/:id',bootcampControllers.updateBootcamp)

router.delete('/:id',bootcampControllers.deleteBootcamp)

module.exports = router