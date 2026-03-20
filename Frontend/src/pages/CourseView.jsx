import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";

import {
  enrollInCourse,
  getCourseById,
  getCourseProgress
} from "../services/course.service";

import { issueCertificate } from "../services/certificate.service";
import { createPayment, verifyPayment } from "../services/payment.service";

import PageHeader from "../components/common/PageHeader";
import SkeletonCard from "../components/common/SkeletonCard";

function CourseView() {

  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));

  const [progress, setProgress] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [course, setCourse] = useState(null);

  const loadCourse = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const courseData = await getCourseById(id);

      setCourse(courseData);
      setIsEnrolled(Boolean(courseData?.isEnrolled));

      if (user?.role === "student" && courseData?.isEnrolled) {
        const progressData = await getCourseProgress(id);
        setProgress(progressData);
      } else {
        setProgress(null);
      }
    } catch (err) {
      console.error("Failed to load course", err);
      setError(err.response?.data?.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [id, user?.role]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  // =========================
  // CERTIFICATE HANDLER
  // =========================
  const handleGetCertificate = async () => {

    try {

      const data = await issueCertificate(id);
      setCertificate(data);
      await loadCourse();

    } catch (err) {

      alert(err.response?.data?.message || "Error generating certificate");

    }

  };

  const handleEnrollFree = async () => {
    try {
      setPaying(true);
      await enrollInCourse(id);
      await loadCourse();
    } catch (err) {
      alert(err.response?.data?.message || "Enrollment failed");
    } finally {
      setPaying(false);
    }
  };

  // =========================
  // PAYMENT HANDLER
  // =========================
  const handleBuyCourse = async () => {

    try {

      setPaying(true);

      const payment = await createPayment(id);
      await verifyPayment(payment.id);
      await loadCourse();

    } catch (err) {

      alert(err.response?.data?.message || "Payment failed");

    } finally {

      setPaying(false);

    }

  };

  // =========================
  // LOADING STATE
  // =========================
  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Course Details" />
        <div className="grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="page">

      <PageHeader title={course?.title || "Course Details"} />

      {error && <p className="form-error">{error}</p>}

      {/* =========================
          PURCHASE / STATUS CARD
      ========================= */}
      <div className="card">

        <p>{course?.description || "No description available."}</p>

        {course?.canManage ? (
          <span className="badge badge-info">
            Teacher/Admin access
          </span>
        ) : isEnrolled ? (
          <span className="badge badge-success">
            Enrolled
          </span>
        ) : user?.role === "student" ? (
          course?.isPaid ? (
            <button
              className="btn btn-primary"
              onClick={handleBuyCourse}
              disabled={paying}
            >
              {paying ? "Processing Payment..." : `Buy Course${course?.price ? ` - ₹${course.price}` : ""}`}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleEnrollFree}
              disabled={paying}
            >
              {paying ? "Enrolling..." : "Enroll for Free"}
            </button>
          )
        ) : (
          <span className="badge badge-neutral">
            Course preview
          </span>
        )}

      </div>

      {/* =========================
          PROGRESS CARD
      ========================= */}
      {user?.role === "student" && isEnrolled && progress && (

        <div className="card">

          <p>
            Progress: {progress.completedLessons} / {progress.totalLessons} lessons
          </p>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>

          <p className="progress-text">
            {progress.percentage}%
          </p>

          {progress.percentage === 100 && (

            <div>

              <button
                className="btn btn-primary"
                onClick={handleGetCertificate}
              >
                Get Certificate
              </button>

              {certificate && (
                <p className="form-success">
                  Certificate ID: {certificate.certificate_id}
                </p>
              )}

            </div>

          )}

        </div>

      )}

      {/* =========================
          MODULES LIST
      ========================= */}
      <div className="grid">

        {(course?.modules || []).map((m) => (

          <div key={m.id} className="card">

            <h4>{m.title}</h4>

            <ul>
              {(m.lessons || []).map((l) => (
                <li key={l.id}>
                  {course?.canManage || isEnrolled ? (
                    <Link to={`/lessons/${l.id}`}>
                      {l.title}
                    </Link>
                  ) : (
                    <span>{l.title}</span>
                  )}
                </li>
              ))}
            </ul>

          </div>

        ))}

      </div>

    </div>
  );
}

export default CourseView;
