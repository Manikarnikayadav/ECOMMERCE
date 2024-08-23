const app = require("./app");
const dotenv = require("dotenv")
const connectDatabase = require("./config/databse.js")

// config

dotenv.config({path:"BACKEND/config/config.env"})


// Connecting to databse it should be called after config setup
connectDatabase()

app.listen(process.env.PORT,()=>{
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
    
})