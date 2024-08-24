const mongoose = require("mongoose")

const connectDatabase = ()=>{

    mongoose.connect(process.env.DB_URI,{
        // useNewUrlParser:true,
        // useUnifiedTopology:true,
        // useCreateIndex:true,// this is no longer supported
        // useFindAndModify: false,
    }).then((data)=>{
     console.log(`MongoDB connected with server:${data.Connection.host}`);
     
    }) 
}

module.exports = connectDatabase