const {logError} = require('./errorLogging');

function catchBlock(error, errorHeading, res){
    console.log("-- INSIDE CATCHBLOCK --")
    let error_message;
    try {
        if(error.response){
            if(error.response.data){
                error_message = error.response.data
            }
            else{
                error_message = error.response
            }
        }else{
            error_message = error
        }
    } catch (error) {
       
        error_message = error
    }
    console.log(errorHeading, error_message);
    logError(error_message);
    if(res) return res.status(403).json(error_message);
};

module.exports = catchBlock;