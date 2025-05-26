const jwt = require("jsonwebtoken");

const jsonTokenHelper = {
    generateJSONToken( data , options ){
        return jwt.sign(data, process.env.JWT_SECRET_KEY, options);
    },
    verifyJSONToken(req, res, next){
        try {
        if(!req.header("Authorization")){
            return res.status(401).json('Auth Token missing');
        }
        const decodedData = jwt.verify( req.header("Authorization"), process.env.JWT_SECRET_KEY);
        if(!decodedData){
            return res.status(401).json({error : "Not Authorized"});
        }
        req.userInfo = decodedData;
        next();
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = jsonTokenHelper;