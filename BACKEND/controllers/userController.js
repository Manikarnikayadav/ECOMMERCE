const ErrorHandler = require("../utils/errorHandler.js");
const catchAsyncError = require("../middleware/catchAsyncError.js")
const User = require("../models/userModels.js");
const sendToken = require("../utils/jwtToken.js")
const sendEmail = require("../utils/sendEmail.js")
const crypto = require('crypto');

// register a user
exports.registerUser = catchAsyncError( async(req,res,next)=>{
    const {name,email,password} = req.body;

    const user = await User.create({
        name,email,password,
        avatar:{
            public_id:"this is a sample id ",
            url:"profilepicUrl"
        }
    });
    


   sendToken(user,201,res)
})


// LOGIN USER

exports.loginUser = catchAsyncError( async(req,res,next)=>{

    const {email,password} = req.body;

    // checking if user has given password and email both

    if(!email || !password){
        return next(new ErrorHandler("Please Enter Email and Password",400))
    }

    const user = await User.findOne({email}).select("+password");

    if(!user)
        return next(new ErrorHandler("Invalid email or password",401))

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched)
        return next(new ErrorHandler("Invalid email or password",401))

    sendToken(user,200,res)
})


// LOGOUT USER

exports.logout = catchAsyncError( async(req,res,next)=>{


    res.cookie("token",null,{
        httpOnly:true,
        expires:new Date(Date.now())
    })

    res.status(200)
    .json({
        success:true,
        message:"Logged Out Succesfully"
    })
})

// forgot Password

exports.forgotPassword = catchAsyncError(async(req,res,next)=>{
    const user = await User.findOne({email:req.body.email});

    if(!user)
    {
        return next(
            new ErrorHandler("User not found",404)
        );
    }

    // Get Reset Password Token

    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave:false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is:- \n\n${resetPasswordUrl} \n\n If you have not requested this email then, please ignore it`;


    try {
        
          await sendEmail({
            email:user.email,
            subject:`Ecommerce Password Recovery`,
            message,

          });
         res.status(200).json({
            succsess:true,
            message:`Email sent to ${user.email} successfully`
         }) 

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave:false});

        return next(new ErrorHandler(error.message,500))
    }

})



// Reaet Password
exports.resetPassword = catchAsyncError(async(req,res,next)=>{
  
// creating token hash
    const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()}
    });

    if(!user)
        {
            return next(
                new ErrorHandler("Reset Password token is invalid or has been expired",400)
            );
        }
    
        if(req.body.password !== req.body.confirmPassword){
            return next(
                new ErrorHandler("Pasword dosen't match",400)
            );
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();


        sendToken(user,200,res)
})