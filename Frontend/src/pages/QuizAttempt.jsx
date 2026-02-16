import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizQuestions, submitQuiz } from '../services/quiz.service';

function QuizAttempt() {
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    getQuizQuestions(quizId).then(setQuestions);
  }, [quizId]);

  const handleSelect = (questionId, optionId) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    const payload = {
      attemptId,
      answers: Object.entries(answers).map(([qId, optId]) => ({
        questionId: Number(qId),
        selectedOptionId: optId
      }))
    };

    await submitQuiz(payload);
    navigate(`/quiz/result/${attemptId}`);
  };

  return (
    <div className="page">
      <h2>Quiz</h2>

      {questions.map(q => (
        <div key={q.id} style={{ marginBottom: 20 }}>
          <strong>{q.questionText}</strong>
          <ul>
            {q.options.map(opt => (
              <li key={opt.id}>
                <label>
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={answers[q.id] === opt.id}
                    onChange={() => handleSelect(q.id, opt.id)}
                  />
                  {opt.optionText}
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <button onClick={handleSubmit}>Submit Quiz</button>
    </div>
  );
}

export default QuizAttempt;
