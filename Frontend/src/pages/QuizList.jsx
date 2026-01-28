import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizzesByCourse, startQuiz } from '../services/quiz.service';

function QuizList() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getQuizzesByCourse(courseId)
      .then(setQuizzes)
      .catch(() => setError('Failed to load quizzes'));
  }, [courseId]);

  const handleStart = async (quizId) => {
    try {
      const attempt = await startQuiz(quizId);
      navigate(`/quiz/${quizId}/attempt/${attempt.id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot start quiz');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '30px auto' }}>
      <h2>Quizzes</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {quizzes.length === 0 && <p>No quizzes available.</p>}

      <ul>
        {quizzes.map((q) => (
          <li key={q.id} style={{ marginBottom: 15 }}>
            <strong>{q.title}</strong><br />
            Total Marks: {q.totalMarks}<br />
            Time Limit: {q.timeLimit || 'No limit'}<br />
            <button onClick={() => handleStart(q.id)}>Start Quiz</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default QuizList;
