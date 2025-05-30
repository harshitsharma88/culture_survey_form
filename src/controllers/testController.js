const { executeStoredProcedure } = require("../config/dbExecution");
const Helpers = require("../utils/helper");
const ErrorHandler = require("../errorHandlers/errorPrinting");
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
                    reviewedby = null, typed_answer = null, clientipaddress = '0.0.0.0'}  = req.body;
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
                IPADDRESS : clientipaddress,
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
    },
    async sendCreditWalletMail(req, res, next){
        try {
            const {agentid, comp_name = "", mobile = "", emailid} = req.userInfo;
            if(!agentid || agentid == null || agentid == ''){
                return res.status(400).json({error : "Missing Required Parameters", message : "AgentID needed to process the request"});
            };
            // const { ipAddress } = Helpers.getIP_DeviceIfoOfRequest(req);
            const bookingID_Pr = executeStoredProcedure("usp_GetSequence", [{name : "servicetype", value : "OFFERBOOKING"}]);
            const transactionId_Pr = executeStoredProcedure("usp_GetSequence", [{name : "servicetype", value : "OFFERTXN"}]);
            const [{value : booking_ID} = {}, {value : txn_ID } = {}] = await Promise.allSettled([bookingID_Pr, transactionId_Pr]);
            if((Array.isArray(booking_ID) && booking_ID.length > 0) && (Array.isArray(txn_ID) && txn_ID.length > 0)){
                const bookOBJ = booking_ID[0];
                const txnOBJ = txn_ID[0];
                if(bookOBJ && txnOBJ){
                    const bookingID = bookOBJ[''];
                    const txnID = txnOBJ[''];
                    if(bookingID && txnID){
                        const insertWalletAPI_Data =  {
                            "bookingID": `${bookingID}`,
                            "txn_ID": `${txnID}`,
                            "agentID": agentid,
                            "usdAmount": 300,
                            "inrAmount": 0,
                            "agencyName": comp_name,
                            "emailId": emailid,
                            "mobileNo": mobile ,
                            "bookingStatus": "Success",
                            "bookingType": "Wallet",
                            "bookingMode": "Online",
                            "paymentMode": "Credit",
                            "paymentMessage": "$300 credit to wallet as survey feedback",
                            "createdDate": new Date(),
                            "remark": "$300 credit to wallet as per offer",
                            "ipAddress": req.body.clientipaddress || '0.0.0.0'
                        };
                        const result = await Helpers.postRequest(`${process.env.mainapi}Account/InsertWalletDetails`, insertWalletAPI_Data);
                        return res.status(200).json({result : result.data});
                    }
                }else{
                    return res.status(400).json({error : "Booking ID Or Txn Id not generated"});
                }
            }else{
                return res.status(400).json({error : "Booking ID Or Txn Id not generated"});
            }
        } catch (error) {
            ErrorHandler(error, "Error While hitting credit API")
            res.status(500).json({error});
        }
    }
};

module.exports = TestController;