const app = require("./app");
const dotenv = require("dotenv")
const connectDatabase = require("./config/databse.js")

// Handling Uncaught Exception error
process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Uncaught Exception`);
    process.exit(1);
})

// config

dotenv.config({path:"BACKEND/config/config.env"})


// Connecting to databse it should be called after config setup
connectDatabase()

const server = app.listen(process.env.PORT,()=>{
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
    
})


// console.log(youtube);
// this is called uncaught error


// Unhandled promise rejecteion (when our database uri is corrupted)

process.on("unhandledRejection",err=>{
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server due to unhandled Promise rejection");
    
    server.close(()=>{
        process.exit(1);
    })
})