const crypto = require('crypto')

const User = require("../models/User");
const ErrorResponse = require('../utils/errorResponse')
const sendEmail = require('../utils/sendEmail')
const asyncHandler = require('../middleware/async')

// @desc    Register a user
// @route   POST /api/v1/auth/register
// @access  Public

exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body

    // Create a user in database
    const user = await User.create({
        name,
        email,
        password,
        role
    })

    res.status(201).json({
        success: true,
        message: 'User created successfully',
        data:user
    })
})


// @desc    Login a user
// @route   POST /api/v1/auth/login
// @access  private

exports.login = asyncHandler(async (req,res,next) => {
    const {email,password} = req.body

    // Check for validation
    if(!email || !password) {
        return next(new ErrorResponse(`Please provide an email and password`,404))
    }

    // Check for user
    const user = await User.findOne({email:email}).select('+password')

    if(!user){
        return next(new ErrorResponse(`Invalid Credentials`,401))
    }

    // Check if password match or not
    const isMatch = await user.matchPassword(password)
    
    if(!isMatch){
        return next(new ErrorResponse(`Password does not match`,401))
    }

    sendTokenResponse(user,200,res,'User logged in successfully')
})


// @desc    Log user out / clear cookie 
// @route   POST /api/v1/auth/logout
// @access  private
exports.logout = asyncHandler(async(req,res,next) => {
    res.cookie('token','none',{
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly:true
    })

    res.status(200).json({
        success:true,
        data:{}
    })
})


// @desc    Get a current logged in user
// @route   GET /api/v1/auth/getMe
// @access  Private

exports.getMe = asyncHandler(async(req,res,next) => {
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success:true,
        message:'Currently logged in user',
        data:user
    })
})


// @desc    Forgot Password
// @route   GET /api/v1/auth/forgot/password
// @access  Public

exports.forgotPassword = asyncHandler(async(req,res,next) => {
    const user = await User.findOne({email:req.body.email})

    if(!user){
        return next(new ErrorResponse(`No user is found with this email ${req.body.email}`,404))
    }

    // Create reset token
    const resetToken = user.getResetPasswordToken()

    await user.save({validateBeforeSave:false})

    // Create reset Url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset/password/${resetToken}`
    const message = `reset password : \n\n ${resetUrl}`

    try{
        await sendEmail({
            email:user.email,
            subject:'Password reset',
            message
        })

        res.status(200).json({
            success:true,
            data:'Email sent'
        })
    }catch(err){
        console.log(err)
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({validateBeforeSave:false})

        return next(new ErrorResponse(`email could not be sent`,500))
    }
})


// @desc    Reset password
// @route   PUT /api/v1/auth/reset/password/:resetToken
// @access  Public

exports.resetPassword = asyncHandler(async(req,res,next) => {
    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex')

    const user = await User.findOne({
        resetPasswordToken:resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()}
    })

    if(!user){
        return next(new ErrorResponse(`Invalid token`,400))
    }

    // Set new password
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    sendTokenResponse(user,200,res,'Password reseted successfully')
}) 


// @desc    Update user details
// @route   PUT /api/v1/auth/userdetails
// @access  Private

exports.updateUser = asyncHandler(async(req,res,next) => {
    const fieldToUpdate = {
        name:req.body.name,
        email:req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id,fieldToUpdate,{
        new:true,
        runValidators:true
    })

    res.status(200).json({
        success:true,
        message:'User updated successfully',
        data:user
    })
})


// @desc    Update password
// @route   PUT /api/v1/auth/update/password
// @access  Private

exports.updatePassword = asyncHandler(async(req,res,next) => {
    const user = await User.findById(req.user.id).select('+password')
    
    // check current password
    if(!(await user.matchPassword(req.body.currentPassword))){
        return next(new ErrorResponse(`Current password is incorrect`,401))
    }

    // set update password
    user.password = req.body.newPassword

    // update user in db
    await user.save()

    sendTokenResponse(user,200,res,'password updated successfully')
})


// Get token from model, create cookie and send response
const sendTokenResponse = (user,statusCode,res,message) => {

    // Create token
   const token = user.getSignedJwtToken()

   const options = {
       expires:new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 1000 * 60 * 60),
       httpOnly:true
   }

   if(process.env.NODE_ENV === 'production'){
       options.secure = true 
   }

   res.status(statusCode)
   .cookie('token',token,options)
   .json({
       success:true,
       message:message,
       token,
       data:user
   })
}



