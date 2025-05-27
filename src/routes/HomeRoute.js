const Router = require('express').Router();
const loginRoute = require("./LoginRoute");
const TestRoute = require("./TestRoute");
const DashboardRoute = require("./dashboardRoute");

Router.use("/login", loginRoute);

Router.use("/dashboard", DashboardRoute);

Router.use("/", TestRoute);

module.exports = Router;