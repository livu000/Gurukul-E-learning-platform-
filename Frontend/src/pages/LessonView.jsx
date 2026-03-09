import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../services/api";
import PageHeader from "../components/common/PageHeader";
import SkeletonCard from "../components/common/SkeletonCard";

const LessonView = () => {

  const { lessonId } = useParams();

  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* =========================
     FETCH LESSON
  ========================= */
  useEffect(() => {

    let isMounted = true;

    const fetchLesson = async () => {

      try {

        const res = await api.get(`/lessons/${lessonId}`);

        if (!isMounted) return;

        setLesson(res.data.lesson);
        setProgress(res.data.progress);

      } catch (err) {

        console.error("Lesson fetch failed:", err);

        if (!isMounted) return;

        setError("Failed to load lesson");

      } finally {

        if (isMounted) setLoading(false);

      }

    };

    fetchLesson();

    return () => {
      isMounted = false;
    };

  }, [lessonId]);

  /* =========================
     COMPLETE LESSON
  ========================= */
  const handleComplete = async () => {

    try {

      await api.post(`/lessons/${lessonId}/complete`);

      // update UI locally
      setProgress((prev) => ({
        ...prev,
        status: "completed"
      }));

    } catch (err) {

      console.error("Complete failed:", err);
      alert("Failed to mark lesson complete");

    }

  };

  return (

    <div className="page">

      <PageHeader title={lesson?.title || "Lesson"} />

      {/* =========================
          LOADING STATE
      ========================= */}
      {loading && (
        <div className="grid">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* =========================
          ERROR STATE
      ========================= */}
      {!loading && error && !lesson && (
        <p className="form-error">{error}</p>
      )}

      {/* =========================
          LESSON CONTENT
      ========================= */}
      {!loading && lesson && (

        <div className="card">

          {lesson.videoUrl && (

            <div className="video-wrapper">
              <video
                src={lesson.videoUrl}
                controls
                width="100%"
              />
            </div>

          )}

          <div className="card-content">
            <p>{lesson.content}</p>
          </div>

          <div className="card-actions">

            {progress?.status === "completed" ? (

              <span className="status-badge success">
                Lesson Completed
              </span>

            ) : (

              <button
                className="btn btn-primary"
                onClick={handleComplete}
              >
                Mark as Complete
              </button>

            )}

          </div>

        </div>

      )}

    </div>

  );

};

export default LessonView;