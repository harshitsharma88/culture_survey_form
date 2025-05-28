const Authenticate = {
    authenticateDashboardUser(req, res, next){
        try {
            const {userid, password} = req.headers;
            if((!userid || userid == '' || !password || password == '')){
                return res.status(401).json('Missing credentials');
            }
            if(userid != process.env.dashboarduser || password != process.env.dashboardpassword){
                return res.status(401).json('Incorrect userid and password');
            }
            next();
        } catch (error) {
            return res.status(401).json({"error" : "Unauthorized"});
        }
    },
    async userAuthenticate(req, res, next){
        if(!Authenticate.isUserLogin(req)){
            return res.redirect(process.env.maindomain);
        }
        next();
    },

    isUserLogin(req, res, next){
        try {
            const user = req.session.user;
            if(!user || Object.keys(user).length == 0) return false;
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}

module.exports = Authenticate;