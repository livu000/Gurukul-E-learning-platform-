// const Quiz = require('../models/quiz.model');

// (async () => {
//   try {
//     const quizzes = await Quiz.findAll();
//     console.log('Quizzes:', quizzes);
//   } catch (err) {
//     console.error('Error loading quizzes:', err);
//   }
// })();

// const QuizQuestion = require('../models/quizQuestion.model');

// (async () => {
//   try {
//     const questions = await QuizQuestion.findAll();
//     console.log('Quiz Questions:', questions);
//   } catch (err) {
//     console.error('QuizQuestion error:', err);
//   }
// })();

// const QuizOption = require('../models/quizOption.model');

// (async () => {
//   try {
//     const options = await QuizOption.findAll();
//     console.log('Quiz Options:', options);
//   } catch (err) {
//     console.error('QuizOption error:', err);
//   }
// })();

// const QuizAttempt = require('../models/quizAttempt.model');

// (async () => {
//   try {
//     const attempts = await QuizAttempt.findAll();
//     console.log('Quiz Attempts:', attempts);
//   } catch (err) {
//     console.error('QuizAttempt error:', err);
//   }
// })();


const QuizAnswer = require('../models/quizAnswer.model');

(async () => {
  try {
    const answers = await QuizAnswer.findAll();
    console.log('Quiz Answers:', answers);
  } catch (err) {
    console.error('QuizAnswer error:', err);
  }
})();
