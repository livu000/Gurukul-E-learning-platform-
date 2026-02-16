import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizzesByCourse, startQuiz } from '../services/quiz.service';
import PageHeader from '../components/common/PageHeader';
import SkeletonCard from '../components/common/SkeletonCard';

function QuizList() {

  const { courseId } = useParams();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD QUIZZES
  ========================= */
  useEffect(() => {

    const loadQuizzes = async () => {
      try {
        const data = await getQuizzesByCourse(courseId);
        setQuizzes(data);
      } catch {
        setError('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();

  }, [courseId]);

  /* =========================
     START QUIZ
  ========================= */
  const handleStart = async (quizId) => {
    try {
      const attempt = await startQuiz(quizId);
      navigate(`/quiz/${quizId}/attempt/${attempt.id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot start quiz');
    }
  };

  return (
    <div className="page">

      <PageHeader title="Quizzes" />

      {error && <p className="form-error">{error}</p>}

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
          EMPTY STATE
      ========================= */}
      {!loading && quizzes.length === 0 && (
        <div className="card-muted">
          No quizzes available.
        </div>
      )}

      {/* =========================
          QUIZ CARDS
      ========================= */}
      <div className="grid">

        {!loading && quizzes.map((q) => (

          <div key={q.id} className="card">

            <h4>{q.title}</h4>

            <p>Total Marks: {q.totalMarks}</p>
            <p>Time Limit: {q.timeLimit || 'No limit'}</p>

            <div className="card-actions">
              <button
                className="btn btn-primary"
                onClick={() => handleStart(q.id)}
              >
                Start Quiz
              </button>
            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default QuizList;
