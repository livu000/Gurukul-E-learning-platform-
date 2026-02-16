import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getQuizResult } from '../services/quiz.service';
import PageHeader from '../components/common/PageHeader';
import SkeletonCard from '../components/common/SkeletonCard';

function QuizResult() {

  const { attemptId } = useParams();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* =========================
     LOAD RESULT
  ========================= */
  useEffect(() => {

    const loadResult = async () => {
      try {
        const data = await getQuizResult(attemptId);
        setResult(data);
      } catch {
        setError('Failed to load result');
      } finally {
        setLoading(false);
      }
    };

    loadResult();

  }, [attemptId]);

  return (
    <div className="page">

      <PageHeader title="Quiz Result" />

      {error && <p className="form-error">{error}</p>}

      {/* =========================
          SKELETON LOADING
      ========================= */}
      {loading && (
        <div className="grid">
          <SkeletonCard />
        </div>
      )}

      {/* =========================
          RESULT CARD
      ========================= */}
      {!loading && result && (
        <div className="card">

          <div className="grid">

            <div>
              <p className="card-label">Score</p>
              <h2>{result.score}</h2>
            </div>

            <div>
              <p className="card-label">Submitted At</p>
              <p>{new Date(result.submittedAt).toLocaleString()}</p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default QuizResult;
