const Router = require('express').Router();
const loginRoute = require("./LoginRoute");
const TestRoute = require("./TestRoute");
const DashboardRoute = require("./dashboardRoute");
const Authenticate = require("../middlewares/authenticate")

Router.use("/login", loginRoute);

Router.use("/dashboard", Authenticate.authenticateDashboardUser, DashboardRoute);

Router.use("/", TestRoute);

module.exports = Router;