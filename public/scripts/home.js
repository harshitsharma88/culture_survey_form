
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});

class QuizApp {
    constructor() {
        this.currentQuestionIndex = 0;
        this.totalQuestions = 10;
        this.selectedAnswers = {};
        this.isManualMode = false;
        this.questions = [];
        this.questionHelpTextFunction = {
            "multiple" : {
                text : "(You can select multiple options)",
                handler  : this.appendMultipleOptions
            },
            "single" : {
                text : "(Select only one)",
                handler : this.appendSingleOptions
            },
            "text" : {
                text : "(Enter your answer.)",
                handler : this.appendTextOptions
            },
            "multiple-text" : {
                text : "(You can select multiple options or enter your own.)",
                handler : this.appendMultiple_TextOptions
            },
            "single-text" : {
                text :"(Select one of all Or type your own)",
                handler : this.appendSingle_TextOptions
            },
            "multiple-text-both" : {
                text : "(Select multiple additionally type your own)",
                handler : this.appendBothMultipleTextOptions
            }
        }
        
        this.initializeElements();
        this.getUserInfo();
        this.bindEvents();
        this.loadQuestions();
    }

    async  fetchGet(url, headers = {}, options = {}){
        try {
            const token = localStorage.getItem("auth");
            if(!token || token == ''){
                showToast("Your last session was logged out.", "error");
                setTimeout(()=>{
                    location.replace("https://cultureholidays.com");
                }, 3000)
                return;
            }
            const response = await fetch(url, 
                {headers : {
                    'Content-Type' : 'application/json',
                    'Authorization' : token,
                    ...headers
                    }
                });
            if (!response.ok && response.status == 401) {
                showToast("Your last session was logged out.", "error");
                setTimeout(()=>{
                    location.replace("https://cultureholidays.com");
                }, 3000)
                return;
            }
            const parsedResponse = options.notjson ? response : await response.json();
            return parsedResponse;
        } catch (error) {
            throw error;
        }
    }

    async fetchPost(url, data , headers = {}, options = {}){
        try {
            const token = localStorage.getItem("auth");
            if(!token || token == ''){
                showToast("Your last session was logged out.", "error");
                setTimeout(()=>{
                    location.replace("https://cultureholidays.com");
                }, 3000)
                return;
            }
            const response = await fetch(url, 
                {   method: 'POST', 
                    body: JSON.stringify(data), 
                    headers:{
                        'Content-Type': 'application/json',
                        'Authorization' : token,
                        ...headers}
                });
            if (!response.ok && response.status == 401) {
                showToast("Your last session was logged out.", "error");
                setTimeout(()=>{
                    location.replace("https://cultureholidays.com");
                }, 3000)
                return;
            }
            const parsedResponse = options.notjson ? response : await response.json();
            return parsedResponse;
        } catch (error) {
            throw error;
        }
    }

    async getUserInfo(){
        try {
        const response = await this.fetchGet("/userinfo");
        const avatar = document.querySelector(".agent-avatar");
        avatar.style.backgroundImage = `url('${response.userData.logo}')`;
        document.querySelector(".agent-details").innerHTML = `
                    <h3>${response.userData.name}</h3>
                    <p>${response.userData.emailid}</p>`
        } catch (error) {
            console.log(error);   
        }
    }

    initializeElements() {
        this.elements = {
            currentQuestion: document.getElementById('currentQuestion'),
            totalQuestions: document.getElementById('totalQuestions'),
            questionText: document.getElementById('questionText'),
            optionsContainer: document.getElementById('optionsContainer'),
            manualInputContainer: document.getElementById('manualInputContainer'),
            manualAnswer: document.getElementById('manualAnswer'),
            toggleManualBtn: document.getElementById('toggleManualBtn'),
            nextBtn: document.getElementById('nextBtn'),
            progressBar: document.getElementById('progressBar'),
            loadingState: document.getElementById('loadingState'),
            quizContent: document.getElementById('quizContent'),
            ciculaeLoaderContainer: document.querySelector('.circular-loader-container'),
            answerSubmitBtn: document.getElementById('answerSubmitBtn')
        };
    }

    bindEvents() {
        // Option selection
        // this.elements.answerSubmitBtn.addEventListener('click', () => {
        //     this.submitManualAnswer();
        // });

        // Manual mode toggle
        this.elements.toggleManualBtn.addEventListener('click', () => {
            this.toggleManualMode();
        });

        this.elements.nextBtn.addEventListener('click', () => {
            this.nextQuestion();
        });

        // Manual input change
        this.elements.manualAnswer.addEventListener('input', () => {
            this.saveManualAnswer();
        });
    }

    async loadQuestions() {
        this.showLoading(true);
        
        try {

            this.questions = await this.getQuestions();
            if(!Array.isArray(this.questions) || this.questions.length < 1) return;
            this.totalQuestions = this.questions.length;
            this.elements.totalQuestions.textContent = this.totalQuestions;
            
            this.displayQuestion();
        } catch (error) {
            console.error('Error loading questions:', error);
            this.elements.questionText.textContent = 'Error loading questions. Please try again.';
        } finally {
            this.showLoading(false);
        }
    }

    async getQuestions(){
        try {
            const questions = await this.fetchGet("/getquestions");
            let qstnIndex = 0;
            if(Array.isArray(questions) && questions.length > 0) {
                questions.forEach((ques, index)=>{
                    if(ques.AGENTID != null && ques.AGENTID?.length > 0 && ques.CREATED_DATE != null){
                        qstnIndex = index + 1; 
                    }
                });
                if(qstnIndex >= questions.length ){
                    return this.showQuizCompleted();
                }
                if(qstnIndex > 0) {
                    showToast(`Starting from Question - ${qstnIndex + 1}.\nPreviously left on Question no. ${qstnIndex}`)
                    this.currentQuestionIndex = qstnIndex;
                }
                return questions;
            }
            showToast("No Questions available at the moment.", "error");
            setTimeout(()=>{
                location.replace("https://cultureholidays.com")
            }, 3000);
            return [];
        } catch (error) {
            showToast("Something went wrong.", "error");
            setTimeout(()=>{
                location.replace("https://cultureholidays.com")
            }, 3000);
        }
    }

    showLoading(show) {
        this.elements.loadingState.style.display = show ? 'block' : 'none';
        this.elements.quizContent.style.display = show ? 'none' : 'block';
    }

    displayQuestion() {
        if (this.questions.length === 0) return;
        this.navigateQuestion();
    }

    toggleManualMode() {
        this.isManualMode = !this.isManualMode;

        if (this.isManualMode) {
            // this.elements.optionsContainer.style.display = 'none';
            this.elements.manualInputContainer.style.display = 'block';
            // this.elements.toggleManualBtnthis.elements.toggleManualBtn.textContent = 'Show Options';
            // this.elements.toggleManualBtn.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
            this.elements.answerSubmitBtn.textContent = 'Submit Answer';
            this.elements.answerSubmitBtn.style.display = 'block';
            this.elements.answerSubmitBtn.disabled = false;
        } else {
            this.elements.optionsContainer.style.display = 'grid';
            this.elements.manualInputContainer.style.display = 'none';
            // this.elements.toggleManualBtn.textContent = 'Manual Entry';
            // this.elements.toggleManualBtn.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
            // this.elements.answerSubmitBtn.style.display = 'none';
        }
    }

    saveManualAnswer() {
        const answer = this.elements.manualAnswer.value.trim();
        if (answer) {
            this.selectedAnswers[this.currentQuestionIndex] = {
                type: 'manual',
                value: answer,
                text: answer
            };
        }
    }

    async nextQuestion() {
        // Check if answer is provided
        if (!this.selectedAnswers[this.currentQuestionIndex]) {
            alert('Please select an answer before proceeding.');
            return;
        }

        if (this.currentQuestionIndex < this.totalQuestions - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
        } else {
            // Submit quiz
        }
    }

    navigateQuestion(){
        if(this.currentQuestionIndex >= this.totalQuestions) return this.showQuizCompleted();
        this.refreshSubmitButton();
        // this.elements.toggleManualBtn.style.display = 'block';
        this.isManualMode = true;
        this.toggleManualMode();
        const progress = ((this.currentQuestionIndex ) / this.totalQuestions) * 100;
        this.elements.progressBar.style.width = `${progress}%`;
        scrollTo(0, 0);
        try {
            this.elements.currentQuestion.textContent = this.currentQuestionIndex + 1;
            const currentQuestion = this.currentQuestionIndex;
            const question = this.questions[currentQuestion];
            const questionType = question.QUESTION_TYPE;
            const {text, handler} = this.questionHelpTextFunction[questionType] || {};
            const optionsArray = JSON.parse(question.OPTIONS);
            this.elements.questionText.innerHTML = question.QUESTION + " " + `<p style="font-weight:normal;font-size:0.9rem;">${text || ''}</p>`;
            this.elements.questionText.dataset.qstnid = question.WQID;
            this.elements.questionText.dataset.qstntype = questionType;
            this.elements.optionsContainer.innerHTML = "";
            handler(this, question, optionsArray, question.OTHER_OPTION_TEXT);
            this.currentQuestionIndex++;
        } catch (error) {
            console.log(error);
        }
    }

    refreshSubmitButton(){
        this.elements.answerSubmitBtn.remove();
        const button = document.createElement("button");
        button.classList.add("btn","btn-primary");
        button.setAttribute("id", "answerSubmitBtn");
        button.textContent = "Submit Answer";
        this.elements.answerSubmitBtn = button;
        document.querySelector("div.button-container").appendChild(button);
    }

    appendSingleOptions(refrence,questionData, optionsArray){
        refrence.elements.answerSubmitBtn.style.display = "none";
        optionsArray.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.classList.add('option');
                optionElement.dataset.value = index + 1;
                optionElement.innerHTML = `
                    <span class="option-label">${String.fromCharCode(65 + index)}.</span>
                    <span class="option-text">${option}</span>
                `;
                optionElement.addEventListener('click', () => {
                    refrence.elements.toggleManualBtn.style.display = 'none';
                    if(optionElement.classList.contains('disabled') || optionElement.classList.contains('selected')) return;
                    optionElement.parentElement.querySelectorAll('.option').forEach(opt => {
                        opt.classList.remove('selected', 'option');
                        opt.classList.add('disabled');
                        opt.disabled = true
                    });
                    optionElement.classList.remove('disabled');
                    optionElement.classList.add('selected', 'option');
                    refrence.checkSelectedOption(questionData, option === questionData.CORRECT_ANSWER, option);
                    refrence.moveToNextQuestion();
                });
                refrence.elements.optionsContainer.appendChild(optionElement);
            });
    }
    
    appendSingle_TextOptions(refrence,questionData, optionsArray){
        refrence.elements.answerSubmitBtn.style.display = "block";
        refrence.elements.answerSubmitBtn.addEventListener("click", ()=>{
            refrence.submitSingle_TextResponse(refrence, questionData);
        })
         optionsArray.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.classList.add('option');
                optionElement.dataset.value = index + 1;
                optionElement.innerHTML = `
                    <span class="option-label">${String.fromCharCode(65 + index)}.</span>
                    <span class="option-text">${option}</span>
                `;
                optionElement.addEventListener('click', () => {
                    refrence.elements.toggleManualBtn.style.display = 'none';
                    if(optionElement.classList.contains('disabled') || optionElement.classList.contains('selected')) return;
                    optionElement.parentElement.querySelectorAll('.option').forEach(opt => {
                        opt.classList.remove('selected', 'option');
                        opt.classList.add('disabled');
                        opt.disabled = true
                    });
                    optionElement.classList.remove('disabled');
                    optionElement.classList.add('selected', 'option');
                });
                refrence.elements.optionsContainer.appendChild(optionElement);
            });

            const optionElement = document.createElement('div');
            optionElement.classList.add('option');
            optionElement.dataset.value = 5
            optionElement.innerHTML = `
                <span class="option-label">${String.fromCharCode(65 + optionsArray.length)}.</span>
                <span class="option-text">${questionData.OTHER_OPTION_TEXT}</span>
            `;
            optionElement.addEventListener('click', () => {
                refrence.toggleManualMode();
                refrence.elements.answerSubmitBtn.scrollIntoView({ behavior: 'smooth' });
            });
            refrence.elements.optionsContainer.appendChild(optionElement);
    }

    appendMultipleOptions(refrence,questionData, optionsArray){
        refrence.elements.answerSubmitBtn.style.display = "block";
        refrence.elements.answerSubmitBtn.addEventListener("click", ()=>{
            refrence.submitMultipleOptions(refrence, questionData, false);
        });
        optionsArray.forEach((option, index) => {
                            const optionElement = document.createElement('div');
            optionElement.classList.add('option', "with-checkbox");
            optionElement.dataset.value = index + 1;
            optionElement.innerHTML = `
                <span class="option-label">${String.fromCharCode(65 + index)}.</span>
                <span class="option-text">${option}</span>
            `;
            optionElement.addEventListener('click', () => {
                optionElement.classList.toggle('selected');

            });
            refrence.elements.optionsContainer.appendChild(optionElement);
        });
    }

    appendMultiple_TextOptions(refrence, questionData, optionsArray){
        refrence.elements.answerSubmitBtn.style.display = "block";
        refrence.elements.answerSubmitBtn.addEventListener("click", ()=>{
            refrence.submitMultipleOptions(refrence, questionData, true);
        });
        optionsArray.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.classList.add('option', "with-checkbox");
                optionElement.dataset.value = index + 1;
                optionElement.innerHTML = `
                    <span class="option-label">${String.fromCharCode(65 + index)}.</span>
                    <span class="option-text">${option}</span>
                `;
                optionElement.addEventListener('click', () => {
                    optionElement.classList.toggle('selected');

                });
                refrence.elements.optionsContainer.appendChild(optionElement);
            });

            const optionElement = document.createElement('div');
            optionElement.classList.add('option');
            optionElement.dataset.value = 5
            optionElement.innerHTML = `
                <span class="option-label">${String.fromCharCode(65 + optionsArray.length)}.</span>
                <span class="option-text">${questionData.OTHER_OPTION_TEXT}</span>
            `;
            optionElement.addEventListener('click', () => {
                refrence.toggleManualMode();
                refrence.elements.answerSubmitBtn.scrollIntoView({ behavior: 'smooth' });
            });
            refrence.elements.optionsContainer.appendChild(optionElement);
    }

    appendTextOptions(refrence, questionData, optionsArray){
        refrence.toggleManualMode();
        refrence.elements.manualAnswer.setAttribute("placeholder", questionData.OTHER_OPTION_TEXT || "Enter your answer")
        refrence.elements.answerSubmitBtn.addEventListener("click", ()=>{
            const res = refrence.submitManualAnswer(refrence, questionData);
            if(res) refrence.toggleManualMode();
        })
    }

    appendBothMultipleTextOptions(refrence,questionData, optionsArray){
         refrence.elements.answerSubmitBtn.style.display = "block";
        refrence.elements.answerSubmitBtn.addEventListener("click", ()=>{
            refrence.submitMultipleOptions(refrence, questionData, true);
        });
        optionsArray.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.classList.add('option', "with-checkbox");
                optionElement.dataset.value = index + 1;
                optionElement.innerHTML = `
                    <span class="option-label">${String.fromCharCode(65 + index)}.</span>
                    <span class="option-text">${option}</span>
                `;
                optionElement.addEventListener('click', () => {
                    optionElement.classList.toggle('selected');

                });
                refrence.elements.optionsContainer.appendChild(optionElement);
            });

            const optionElement = document.createElement('div');
            optionElement.classList.add('option');
            optionElement.dataset.value = 5
            optionElement.innerHTML = `
                <span class="option-label">${String.fromCharCode(65 + optionsArray.length)}.</span>
                <span class="option-text">${questionData.OTHER_OPTION_TEXT}</span>
            `;
            optionElement.addEventListener('click', () => {
                refrence.toggleManualMode();
                refrence.elements.answerSubmitBtn.scrollIntoView({ behavior: 'smooth' });
            });
            refrence.elements.optionsContainer.appendChild(optionElement);
    }

    moveToNextQuestion(){
        this.startCircularLoader();
        setTimeout(()=>{
            this.navigateQuestion();
        }, 1000);
        
    }

    async submitQuestionResponse(questionid, questionstring, useranswer, correctans = null, iscorrect = false, responsetype, typed_answer = null){
        try {
            const response = await this.fetchPost("/submitanswers", 
                {   
                    questionid, questionstring, 
                    useranswer : JSON.stringify(useranswer), correctans, 
                    responsetype, iscorrect, 
                    typed_answer
                });
        } catch (error) {
            console.log(error);
        }
    }

    submitSingle_TextResponse(refrence, questionData){
        let typed_answer = null;
        if( this.isManualMode){
            typed_answer =  refrence.elements.manualAnswer.value.trim();
            if(!typed_answer || typed_answer == '') {
                return showToast("Please choose an option or type your own to proceed.", "error");
            }
        }
        const responseArray = [];
        const answer = refrence.elements.optionsContainer.querySelector("div.selected")?.textContent;
        responseArray.push(answer);
        if((!typed_answer || typed_answer == '') && responseArray.length <1){
            return showToast("Please enter or choose from options.", "error")
        }
        refrence.submitQuestionResponse(questionData.WQID, questionData.QUESTION, responseArray, null, false, questionData.QUESTION_TYPE,typed_answer);
        refrence.elements.answerSubmitBtn.textContent = "Submitting...";
        refrence.elements.answerSubmitBtn.disabled = true;
        refrence.elements.manualAnswer.value = "";
        refrence.moveToNextQuestion();
    }

    submitManualAnswer(refrence, questionData){
        try {
            const userAnswer = this.elements.manualAnswer.value.trim();
            if (userAnswer) {
                this.elements.answerSubmitBtn.textContent = 'Submitting...';
                this.elements.answerSubmitBtn.disabled = true;
                this.elements.questionText.querySelector("p")?.remove();
                this.submitQuestionResponse(questionData.WQID, questionData.QUESTION, [], false, false, questionData.QUESTION_TYPE, userAnswer);
                this.moveToNextQuestion();
                this.elements.manualAnswer.value = '';
                return true;
            }else{
                showToast("Please enter your answer", "warning");
                return false;
            }
        } catch (error) {
            console.log(error);
        }
    }

    submitMultipleOptions(refrence, questionData, textOption = false){
        const responseArray = [];
        let typed_answer = null;
        if(textOption && this.isManualMode){
            typed_answer =  refrence.elements.manualAnswer.value.trim();
            if(!typed_answer || typed_answer == '') {
                return showToast("Please enter something or close ", "error");
            }
        }
        refrence.elements.optionsContainer.querySelectorAll(".option.selected").forEach(opt=>{
            responseArray.push(opt.querySelector(".option-text").textContent);
        });
        if(responseArray.length < 1 && (!typed_answer || typed_answer == '')){
            let msg = textOption ? "Please make a selection to continue." : "Please make a selection to continue."
            return showToast( msg, "error"); 
        }
        refrence.submitQuestionResponse(questionData.WQID, questionData.QUESTION, responseArray, null, false, questionData.QUESTION_TYPE, typed_answer);
        refrence.elements.answerSubmitBtn.textContent = "Submitting...";
        refrence.elements.answerSubmitBtn.disabled = true;
        refrence.elements.manualAnswer.value = "";
        refrence.moveToNextQuestion();
    }

    checkSelectedOption(questionData, isCorrect = false, optionString){
        try {
            this.submitQuestionResponse(questionData.WQID, questionData.QUESTION, [optionString], null, false, questionData.QUESTION_TYPE, null);
        } catch (error) {
            console.log(error);
        }
    }

    startCircularLoader(seconds = 1) {
        this.elements.ciculaeLoaderContainer.style.display = 'block';
        const circle = this.elements.ciculaeLoaderContainer.querySelector(".progress");
        const text = this.elements.ciculaeLoaderContainer.querySelector(".countdown-text");

        const totalLength = 2 * Math.PI * 45;
        let remaining = seconds;

        (() => {
            const percent = remaining / seconds;
            const offset = totalLength * (1 - percent);
            circle.style.strokeDashoffset = offset;
            text.textContent = remaining + "s";
            remaining--;
        })();

        const interval = setInterval(() => {
            const percent = remaining / seconds;
            const offset = totalLength * (1 - percent);
            circle.style.strokeDashoffset = offset;
            text.textContent = remaining + "s";

            if (remaining <= 0) {
            clearInterval(interval);
            text.textContent = "0s";
            this.elements.ciculaeLoaderContainer.style.display = 'none';
            }

            remaining--;
        }, 1000);

        // Initialize
        circle.style.strokeDasharray = totalLength;
        circle.style.strokeDashoffset = 0;
        text.textContent = seconds + "s";
    }

    showQuizCompleted(){
        document.querySelector(".quiz-card").style.display = "none";
        document.querySelector(".quiz-complete-container").style.display = "flex";
    }
}

function showToast(message, type = "info") {
  const typeMap = {
    success: {
      gradient: "linear-gradient(135deg, #28a745, #20c997)",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>`,
      borderColor: "#28a745",
      shadowColor: "40, 167, 69"
    },
    error: {
      gradient: "linear-gradient(135deg, rgb(220, 53, 69), rgb(209 9 9))",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>`,
      borderColor: "#dc3545",
      shadowColor: "220, 53, 69"
    },
    warning: {
      gradient: "linear-gradient(135deg, #ffc107, #fd7e14)",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`,
      borderColor: "#ffc107",
      shadowColor: "255, 193, 7"
    },
    info: {
      gradient: "linear-gradient(135deg, #17a2b8, #17a2b8)",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>`,
      borderColor: "#007bff",
      shadowColor: "0, 123, 255"
    }
  };

  // Create toast container if it doesn't exist
  let container = document.getElementById("modern-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "modern-toast-container";
    Object.assign(container.style, {
      position: "fixed",
      top: "24px",
      right: "24px",
      zIndex: "10000",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      alignItems: "flex-end",
      pointerEvents: "none",
      fontFamily: "'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif"
    });
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  const { icon, gradient, borderColor, shadowColor } = typeMap[type] || typeMap.info;

  // Close button
  const closeBtn = `<button style="
    background: none;
    border: none;
    color: rgba(255,255,255,0.8);
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    transition: all 0.2s ease;
    margin-left: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
  " onmouseover="this.style.background='rgba(255,255,255,0.2)'; this.style.color='white';" 
     onmouseout="this.style.background='none'; this.style.color='rgba(255,255,255,0.8)';"
     onclick="this.closest('.toast-item').remove();">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  </button>`;

  toast.className = "toast-item";
  toast.innerHTML = `
    <div style="display: flex; align-items: center; width: 100%;">
      <div style="
        background: rgba(255,255,255,0.25);
        border-radius: 50%;
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      ">
        ${icon}
      </div>
      <div style="flex: 1; color: white; font-weight: 500; line-height: 1.4; font-size: 14px;">
        ${message}
      </div>
      ${closeBtn}
    </div>
    <div style="
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background: rgba(255,255,255,0.8);
      border-radius: 0 0 12px 12px;
      animation: toast-progress 4s linear forwards;
    "></div>
  `;

  Object.assign(toast.style, {
    position: "relative",
    minWidth: "320px",
    maxWidth: "400px",
    padding: "8px 16px",
    background: gradient,
    borderRadius: "12px",
    color: "white",
    fontSize: "14px",
    fontFamily: "inherit",
    boxShadow: `0 8px 32px rgba(${shadowColor}, 0.3), 0 2px 8px rgba(0,0,0,0.1)`,
    border: `1px solid rgba(255,255,255,0.2)`,
    backdropFilter: "blur(10px)",
    opacity: "0",
    transform: "translateX(100%) scale(0.8)",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    pointerEvents: "auto",
    cursor: "pointer",
    overflow: "hidden"
  });

  // Add CSS keyframes for progress bar animation
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes toast-progress {
        from { width: 100%; }
        to { width: 0%; }
      }
      
      .toast-item:hover {
        transform: translateX(0) scale(1.02) !important;
        box-shadow: 0 12px 40px rgba(0,0,0,0.2) !important;
      }
      
      .toast-item:active {
        transform: translateX(0) scale(0.98) !important;
      }
    `;
    document.head.appendChild(style);
  }

  container.appendChild(toast);

  // Animate in with stagger effect
  requestAnimationFrame(() => {
    setTimeout(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(0) scale(1)";
    }, 50);
  });

  // Add click to dismiss
  toast.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
      dismissToast(toast);
    }
  });

  // Auto remove with pause on hover
  let timeoutId = setTimeout(() => dismissToast(toast), 4000);
  
  toast.addEventListener('mouseenter', () => {
    clearTimeout(timeoutId);
    toast.querySelector('[style*="animation"]').style.animationPlayState = 'paused';
  });
  
  toast.addEventListener('mouseleave', () => {
    toast.querySelector('[style*="animation"]').style.animationPlayState = 'running';
    timeoutId = setTimeout(() => dismissToast(toast), 2000);
  });

  function dismissToast(toastElement) {
    toastElement.style.opacity = "0";
    toastElement.style.transform = "translateX(100%) scale(0.8)";
    setTimeout(() => {
      if (toastElement.parentNode) {
        toastElement.remove();
      }
    }, 400);
  }

  // Return toast element for manual control if needed
  return toast;
}