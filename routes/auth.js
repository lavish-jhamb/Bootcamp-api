const express = require('express')
const router = express.Router()

const authController = require('../controller/auth')

const {protect} = require('../middleware/auth')

router.post('/register',authController.register)

router.post('/login',authController.login)

router.get('/logout',authController.logout)

router.get('/me',protect,authController.getMe)

router.post('/forgot/password',authController.forgotPassword)

router.put('/reset/password/:resetToken',authController.resetPassword)

router.put('/userdetails',protect,authController.updateUser)

router.put('/update/password',protect,authController.updatePassword)

module.exports = router