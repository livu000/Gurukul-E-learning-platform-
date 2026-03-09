import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getQuizQuestions, submitQuiz } from "../services/quiz.service";

import PageHeader from "../components/common/PageHeader";
import SkeletonCard from "../components/common/SkeletonCard";

function QuizAttempt() {

  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     LOAD QUESTIONS
  ========================= */
  useEffect(() => {

    const loadQuestions = async () => {

      try {

        const data = await getQuizQuestions(quizId);

        setQuestions(data || []);

      } catch (err) {

        console.error("Failed to load quiz questions:", err);
        setError("Failed to load quiz questions");

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

    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId
    }));

  };

  /* =========================
     SUBMIT QUIZ
  ========================= */
  const handleSubmit = async () => {

    try {

      setSubmitting(true);

      const payload = {
        attemptId: Number(attemptId),
        answers: Object.entries(answers).map(([qId, optId]) => ({
          questionId: Number(qId),
          selectedOptionId: Number(optId)
        }))
      };

      await submitQuiz(payload);

      navigate(`/quiz/result/${attemptId}`);

    } catch (err) {

      console.error("Quiz submission failed:", err);

      alert(
        err.response?.data?.message ||
        "Failed to submit quiz"
      );

    } finally {

      setSubmitting(false);

    }

  };

  return (

    <div className="page">

      <PageHeader title="Quiz Attempt" />

      {error && <p className="form-error">{error}</p>}

      {/* =========================
          LOADING STATE
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
      {!loading && questions.length === 0 && (
        <div className="card-muted">
          No questions available for this quiz.
        </div>
      )}

      {/* =========================
          QUESTIONS
      ========================= */}
      {!loading && questions.map((q) => (

        <div key={q.id} className="card">

          <strong>{q.questionText}</strong>

          <ul className="quiz-options">

            {q.options.map((opt) => (

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
          SUBMIT BUTTON
      ========================= */}
      {!loading && questions.length > 0 && (

        <div className="page-actions">

          <button
            className="btn btn-primary"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>

        </div>

      )}

    </div>

  );
}

export default QuizAttempt;