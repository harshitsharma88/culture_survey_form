const Router = require('express').Router();
const TestController = require("../controllers/testController");
const UserControlller = require("../controllers/userController");
const TokenMethods = require("../middlewares/jsonToken");

Router.get("/getquestions", TokenMethods.verifyJSONToken, TestController.getQuizQuestions);

Router.post("/submitanswers", TokenMethods.verifyJSONToken, TestController.submitQuizResponses);

Router.get("/userinfo", TokenMethods.verifyJSONToken, UserControlller.getAgentInfo)

Router.get("/", TestController.RenderTestPage);

module.exports = Router;