var BasicCard = require("./BasicCard.js");
var ClozeCard = require("./ClozeCard.js");
var inquirer = require("inquirer");
var firebase = require('firebase')

var config = {
    apiKey: "AIzaSyDlLd4v4C23nvYENAkToNyVOW-Yk4aLAxo",
    authDomain: "flashcards-a5fff.firebaseapp.com",
    databaseURL: "https://flashcards-a5fff.firebaseio.com",
    projectId: "flashcards-a5fff",
    storageBucket: "",
    messagingSenderId: "197625443167"
  };

firebase.initializeApp(config);
  
var database = firebase.database();
var basicQuestionsArray = [];
var clozeQuestionsArray = [];

var quiz = function() {
  inquirer.prompt([
      {
          name: "action",
          type: "list",
          message: "What would you like to do?",
          choices: ['Create Question', 'Answer Question']
      }
  ]).then(function(answer) {

      if (answer.action === 'Create Question') {
          
        inquirer.prompt([
            {
                name: "cardType",
                type: "list",
                message: "What type of flash card you would like to create?",
                choices: ['Basic Card', 'Cloze Card']   
            },{
                name: "question",
                message: "Please write your question"
            }, {
                name: "answer",
                message: "Provide an answer"
            }
        ]).then(function(answers) {
            
            if (answers.cardType === 'Basic Card') {
                var basicQuestion = new BasicCard(answers.question, answers.answer);
                basicQuestionsArray.push(basicQuestion);
                database.ref('basicQuestionsArray').set(basicQuestion);
                console.log(basicQuestionsArray);
                quiz();
                
            } else if (answers.cardType === 'Cloze Card') {
                var clozeQuestion = new ClozeCard(answers.question, answers.answer);
                database.ref('clozeQuestionsArray').set(clozeQuestion);
                  console.log(clozeQuestionsArray);
                  quiz();
            };
        });

      } else if (answer.action === 'Answer Question') {
          inquirer.prompt([
              {
                  name: "questionType",
                  type: "list",
                  message: "What type of flash card you would like to use?",
                  choices: ['Basic Card', 'Cloze Card']
              }
          ]).then(function(answer) {
              if (answer.questionType === 'Basic Card') {

                database.ref().on("value", function(snapshot) {
                    
                    var sv = snapshot.val();

                    inquirer.prompt([
                        {
                            name: "question",
                            message: sv.basicQuestionsArray.front
                        }
                    ]).then(function(answer) {
                        if (answer.question === sv.basicQuestionsArray.back) {
                            console.log('-----------------');
                            console.log('This is correct');
                            console.log(sv.basicQuestionsArray.back);
                            console.log('-----------------');
                            quiz();
                        } else {
                            console.log('-----------------');
                            console.log('This is not Correct');
                            console.log('-----------------');
                            quiz();
                        }
                    });


                    }, function(errorObject) {
                    console.log("The read failed: " + errorObject.code);
                  });

              } else if (answer.questionType === 'Cloze Card') {

                database.ref().on("value", function(snapshot) {

                    var sv = snapshot.val();
                    
                    inquirer.prompt([
                        {
                            name: "question",
                            message: sv.clozeQuestionsArray.partial
                        }
                    ]).then(function(answer) {
                        if (answer.question === sv.clozeQuestionsArray.cloze) {
                            console.log('-----------------');
                            console.log('This is correct');
                            console.log(sv.clozeQuestionsArray.fullText);
                            console.log('-----------------');
                            quiz();
                        } else {
                            console.log('-----------------');
                            console.log('This is not Correct');
                            console.log(`Correct answer is: ${sv.clozeQuestionsArray.cloze}`);
                            console.log('-----------------');
                            quiz();
                        }
                    });
            

                    }, function(errorObject) {
                        console.log("The read failed: " + errorObject.code);
                        quiz();
                  });

              }
          })
      }
  });
};

quiz();


