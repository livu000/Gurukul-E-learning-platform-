import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getQuizResult } from '../services/quiz.service';

function QuizResult() {
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    getQuizResult(attemptId).then(setResult);
  }, [attemptId]);

  if (!result) return <p>Loading result...</p>;

  return (
    <div style={{ maxWidth: 600, margin: '30px auto' }}>
      <h2>Quiz Result</h2>
      <p>Score: {result.score}</p>
      <p>Submitted at: {new Date(result.submittedAt).toLocaleString()}</p>
    </div>
  );
}

export default QuizResult;
