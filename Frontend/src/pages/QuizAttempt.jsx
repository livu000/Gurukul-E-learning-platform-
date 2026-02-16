import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizQuestions, submitQuiz } from '../services/quiz.service';
import PageHeader from '../components/common/PageHeader';
import SkeletonCard from '../components/common/SkeletonCard';

function QuizAttempt() {

  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD QUESTIONS
  ========================= */
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await getQuizQuestions(quizId);
        setQuestions(data);
      } catch (err) {
        console.error("Failed to load quiz questions", err);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [quizId]);

  /* =========================
     HANDLE OPTION SELECT
  ========================= */
  const handleSelect = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  /* =========================
     SUBMIT QUIZ
  ========================= */
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

      <PageHeader title="Quiz Attempt" />

      {/* =========================
          SKELETON LOADING
      ========================= */}
      {loading && (
        <div className="grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* =========================
          QUESTIONS LIST
      ========================= */}
      {!loading && questions.map(q => (

        <div key={q.id} className="card">

          <strong>{q.questionText}</strong>

          <ul className="quiz-options">
            {q.options.map(opt => (
              <li key={opt.id}>
                <label className="quiz-option">
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

      {/* =========================
          ACTION BUTTON
      ========================= */}
      {!loading && questions.length > 0 && (
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleSubmit}>
            Submit Quiz
          </button>
        </div>
      )}

    </div>
  );
}

export default QuizAttempt;
