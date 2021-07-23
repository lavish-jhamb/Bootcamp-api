const express = require('express')
const router = express.Router({mergeParams:true})

const Review = require('../models/Review')

const reviewController = require('../controller/reviews')

const advancedResult = require('../middleware/advancedResult')
const { protect, authorize } = require('../middleware/auth')


router.get('/', advancedResult(Review,{
    path:'bootcamp',
    select:'name description'
}), reviewController.getReviews )

router.get('/:id',reviewController.getReview)

router.post('/',protect, authorize('user','admin'),reviewController.createReview)

router.put('/:id',protect, authorize('user','admin'),reviewController.UpdateReview)

router.delete('/:id',protect, authorize('user','admin'),reviewController.deleteReview)

module.exports = router