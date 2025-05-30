const {executeStoredProcedure} = require("../config/dbExecution");
const TokenMethods = require("../middlewares/jsonToken");
const ErrorHandler = require("../errorHandlers/errorPrinting");

const userController = {
    async loginUser(req, res, next){
        try {
            let user = req.query.a || '';
            user = atob(user)
            user = user.toLowerCase();
            if(user && user.length > 0 && !user.startsWith("chagt")) user = "CHAGT" + user;
            const params = [{name : "Agentid", value : user}];
            const result = await executeStoredProcedure("GetAgencyDetailsByAgentid_Feedback", params);
            if(!result || !Array.isArray(result) || result.length < 1) return res.redirect(process.env.maindomain);
            const userData = {
                agentid : result[0].AgentID,
                emailid : result[0].Emailid,
                name : result[0].Name,
                logo : result[0].Logo?.replace("..", process.env.maindomain),
                comp_name : result[0].Comp_Name,
                mobile : result[0].Contact 
            };
            if(!userData.agentid  || !userData.name || userData.agentid == '' || userData.name == '') return res.redirect(process.env.maindomain);
            req.session.user = userData;
            const token  = TokenMethods.generateJSONToken(userData);
            return res.render("setToken", {token : token});
        } catch (error) {
            ErrorHandler(error, "Getting User Data");
            return res.redirect(process.env.maindomain);
        }
    },
    async testEnvironmentLogin(req, res, next){
        if(process.env.environment == 'development'){
            const params = [{name : "Agentid", value : "CHAGT000000307"}];
            const result = await executeStoredProcedure("GetAgencyDetailsByAgentid", params);
            if(!result || !Array.isArray(result) || result.length < 1) return res.redirect(process.env.maindomain);
            const userData = {
                agentid : result[0].AgentID,
                emailid : result[0].Emailid,
                name : result[0].Name,
                logo : result[0].Logo?.replace("..", process.env.maindomain)
            }
            req.session.user = userData;
            return next();
        }
        next();
    },
    async getAgentInfo(req, res, next){
        try {
            return res.status(200).json({userData : req.userInfo});
        } catch (error) {
            console.log(error)
            res.status(400).json({error: "Not Found"})
        }
    }
};

module.exports = userController;