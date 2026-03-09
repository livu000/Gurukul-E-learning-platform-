import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import {
  getModulesByCourse,
  getLessonsByModule,
  getCourseById
} from "../services/course.service";

import { issueCertificate } from "../services/certificate.service";
import { createPayment, verifyPayment } from "../services/payment.service";

import PageHeader from "../components/common/PageHeader";
import SkeletonCard from "../components/common/SkeletonCard";

import api from "../services/api";

function CourseView() {

  const { id } = useParams();

  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState({});
  const [progress, setProgress] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [course, setCourse] = useState(null);

  // =========================
  // LOAD COURSE INFO
  // =========================
  useEffect(() => {

    const loadCourse = async () => {
      try {

        const res = await getCourseById(id);

        const courseData = res?.data || res;
        setCourse(courseData);

      } catch (err) {
        console.error("Failed to load course info", err);
      }
    };

    loadCourse();

  }, [id]);

  // =========================
  // LOAD MODULES
  // =========================
  useEffect(() => {

    const loadModules = async () => {
      try {

        const data = await getModulesByCourse(id);

        setModules(data || []);

      } catch (err) {

        console.error(err);
        setError("Failed to load modules");

      } finally {

        setLoading(false);

      }
    };

    loadModules();

  }, [id]);

  // =========================
  // LOAD PROGRESS + ENROLLMENT
  // =========================
  useEffect(() => {

    const fetchProgress = async () => {

      try {

        const res = await api.get(`/progress/course/${id}`);

        setProgress(res.data);
        setIsEnrolled(true);

      } catch (error) {

        if (error?.response?.status === 403) {

          setIsEnrolled(false);

        } else {

          console.error("Progress error:", error);

        }

      }

    };

    fetchProgress();

  }, [id]);

  // =========================
  // LOAD LESSONS PER MODULE
  // =========================
  const loadLessons = async (moduleId) => {

    if (lessons[moduleId]) return;

    try {

      const data = await getLessonsByModule(moduleId);

      setLessons((prev) => ({
        ...prev,
        [moduleId]: data || []
      }));

    } catch {

      setError("Failed to load lessons");

    }

  };

  // =========================
  // CERTIFICATE HANDLER
  // =========================
  const handleGetCertificate = async () => {

    try {

      const data = await issueCertificate(id);
      setCertificate(data);

    } catch (err) {

      alert(err.response?.data?.message || "Error generating certificate");

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

      window.location.reload();

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

        {!isEnrolled ? (

          <button
            className="btn btn-primary"
            onClick={handleBuyCourse}
            disabled={paying}
          >
            {paying ? "Processing Payment..." : "Buy Course"}
          </button>

        ) : (

          <span className="badge badge-success">
            Purchased
          </span>

        )}

      </div>

      {/* =========================
          PROGRESS CARD
      ========================= */}
      {isEnrolled && progress && (

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

        {modules.map((m) => (

          <div key={m.id} className="card">

            <h4
              style={{ cursor: "pointer" }}
              onClick={() => loadLessons(m.id)}
            >
              {m.title}
            </h4>

            {lessons[m.id] && (

              <ul>

                {lessons[m.id].map((l) => (

                  <li key={l.id}>
                    <Link to={`/lessons/${l.id}`}>
                      {l.title}
                    </Link>
                  </li>

                ))}

              </ul>

            )}

          </div>

        ))}

      </div>

    </div>
  );
}

export default CourseView;