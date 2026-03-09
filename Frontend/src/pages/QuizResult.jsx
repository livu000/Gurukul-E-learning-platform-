import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getQuizResult } from "../services/quiz.service";

import PageHeader from "../components/common/PageHeader";
import SkeletonCard from "../components/common/SkeletonCard";

function QuizResult() {

  const { attemptId } = useParams();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================
     LOAD RESULT
  ========================= */
  useEffect(() => {

    const loadResult = async () => {

      try {

        const data = await getQuizResult(attemptId);
        setResult(data || null);

      } catch (err) {

        console.error("Failed to load result:", err);
        setError("Failed to load result");

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
          LOADING STATE
      ========================= */}
      {loading && (
        <div className="grid">
          <SkeletonCard />
        </div>
      )}

      {/* =========================
          EMPTY STATE
      ========================= */}
      {!loading && !result && !error && (
        <div className="card-muted">
          No result available.
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
              <h2>{result.score ?? "-"}</h2>
            </div>

            {result.totalQuestions !== undefined && (
              <div>
                <p className="card-label">Total Questions</p>
                <p>{result.totalQuestions}</p>
              </div>
            )}

            {result.correctAnswers !== undefined && (
              <div>
                <p className="card-label">Correct Answers</p>
                <p>{result.correctAnswers}</p>
              </div>
            )}

            {result.submittedAt && (
              <div>
                <p className="card-label">Submitted At</p>
                <p>
                  {new Date(result.submittedAt).toLocaleString()}
                </p>
              </div>
            )}

          </div>

        </div>

      )}

    </div>

  );

}

export default QuizResult;