const { executeStoredProcedure } = require("../config/dbExecution");
const Helpers = require("../utils/helper");
const path = require("path");

const TestController = {

    async RenderTestPage(req, res, next){
        try {
            res.sendFile(path.join(__dirname, "../..", "public", "views", "home.html"));
        } catch (error) {
            console.log(error);
        }
    },
    async submitQuizResponses(req, res, next){
        try {
            const {ipAddress, deviceInfo} = Helpers.getIP_DeviceIfoOfRequest(req);
            const {questionid, useranswer, correctans, responsetype,
                    questionstring, usdamount = 0,
                    agentid, iscorrect = false, reviewed = false, 
                    reviewedby = null, typed_answer = null}  = req.body;
            // Make SP parameters here 
            const spData = {
                AGENTID : req.userInfo.agentid || agentid,
                EMAIL : req.userInfo.emailid,
                NAME : req.userInfo.name,
                QUESTIONNUM : questionid,
                QUESTIONSTRING : questionstring,
                CORRECTANSWERSTRING : correctans,
                USERANSWER : useranswer,
                RESPONSETYPE : responsetype,
                TYPED_ANSWER : typed_answer,
                IPADDRESS : ipAddress,
                DEVICE : deviceInfo,
                ISCORRECT : iscorrect,
                USDAMOUNT : usdamount,
                REVIEWEDBY : reviewedby,
                ISREVIEWED : reviewed,
            }
            let msg = '';
            if(!spData.AGENTID || spData.AGENTID == ''|| !spData.QUESTIONNUM || spData.QUESTIONNUM == ''){
                msg = (!spData.AGENTID || spData.AGENTID == '') ? 'Agent ID is required' : 'Question ID is required';
                return res.status(400).json({error : 'Missing Required Parameters', message : msg});
            }
            const params = [];
            Object.entries(spData).forEach(([key, value]) => {
                params.push({name: key, value: value});
            });
            const result = await executeStoredProcedure('USP_INSERTorUPDATE_WALLET_QUIZ_RESPONSE', params);
            return res.status(200).json({result});
        } catch (error) {
            console.log(error);
        }
    },
    async getQuizQuestions(req, res, next){
        try {
            const agentid = req.userInfo.agentid;
            if(!agentid || agentid == null || agentid == ''){
                return res.status(400).json({error : "Missing Required Parameters", message : "AgentID needed to process the request"})
            }
            const params = [
                {name: 'AGENTID', value: agentid},
            ];
            const questions = await executeStoredProcedure("USP_GetQuizQuestionsWithAgentResponses", params);
            return res.status(200).json(questions);
        } catch (error) {
            return res.status(200).json([]);
        }
    }
};

module.exports = TestController;