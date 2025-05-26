const Router = require('express').Router();
const loginRoute = require("./LoginRoute");
const TestRoute = require("./TestRoute");
const DashboardRoute = require("./dashboardRoute");
const {userAuthenticate} = require("../middlewares/authenticate");
const UserController = require("../controllers/userController");

Router.use("/login", loginRoute);

Router.use("/dashboard", DashboardRoute);

Router.use("/", TestRoute);

module.exports = Router;