const Authenticate = {
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