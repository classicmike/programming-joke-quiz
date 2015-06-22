(function($){
    var quiz = {};

    /***--------- UTILS ------------ ***/

    quiz.Utils = {};

    quiz.Utils.isInteger = function(x){
        var y = parseInt(x, 10);
        return !isNaN(y) && x == y && x.toString() == y.toString();
    };


    /***--------- UTILS ------------ ***/

    // Joe's approach to object orientation with MVC

    /*** --------- QUESTION MODEL ------------ ***/
    quiz.Question = function(questionJSON){
        this.questionText = questionJSON.questionText;
        this.possibleAnswers = [];
        this.addAnswers(questionJSON.answers);

        quiz.Question.id++;
        this.id = quiz.Question.id;

    };

    quiz.Question.prototype.addAnswers = function(answersJSON){
        for(var i = 0; i < answersJSON.length; i++){
            var answer = new quiz.Answer(answersJSON[i]);

            this.possibleAnswers.push(answer);
        }
    };

    quiz.Question.prototype.checkIfCorrect = function(answerId){
        if(!quiz.Utils.isInteger(answerId)){
            return false;
        }

        var answer = this.getAnswerById(answerId);

        //if no answer was found...
        if(!answer){
            return false;
        } else if(answer.isCorrect){
            return true;
        }

        return false;

    };

    quiz.Question.prototype.getAnswerById = function(answerId){
        var result = false;

        if(quiz.Utils.isInteger(answerId)){
            //check the answers
            for(var i = 0; i < this.possibleAnswers.length; i++){
                var answer = this.possibleAnswers[i];

                if(answer.id === answerId){
                    result = answer;
                    break;
                }
            }

        }

        return result;

    };

    quiz.Question.id = 0;

    /*** --------- QUESTION MODEL ------------ ***/

    /***--------- ANSWER MODEL ------------ ***/
    quiz.Answer = function(answerJSON){
        quiz.Answer.id++;
        this.id = quiz.Answer.id;
        this.isCorrect = answerJSON.isCorrect;
        this.answerText = answerJSON.answerText;
    };

    quiz.Answer.prototype.checkIfCorrect = function(){
        return this.isCorrect;
    };

    quiz.Answer.id = 0;
    quiz.Answer.INCORRECT = false;
    quiz.Answer.CORRECT = true;

    /***--------- ANSWERS MODEL ------------ ***/

    /***--------- QUESTIONS LIST ------------ ***/
    quiz.QuestionsList = function(){
        this.questions = [];
    };

    // this is done to allow the event emitter object to inherit into the questions list.
    quiz.QuestionsList.prototype = Object.create(EventEmitter.prototype);
    quiz.QuestionsList.prototype.constructor = quiz.QuestionsList;

    quiz.QuestionsList.prototype.setUp = function(){
        this.retrieveFromStorage();
    };

    quiz.QuestionsList.prototype.retrieveFromStorage = function(){
        //need to load from a JSON file external.

        $.getJSON(quiz.QuestionsList.JSON_FILE_TO_LOAD, this.processJSON.bind(this));
    };

    quiz.QuestionsList.prototype.processJSON = function(data){
        //create instance of the question object loop through all of the questions
        for(var i = 0; i < data.length; i++){
            var question = new quiz.Question(data[i]);
            this.questions.push(question);
        }

        this.emitEvent('update-view');
    };

    quiz.QuestionsList.prototype.questionsHaveBeenRetreived = function(){
        return this.questions.length > 0;
    };

    quiz.QuestionsList.prototype.getQuestionAtIndex = function(index){
        if(!quiz.Utils.isInteger(index)){
            return;
        }

        return this.questions[index];
    };

    quiz.QuestionsList.prototype.checkIfLast = function(question){
        if(!question){
            return false;
        }

        var finalQuestion = this.getQuestionAtIndex(this.questions.length -1);
        return finalQuestion.id === question.id;
    };

    quiz.QuestionsList.JSON_FILE_TO_LOAD =  'js/questions.json';

    /***--------- QUESTIONS LIST ------------ ***/



    /***--------- QUIZ CONTROLLER ------------ ***/
    quiz.QuizController = function(){
        this.setup();
        this.setEvents();
    };

    quiz.QuizController.prototype.setup = function(){
        this.questionsList = new quiz.QuestionsList();
        this.questionIndex = 0;
        this.score = 0;
        this.view = {};
    };


    quiz.QuizController.prototype.setEvents = function(){
        this.questionsList.addListener('update-view', this.updateView.bind(this));
    };

    quiz.QuizController.prototype.updateView = function(){
        //view gets updated
        this.questionIndex++;
        this.view.update();
    };

    quiz.QuizController.prototype.startBuildingDataForView = function(){
        if(this.questionsList.questionsHaveBeenRetreived()){
            this.updateView();
        } else {
            this.questionsList.retrieveFromStorage();
        }
    };

    quiz.QuizController.prototype.addScore = function(){
        this.score++;
    };

    quiz.QuizController.prototype.subtractScore = function(){
        if(this.score > 0 && this.score === this.questionIndex){
            this.score--;
        }
    };


    /***--------- QUIZ CONTROLLER ------------ ***/


    /***--------- QUIZ VIEW ------------ ***/
    quiz.QuizView = function(controller){
        if(!controller){
            return;
        }

        this.setUp(controller);
    };

    quiz.QuizView.prototype.setUp = function(controller){
        this.controller = controller;
        this.controller.view = this;

        this.setupSubViews();
        this.render();
    };

    quiz.QuizView.prototype.setupSubViews = function(){
        this.quizIndicatorView = new quiz.QuizIndicatorView(this);
        this.quizQuestionsListView = new quiz.QuizQuestionsListView(this);
        this.quizModalView = new quiz.QuizCompleteModalView(this);
    };

    quiz.QuizView.prototype.resetUI = function(){
        //reset the controller
        this.setUp();
    };

    quiz.QuizView.prototype.render = function(){
        this.controller.startBuildingDataForView();
    };

    quiz.QuizView.prototype.update = function(){
        this.quizIndicatorView.render();
        this.quizQuestionsListView.render();
    };


    quiz.QuizView.QUIZ_FORM_VIEW_ELEMENT_ID = '';

    /***--------- QUIZ VIEW ------------ ***/

    /***--------- QUIZ INDICATOR VIEW ------------ ***/
    quiz.QuizIndicatorView = function(view){
        this.setup(view);
    };

    quiz.QuizIndicatorView.prototype.setup = function(view){
        this.quizIndicatorElement = $(quiz.QuizIndicatorView.QUIZ_INDICATOR_ELEMENT_ID);
        this.parentView = view;
        this.controller = this.parentView.controller;
    };

    quiz.QuizIndicatorView.prototype.render = function(){
        var controller = this.controller;
        var htmlFragment = '<p class="h3">Your score: ' + controller.score + '/' + controller.questionIndex + '</p>';

        this.quizIndicatorElement.html(htmlFragment);
    };


    quiz.QuizIndicatorView.QUIZ_INDICATOR_ELEMENT_ID = '#quiz-indicator';


    /***--------- QUIZ INDICATOR VIEW ------------ ***/


    /***--------- QUIZ FORM VIEW ------------ ***/
    quiz.QuizQuestionsListView = function(view){
        this.setup(view);
    };

    quiz.QuizQuestionsListView.prototype.setup = function(view){
        this.questionsListElement = $(quiz.QuizQuestionsListView.QUESTIONS_LIST_ELEMENT_ID);
        this.parentView = view;
        this.controller = this.parentView.controller;
        this.childSubViews = [];
    };

    quiz.QuizQuestionsListView.prototype.render = function(){
        this.questionsListElement.empty();
        var questions = this.controller.questionsList.questions;

        for(var i = 0; i < questions.length; i++){
            var question = questions[i];
            var questionItemView = new quiz.QuizQuestionItemView(this);
            this.childSubViews.push(questionItemView);

            var isLast = this.controller.questionsList.checkIfLast(question);

            questionItemView.render(question, isLast);
        }

        //show the current question
        this.showCurrentQuestion();
    };


    quiz.QuizQuestionsListView.prototype.showCurrentQuestion = function(){
        var currentQuestionNumber = this.controller.questionIndex;
        var childQuestionView = this.childSubViews[parseInt(currentQuestionNumber -1)];

        childQuestionView.show();

    };

    quiz.QuizQuestionsListView.prototype.hideAllQuestionViews = function(){
        for(var i = 0; i < this.childSubViews.length; i++){
            var subView = this.childSubViews[i];
            subView.hide();
        }
    };



    quiz.QuizQuestionsListView.QUESTIONS_LIST_ELEMENT_ID = '#questions-list';


    /***--------- QUIZ FORM VIEW ------------ ***/


    /***--------- QUIZ QUESTION VIEW ------------ ***/
    quiz.QuizQuestionItemView = function(view){
        this.setup(view);
    };

    quiz.QuizQuestionItemView.prototype.setup = function(view){
        this.parentView = view;
        this.controller = this.parentView.controller;
        this.childSubViews = [];
        this.questionItemElement = null;
        this.questionItemElementNextButton = null;
        this.inCorrectAnswerAlertElement = null;

    };

    quiz.QuizQuestionItemView.prototype.render = function(question, isLast){
        var questionItemId = 'question-item-' + question.id;

        var questionSelector = $('<li id="' + questionItemId + '" class="section section-no-tear overrides-no-padding-top question-item">' +
            '<div class="container">' +
                '<div class="row">' +
                    '<header class="col-xs-12 section-header">' +
                        '<h2 class="h1">question ' + question.id + '</h2>' +
                    '</header>' +
                '</div>' +
                '<div class="row">' +
                    '<section class="section-body col-xs-12">' +
                        '<div class="section-body-inner text-center">' +
                            '<div class="row">' +
                                '<div class="col-xs-12 col-md-11 col-centered">' +
                                    '<div class="alert alert-success alert-dismissible" role="alert">' +
                                        (isLast ? quiz.QuizQuestionItemView.CORRECT_ALERT_LAST_TEXT : quiz.QuizQuestionItemView.CORRECT_ALERT_STANDARD_TEXT) +
                                        '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="row">' +
                                '<div class="col-xs-12 col-md-11 col-centered">' +
                                    '<div class="alert alert-danger alert-dismissible" role="alert">' +
                                        quiz.QuizQuestionItemView.INCORRECT_ALERT_TEXT +
                                        '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<p class="lead h2 spacious-heading question-text">' + question.questionText + '</p>' +
                            '<div class="row">' +
                                '<div class="col-xs-12 col-sm-10 col-md-6 list-group list-group-large answer-choices">'+
                                '</div>' +
                            '</div>' +
                            '<button class="button next-question">' + (isLast ? quiz.QuizQuestionItemView.NEXT_BUTTON_LAST_TEXT : quiz.QuizQuestionItemView.NEXT_BUTTON_STANDARD_TEXT) + ' &gt;</button>' +
                        '</div>' +
                    '</section>' +
                '</div>' +
            '</div>' +
        '</li>');

        //need to append first before being able to get context
        this.parentView.questionsListElement.append(questionSelector);
        this.questionItemElement = $('#' + questionItemId);
        this.questionItemElementNextButton = this.questionItemElement.find(quiz.QuizQuestionItemView.NEXT_BUTTON_CLASS);
        this.correctAnswerAlertElement = this.questionItemElement.find(quiz.QuizQuestionItemView.ALERT_CORRECT_CLASS);
        this.inCorrectAnswerAlertElement = this.questionItemElement.find(quiz.QuizQuestionItemView.ALERT_INCORRECT_CLASS);

        this.setEvents();
        this.renderAnswers(question);

    };

    quiz.QuizQuestionItemView.prototype.setEvents = function(){
        this.questionItemElementNextButton
            .on('click', this.nextButtonClicked.bind(this));
    };

    quiz.QuizQuestionItemView.prototype.nextButtonClicked = function(event){
        event.preventDefault();

        var totalQuestions = this.controller.questionsList.questions.length;

        if(this.controller.questionIndex === totalQuestions){
            var modalView = this.controller.view.quizModalView;
            modalView.open();
        } else {
            this.controller.questionIndex++;
            var quizIndicatorView = this.controller.view.quizIndicatorView;
            quizIndicatorView.render();

            this.parentView.showCurrentQuestion();
        }

    };

    quiz.QuizQuestionItemView.prototype.renderAnswers = function(question){
        for(var i = 0; i < question.possibleAnswers.length; i++){
            var answer = question.possibleAnswers[i];

            var answerItemView = new quiz.QuizAnswerItemView(this);
            this.childSubViews.push(answerItemView);

            answerItemView.render(answer, question);
        }
    };

    quiz.QuizQuestionItemView.prototype.getAnswersContainer = function(){
        return this.questionItemElement.find(quiz.QuizQuestionItemView.ANSWER_CHOICES_CLASS);
    };

    quiz.QuizQuestionItemView.prototype.show = function(){
        this.parentView.hideAllQuestionViews();
        this.questionItemElement.addClass(quiz.QuizQuestionItemView.QUESTION_ITEM_ACTIVE_ELEMENT_CLASS);
    };

    quiz.QuizQuestionItemView.prototype.hide = function(){
        this.questionItemElement.removeClass(quiz.QuizQuestionItemView.QUESTION_ITEM_ACTIVE_ELEMENT_CLASS);
    };

    quiz.QuizQuestionItemView.prototype.processUIForResult = function(result){

        console.log(result);

        if(!result){
            result = quiz.QuizQuestionItemView.QUESTION_STATE_DEFAULT;
        }



        switch(result){
            case quiz.QuizQuestionItemView.QUESTION_STATE_CORRECT:
                this.questionItemElementNextButton.addClass(quiz.QuizQuestionItemView.QUESTION_ITEM_ACTIVE_ELEMENT_CLASS);
                this.correctAnswerAlertElement.addClass(quiz.QuizQuestionItemView.QUESTION_ITEM_ACTIVE_ELEMENT_CLASS);
                this.inCorrectAnswerAlertElement.removeClass(quiz.QuizQuestionItemView.QUESTION_ITEM_ACTIVE_ELEMENT_CLASS);
            break;

            case quiz.QuizQuestionItemView.QUESTION_STATE_INCORRECT:
                this.questionItemElementNextButton.removeClass(quiz.QuizQuestionItemView.QUESTION_ITEM_ACTIVE_ELEMENT_CLASS);
                this.correctAnswerAlertElement.removeClass(quiz.QuizQuestionItemView.QUESTION_ITEM_ACTIVE_ELEMENT_CLASS);
                this.inCorrectAnswerAlertElement.addClass(quiz.QuizQuestionItemView.QUESTION_ITEM_ACTIVE_ELEMENT_CLASS);
            break;

            default:
                this.questionItemElementNextButton.removeClass(quiz.QuizQuestionItemView.QUESTION_ITEM_ACTIVE_ELEMENT_CLASS);
                this.correctAnswerAlertElement.removeClass(quiz.QuizQuestionItemView.QUESTION_ITEM_ACTIVE_ELEMENT_CLASS);
                this.inCorrectAnswerAlertElement.addClass(quiz.QuizQuestionItemView.QUESTION_ITEM_ACTIVE_ELEMENT_CLASS);
            break;
        }
    };


    quiz.QuizQuestionItemView.QUESTION_ITEM_ELEMENT_CLASS = '.question-item';
    quiz.QuizQuestionItemView.ANSWER_CHOICES_CLASS = '.answer-choices';
    quiz.QuizQuestionItemView.NEXT_BUTTON_CLASS = '.next-question';
    quiz.QuizQuestionItemView.ALERT_CORRECT_CLASS = '.alert.alert-success';
    quiz.QuizQuestionItemView.ALERT_INCORRECT_CLASS = '.alert.alert-danger';
    quiz.QuizQuestionItemView.QUESTION_ITEM_ACTIVE_ELEMENT_CLASS = 'active';
    quiz.QuizQuestionItemView.QUESTION_STATE_CORRECT = 'correct';
    quiz.QuizQuestionItemView.QUESTION_STATE_INCORRECT = 'incorrect';
    quiz.QuizQuestionItemView.QUESTION_STATE_DEFAULT = 'default';
    quiz.QuizQuestionItemView.NEXT_BUTTON_STANDARD_TEXT = 'Next';
    quiz.QuizQuestionItemView.NEXT_BUTTON_LAST_TEXT = 'Finish';
    quiz.QuizQuestionItemView.CORRECT_ALERT_STANDARD_TEXT = 'You have answered the question correctly! Click \'Next\' to see the next question! :)';
    quiz.QuizQuestionItemView.CORRECT_ALERT_LAST_TEXT = 'You have answered the question correctly! Click \'Finish\' to see your results! :)';
    quiz.QuizQuestionItemView.INCORRECT_ALERT_TEXT = 'OOPs! You have incorrectly answered the question! Try again! :(';

    /***--------- QUIZ QUESTION VIEW ------------ ***/

    /***--------- QUIZ ANSWER VIEW ------------ ***/
    quiz.QuizAnswerItemView = function(view){
        this.setup(view);
    };

    quiz.QuizAnswerItemView.prototype.setup = function(view){
        this.parentView = view;
        this.controller = this.parentView.controller;
        this.answerItemElement = null;
    };

    quiz.QuizAnswerItemView.prototype.render = function(answer, question){

        if(!question || !answer){
            return;
        }

        var answerCoicesContainer = this.parentView.getAnswersContainer();
        var answerId = + question.id + '-' + answer.id;

        var answerHTML = $('<div id="answer-choice-item-' + answerId + '" class="list-group-item answer-choice-item">' +
        '<div class="radio">' +
        '<input type="radio" id="answer-check-'+ answerId + '" name="answer-check-' + question.id + '" value="' + answer.answerText + '" data-' + quiz.QuizAnswerItemView.ANSWER_ID_DATA_ATTRIBUTE + '="' + answer.id + '">' +
        '<label for="answer-check-' + question.id + '-' + answer.id +'" class="h4 list-group-item-heading happy-list-item-heading">' + answer.answerText + '</label>' +
        '</div>' +
        '</div>');

        answerCoicesContainer.append(answerHTML);
        this.answerItemElement = $('#answer-choice-item-' + answerId);

        this.setEvents();
    };

    quiz.QuizAnswerItemView.prototype.setEvents = function(){
        this.answerItemElement.find('input[type="radio"]')
            .on('change', this.processAnswerChange.bind(this));
    };

    quiz.QuizAnswerItemView.prototype.processAnswerChange = function(event){

        var inputElement = $(event.target),
            answerId =  inputElement.data(quiz.QuizAnswerItemView.ANSWER_ID_DATA_ATTRIBUTE);

        if(quiz.Utils.isInteger(answerId) && !inputElement){
            return;
        }

        var currentQuestion = this.controller.questionIndex,
            question = this.controller.questionsList.getQuestionAtIndex(parseInt(currentQuestion-1));



        if(question.checkIfCorrect(answerId)){
            this.controller.addScore();
            this.answerItemElement.addClass(quiz.QuizAnswerItemView.ANSWER_CORRECT_CLASS);
            this.parentView.processUIForResult(quiz.QuizQuestionItemView.QUESTION_STATE_CORRECT);
        } else {
            //to prevent scores from being negative
            this.controller.subtractScore();
            this.answerItemElement.addClass(quiz.QuizAnswerItemView.ANSWER_INCORRECT_CLASS);
            this.parentView.processUIForResult(quiz.QuizQuestionItemView.QUESTION_STATE_INCORRECT);

        }

        var quizIndicator = this.controller.view.quizIndicatorView;
        quizIndicator.render();

    };

    quiz.QuizAnswerItemView.ANSWER_ID_DATA_ATTRIBUTE = 'answer-id';
    quiz.QuizAnswerItemView.ANSWER_INCORRECT_CLASS = 'answer-choice-item-incorrect';
    quiz.QuizAnswerItemView.ANSWER_CORRECT_CLASS = 'answer-choice-item-correct';

    /***--------- QUIZ ANSWER VIEW ------------ ***/


    /***--------- QUIZ COMPLETE MODAL VIEW ------------ ***/
    quiz.QuizCompleteModalView = function(view){
        this.setup(view);
        this.render();
    };

    quiz.QuizCompleteModalView.prototype.setup = function(view){
        this.parentView = view;
        this.controller = view.controller;
        this.modalElement = null;
    };

    quiz.QuizCompleteModalView.prototype.open = function(){
        this.modalElement.modal('show');
    };

    quiz.QuizCompleteModalView.prototype.render = function(){
        var modal = $('<div class="modal fade" id="' + quiz.QuizCompleteModalView.COMPLETE_MODAL_ID + '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">' +
        '<div class="modal-dialog" role="document">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
        '<h4 class="modal-title" id="myModalLabel">Your Quiz Results</h4>' +
        '</div>' +
        '<div class="modal-body text-center">' +
            '<img src="img/smiley-logo.png" alt="Happy Lists" class="img-responsive" width="250" style="margin-bottom: 50px;">' +
            '<p class="h4">' + quiz.QuizCompleteModalView.COMPLETE_MESSAGE + '</p>' +
        '</div>' +
        '<div class="modal-footer">' +
        '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>');

        $('body').append(modal);
        this.modalElement = $('#' + quiz.QuizCompleteModalView.COMPLETE_MODAL_ID);

    };


    quiz.QuizCompleteModalView.COMPLETE_MESSAGE = 'You have scored 10/10 for your quiz! Well done now you are an expert at Programming and Technical Matters!';
    quiz.QuizCompleteModalView.COMPLETE_MODAL_ID = 'results-modal';

    /***--------- QUIZ COMPLETE MODAL VIEW ------------ ***/


    $(document).ready(function(){
        var qiuzView = new quiz.QuizView(new quiz.QuizController());
    });

})(jQuery)

//set events to the view
