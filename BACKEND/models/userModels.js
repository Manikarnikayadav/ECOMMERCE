const mongoose = require('mongoose');
const bcrypt = require("bcryptjs")
const validator = require('validator');
const jwt = require('jsonwebtoken')


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter your name "],
        maxLength:[30,"Cannot exceed 30 characters"],
        minLength:[4,"Name should be more than 4 characters"]
    },
    email:{
        type:String,
        required:[true,"Please enter your email"],
        unique:true,
        validate:[validator.isEmail,"Please enter a valid email"],

    },
    password:{
        type:String,
        required:[true,"Please enter your password"],
        minLength:[8,"Name should be more than 8 characters"],
        select:false,
    },
    avatar:{
      public_id:{
        type:String,
        required:true,
      },
      url:{
        type:String,
        required:true,
      }
    },
    role:{
        type:String,
        default:"user"
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
},{timestamps:true});


userSchema.pre("save",async function(next){
  if(!this.isModified('password'))
    next();
  this.password = await bcrypt.hash(this.password,10)
})


// JWT Token
userSchema.methods.getJWTToken = function (){
  return jwt.sign({id:this._id},process.env.JWT_SECRET,{
    expiresIn:process.env.JWT_EXPIRE,
  })
}

// Compare Password

userSchema.methods.comparePassword = async function(enteredPassword){
  return await bcrypt.compare(enteredPassword,this.password);
}

module.exports = mongoose.model("User",userSchema);