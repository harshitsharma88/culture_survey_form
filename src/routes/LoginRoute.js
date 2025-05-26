const Router = require('express').Router();
const {loginUser} = require("../controllers/userController");

Router.get("/", loginUser);

module.exports = Router;