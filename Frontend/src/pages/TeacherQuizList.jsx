import { useEffect, useState } from 'react';
import api from '../services/api';

function TeacherQuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/quizzes/teacher')
      .then(res => setQuizzes(res.data))
      .catch(() => setError('Failed to load quizzes'));
  }, []);

  return (
    <div className="page">
      <h2>My Quizzes</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {quizzes.length === 0 && <p>No quizzes created yet.</p>}

      <ul>
        {quizzes.map(q => (
          <li key={q.id} style={{ marginBottom: 10 }}>
            <strong>{q.title}</strong><br />
            Total Marks: {q.totalMarks}<br />
            Status: {q.isPublished ? 'Published' : 'Draft'}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TeacherQuizList;
