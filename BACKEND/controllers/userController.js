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


// Get User Details

exports.getUserDetails = catchAsyncError(async(req,res,next)=>{

    const user = await User.findById(req.user.id);

    res.status(200)
    .json({
        success:true,
        user
    })
})


// Update User Password
exports.updateUserPassword = catchAsyncError(async(req,res,next)=>{

    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched)
        return next(new ErrorHandler("Old Password is incorrect",400))


    if(req.body.newPassword !== req.body.confirmPassword ){
        return next(new ErrorHandler("Password dosent Match",400))
    }
     user.password = req.body.newPassword;

     await user.save();
     
     sendToken(user,200,res)
})



// Update User Profile
exports.updateUserProfile = catchAsyncError(async(req,res,next)=>{

    const newUserData = {
        name:req.body.name,
        email:req.body.email,

    }

    // we will add cloudinary later

    const user =await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    });
     
    res.status(200).json({
        success:true,
        
    })
      
})


// get All users ---Admin
exports.getAllUsers = catchAsyncError(async(req,res,next)=>{

    const users = await User.find();
    res.status(200).json({
        success:true,
        users,
    })
})

// Get single User -- Admin
exports.getSingleUser = catchAsyncError(async(req,res,next)=>{

    const users = await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler(`User does not exist with Id: ${req.id.params}`))
    }
    res.status(200).json({
        success:true,
        user,
    })
})


// Update User role  --Admin
exports.updateUserRole = catchAsyncError(async(req,res,next)=>{

    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role,

    }

    // we will add cloudinary later

    const user =await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    });
     
    res.status(200).json({
        success:true,
        
    })
      
})


// Delete User  --Admin
exports.DeleteUser = catchAsyncError(async(req,res,next)=>{

    const user = await User.findByIdAndDelete(req.params.id);
    
    if(!user)
        return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`,400))
    // we will remove cloudinary later


    // await user.remove();
    res.status(200).json({
        success:true,
        message: 'User has been deleted successfully'
    })
      
})

