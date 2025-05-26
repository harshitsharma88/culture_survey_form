const Router = require('express').Router();
const TestController = require('../controllers/testController');
const DashboardController = require('../controllers/dashboardController');

Router.post("/reviewquestion", TestController.submitQuizResponses);

Router.post('/addquestion', DashboardController.addWalletQuestion);

Router.get("/getresponses", DashboardController.getAllAgentsWithResponses);

module.exports = Router;