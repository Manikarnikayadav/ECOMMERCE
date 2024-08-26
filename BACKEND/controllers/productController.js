const Product = require("../models/productModels.js");
const ErrorHandler = require("../utils/errorHandler.js");
const catchAsyncError = require("../middleware/catchAsyncError.js")
const ApiFeatures = require("../utils/apiFeatures.js")

// Create Product -- Admin

exports.createProduct = catchAsyncError(async(req,res,next)=>{
    req.body.user = req.user.id;
    
    const product = await Product.create(req.body);

    res.status(201)
    .json({
        success:true,
        product
    })
})

// get all Product
exports.getAllProducts =catchAsyncError(async (req,res)=>{


    const resultPerPage = 5;
    const productCount = await Product.countDocuments();

    const apiFeature = new ApiFeatures(Product.find(),req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
   const products = await apiFeature.query;;
    res
    .status(200)
    .json({
        success:true,
        products,
        productCount
    })
})

// Update Products --ADMIN

exports.updateProduct = catchAsyncError(async (req,res,next)=>{
   let product = await Product.findById(req.params.id)
//    console.log(product);
   
   if(!product)
    return next(new ErrorHandler("Product not found",404))

/*  product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
   });*/

   try {
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
} catch (error) {
    console.log(error);
    return next(new ErrorHandler("Product update failed", 500));
}

   res.status(200).json({
        success:true,
        product
   })
})


// DELETE Product

exports.deleteProduct = catchAsyncError(async(req,res,next)=>{
    const product = await Product.findById(req.params.id)
    console.log(product);
    if(!product)
        return next(new ErrorHandler("Product not found",404))

    await product.deleteOne();

    res.status(200).json({
        success:true,
        message:"Product Deleted Sucessfully"
    })
})

// Get Product Details

exports.getProductDetails = catchAsyncError(async(req,res,next)=>
{
   const product = await Product.findById(req.params.id)

   if(!product)
    return next(new ErrorHandler("Product not found",404))
    

    return res.status(200).json({
        status:200,
        product
    })
})