const ErrorHandler = require("../utils/errorHandler.js");
const catchAsyncError = require("./catchAsyncError.js");
const jwt = require("jsonwebtoken")
const User = require("../models/userModels.js")


exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;

    // Log the token to check if it exists
    // console.log("Token: ", token);

    if (!token) {
        return next(new ErrorHandler("Please Login to access this resource", 401));
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded Data: ", decodedData.id);

    req.user = await User.findById(decodedData.id);
    // console.log("Authenticated User: ", req.user);

    if (!req.user) {
        return next(new ErrorHandler("User not found", 404));
    }

    next();
});


exports.authorizeRoles = (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role))
           return next( new ErrorHandler(`Role: ${req.user.role} is not allowed to access this resource`,403)
    )         

        next();
    }
}