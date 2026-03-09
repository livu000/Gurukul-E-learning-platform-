import { useEffect, useState } from "react";
import api from "../services/api";

import PageHeader from "../components/common/PageHeader";
import SkeletonCard from "../components/common/SkeletonCard";

function TeacherQuizList() {

  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD QUIZZES
  ========================= */

  useEffect(() => {

    const loadQuizzes = async () => {

      try {

        const res = await api.get("/quizzes/teacher");

        setQuizzes(res.data || []);

      } catch (err) {

        console.error("Failed to load quizzes:", err);

        setError("Failed to load quizzes");

      } finally {

        setLoading(false);

      }

    };

    loadQuizzes();

  }, []);

  return (

    <div className="page">

      <PageHeader title="My Quizzes" />

      {error && <p className="form-error">{error}</p>}

      {/* =========================
          GRID LAYOUT
      ========================= */}

      <div className="grid">

        {/* =========================
            SKELETON LOADING
        ========================= */}

        {loading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {/* =========================
            EMPTY STATE
        ========================= */}

        {!loading && quizzes.length === 0 && (
          <div className="card-muted">
            No quizzes created yet.
          </div>
        )}

        {/* =========================
            QUIZ CARDS
        ========================= */}

        {!loading && quizzes.length > 0 && quizzes.map((q) => (

          <div key={q.id} className="card">

            <h4>{q.title}</h4>

            <p className="card-muted">
              Total Marks: {q.totalMarks}
            </p>

            <span
              className={
                q.isPublished
                  ? "badge badge-success"
                  : "badge badge-warning"
              }
            >
              {q.isPublished ? "Published" : "Draft"}
            </span>

          </div>

        ))}

      </div>

    </div>

  );

}

export default TeacherQuizList;