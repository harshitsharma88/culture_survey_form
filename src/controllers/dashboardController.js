const {executeStoredProcedure} = require("../config/dbExecution");

const DashboardController  = {
    async getAllAgentsWithResponses(req, res, next){
        try{
            const params = [
                {name: 'AGENTID', value: req.query.id || null},
            ];
            const responses_Pr = executeStoredProcedure("USP_GetQuizQuestionsWithAgentResponses", params);
            const questions_Pr = executeStoredProcedure("USP_GetQuizQuestionsWithAgentResponses", [{name: 'AGENTID', value: "CHAGT"}]);
            const [{value : responses}, {value : questions = []} = {}] = await Promise.allSettled([responses_Pr, questions_Pr]);
            const arra = [];
            responses.forEach(element => {
                arra.push({AGENTID: element.AGENTID, response : JSON.parse(element.AgentResponses)})
            });
            res.status(200).json({responses : arra, totalQuestions : questions})
        }catch(err){
            console.log(err);
        }
    },
    async addWalletQuestion(req, res, next){
        try {
            const {questionid = null, questions_text, correct_answer = null,
                question_type, is_other_option, other_option_text, 
                options, updated_by, status = true 
            } = req.body;
            let msg = '';
            if(!questionid || questionid == null || questionid == undefined){
                if(!questions_text || questions_text == '') msg += 'Question Text is missing.\n';
                if(!question_type || question_type == '') msg += 'Question Type is missing ex("multiple", "single", "text")\n';
                if((!is_other_option || is_other_option == false) && (!options || options == '')) msg += 'If Other options is not there then options array should present\n';
                if((is_other_option || is_other_option == true || is_other_option == 1) && (!other_option_text || other_option_text == null || other_option_text == '')) msg += "Other button text can't be empty if other option is available.";
                if(msg.length > 0 || msg != '') return res.status(400).json({error : "Missing Required Parameters.", message : msg}); 
            };
            const params = [{name  : "QUESTION_ID", value : questionid}, {name : "QUESTION_TEXT", value : questions_text},
                {name : "CORRECT_ANSWER", value : correct_answer}, {name :"QUESTION_TYPE", value  : question_type},
                {name : "IS_OTHER_OPTION", value : is_other_option}, {name  : "OTHER_OPTION_TEXT",  value : other_option_text},
                {name : "OPTIONS", value  : JSON.stringify(options)}, {name : "UPDATED_BY", value : updated_by}, {name : "STATUS", value : status}];
            const result = await executeStoredProcedure("USP_ADD_UPDATE_WALLET_QUESTIONS", params);
            return res.status(200).json(result);
        } catch (error) {
            console.log(error);
            return res.status(500).json({error : "Insertion failed.", error_msg : error});
        }
    }
};

module.exports = DashboardController;