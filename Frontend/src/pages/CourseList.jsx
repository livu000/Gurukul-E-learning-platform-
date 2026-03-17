import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getCourses,
  submitCourse,
  updateCourseStatus
} from "../services/course.service";

import PageHeader from "../components/common/PageHeader";
import SkeletonCard from "../components/common/SkeletonCard";

function CourseList() {

  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  // =========================
  // LOAD COURSES
  // =========================
  const loadCourses = async () => {
    try {
      const res = await getCourses();
      setCourses(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // =========================
  // OPEN COURSE
  // =========================
  const openCourse = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  // =========================
  // TEACHER SUBMIT
  // =========================
  const handleSubmitForReview = async (id) => {
    try {
      await submitCourse(id);
      loadCourses();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  // =========================
  // ADMIN STATUS UPDATE
  // =========================
  const handleUpdateStatus = async (id, status) => {
    try {
      await updateCourseStatus(id, status);
      loadCourses();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  // =========================
  // LOADING STATE
  // =========================
  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Course List" />
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

      <PageHeader title="Course List" />

      {error && <p className="form-error">{error}</p>}

      {courses.length === 0 && <p>No courses available</p>}

      {/* =========================
          COURSE GRID
      ========================= */}
      <div className="grid">

        {courses.map((course) => (

          <div
            key={course.id}
            className="card"
            onClick={() => openCourse(course.id)}
            style={{ cursor: "pointer" }}
          >

            <h4>{course.title}</h4>

            <p>{course.description}</p>

            {/* =========================
                STATUS BADGE
            ========================= */}
            <span
              className={`badge ${course.status === "published"
                  ? "badge-success"
                  : course.status === "review"
                    ? "badge-warning"
                    : "badge-neutral"
                }`}
            >
              {course.status}
            </span>

            {/* ROLE BASED ACTIONS */}
            <div style={{ marginTop: 12 }}>

              {/* TEACHER BUILDER */}
              {user?.role === "teacher" && (
                <button
                  className="btn btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/teacher/course/${course.id}/builder`);
                  }}
                  style={{ marginRight: 8 }}
                >
                  Open Builder
                </button>
              )}

              {/* TEACHER SUBMIT */}
              {user?.role === "teacher" && course.status === "draft" && (
                <button
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubmitForReview(course.id);
                  }}
                >
                  Submit for Review
                </button>
              )}

              {/* ADMIN ACTION */}
              {user?.role === "admin" && course.status === "review" && (
                <>
                  <button
                    className="btn btn-success"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateStatus(course.id, "published");
                    }}
                  >
                    Approve
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateStatus(course.id, "draft");
                    }}
                    style={{ marginLeft: 8 }}
                  >
                    Reject
                  </button>
                </>
              )}

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default CourseList;