const Router = require('express').Router();
const TestController = require("../controllers/testController");
const UserControlller = require("../controllers/userController");
const TokenMethods = require("../middlewares/jsonToken");

Router.get("/getquestions", TokenMethods.verifyJSONToken, TestController.getQuizQuestions);

Router.get("/userinfo", TokenMethods.verifyJSONToken, UserControlller.getAgentInfo);

Router.post("/submitanswers", TokenMethods.verifyJSONToken, TestController.submitQuizResponses);

Router.post("/sendcreditmail", TokenMethods.verifyJSONToken, TestController.sendCreditWalletMail);

Router.get("/", TestController.RenderTestPage);

module.exports = Router;