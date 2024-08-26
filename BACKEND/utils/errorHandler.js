class ErrorHandler extends Error{

    constructor(message,statusCode){
        super(message)
        this.statusCode = statusCode

        Error.captureStackTrace(this,this.constructor)
        // console.log(`hii ${this.status}`);
        
    }
}

module.exports =  ErrorHandler;