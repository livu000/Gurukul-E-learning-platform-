import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

import PageHeader from "../components/common/PageHeader";
import SkeletonCard from "../components/common/SkeletonCard";

function Dashboard() {

  const user = JSON.parse(localStorage.getItem("user"));

  /* =========================
     STATE
  ========================= */

  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [teacherDashboard, setTeacherDashboard] = useState(null);
  const [teacherError, setTeacherError] = useState("");
  const [loadingTeacher, setLoadingTeacher] =
    useState(user?.role === "teacher");

  const [studentDashboard, setStudentDashboard] = useState(null);
  const [studentError, setStudentError] = useState("");
  const [loadingStudent, setLoadingStudent] =
    useState(user?.role === "student");

  const [adminDashboard, setAdminDashboard] = useState(null);
  const [adminError, setAdminError] = useState("");
  const [loadingAdmin, setLoadingAdmin] =
    useState(user?.role === "admin");

  /* =========================
     LOAD COURSES
  ========================= */

  useEffect(() => {

    const loadCourses = async () => {

      try {

        const res = await api.get("/courses");

        setCourses(res.data || []);

      } catch (err) {

        console.error("Failed to load courses:", err);
        setError("Failed to load courses");

      } finally {

        setLoadingCourses(false);

      }

    };

    loadCourses();

  }, []);

  /* =========================
     TEACHER DASHBOARD
  ========================= */

  useEffect(() => {

    if (user?.role !== "student") return;

    const loadStudentDashboard = async () => {

      try {

        const res = await api.get("/dashboard/student");
        setStudentDashboard(res.data);

      } catch (err) {

        console.error("Student dashboard error:", err);
        setStudentError("Failed to load student dashboard");

      } finally {

        setLoadingStudent(false);

      }

    };

    loadStudentDashboard();

  }, [user]);

  useEffect(() => {

    if (user?.role !== "teacher") return;

    const loadTeacherDashboard = async () => {

      try {

        const res = await api.get("/dashboard/teacher");

        setTeacherDashboard(res.data);

      } catch (err) {

        console.error("Teacher dashboard error:", err);
        setTeacherError("Failed to load teacher dashboard");

      } finally {

        setLoadingTeacher(false);

      }

    };

    loadTeacherDashboard();

  }, [user]);

  /* =========================
     ADMIN DASHBOARD
  ========================= */

  useEffect(() => {

    if (user?.role !== "admin") return;

    const loadAdminDashboard = async () => {

      try {

        const res = await api.get("/dashboard/admin");

        setAdminDashboard(res.data);

      } catch (err) {

        console.error("Admin dashboard error:", err);
        setAdminError("Failed to load admin dashboard");

      } finally {

        setLoadingAdmin(false);

      }

    };

    loadAdminDashboard();

  }, [user]);

  return (

    <div className="page">

      <PageHeader title="Dashboard" />

      {error && <p className="form-error">{error}</p>}

      {/* ROLE ACTION */}
      {(user?.role === "admin" || user?.role === "teacher") && (
        <Link
          to="/create-course"
          className="btn btn-primary"
        >
          Create Course
        </Link>
      )}

      {/* =========================
          STUDENT VIEW
      ========================= */}

      {user?.role === "student" && (
        <div style={{ marginTop: 25 }}>
          <h3>Student Dashboard</h3>

          {loadingStudent ? (
            <div className="grid">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : studentDashboard && (
            <>
              <div className="grid">
                <div className="card">
                  <h4>Enrolled Courses</h4>
                  <p>{studentDashboard.enrolledCourses?.length || 0}</p>
                </div>

                <div className="card">
                  <h4>Pending Assignments</h4>
                  <p>{studentDashboard.pendingAssignments?.length || 0}</p>
                </div>

                <div className="card">
                  <h4>Certificates</h4>
                  <p>{studentDashboard.certificates?.length || 0}</p>
                </div>

                <div className="card">
                  <h4>Last 7 Days</h4>
                  <p>{studentDashboard.weeklyProgress?.lessonsCompleted || 0} lessons completed</p>
                </div>
              </div>

              <div className="grid">
                <div className="card">
                  <h4>My Courses</h4>
                  {studentDashboard.enrolledCourses?.length === 0 ? (
                    <p>No enrolled courses yet.</p>
                  ) : (
                    studentDashboard.enrolledCourses.map((course) => (
                      <p key={course.id}>
                        <Link to={`/courses/${course.id}`}>{course.title}</Link> - {course.progressPercentage}% complete
                      </p>
                    ))
                  )}
                </div>

                <div className="card">
                  <h4>Pending Assignments</h4>
                  {studentDashboard.pendingAssignments?.length === 0 ? (
                    <p>No pending assignments.</p>
                  ) : (
                    studentDashboard.pendingAssignments.map((assignment) => (
                      <p key={assignment.id}>
                        <Link to={`/assignments/${assignment.id}/submit`}>{assignment.title}</Link>
                      </p>
                    ))
                  )}
                </div>

                <div className="card">
                  <h4>Quick Links</h4>
                  <p><Link to="/my-certificates">My Certificates</Link></p>
                  <p><Link to="/my-payments">My Payments</Link></p>
                </div>
              </div>
            </>
          )}

          {studentError &&
            <p className="form-error">{studentError}</p>}
        </div>

      )}

      {/* =========================
          TEACHER DASHBOARD
      ========================= */}

      {user?.role === "teacher" && (

        <div style={{ marginTop: 25 }}>

          <h3>Teacher Dashboard</h3>

          {loadingTeacher ? (

            <div className="grid">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>

          ) : teacherDashboard && (

            <div className="grid">

              <div className="card">
                <h4>Pending Assignments</h4>
                <p>{teacherDashboard.pendingAssignments}</p>
              </div>

              <div className="card">
                <h4>Total Quiz Attempts</h4>
                <p>{teacherDashboard.quizStats?.totalAttempts}</p>
              </div>

              <div className="card">
                <h4>Average Quiz Score</h4>
                <p>{teacherDashboard.quizStats?.averageScore}</p>
              </div>

              <div className="card">

                <h4>Your Courses</h4>

                {teacherDashboard.courses?.length === 0
                  ? <p>No courses created yet.</p>
                  : teacherDashboard.courses?.map((course) => (
                      <p key={course.courseId}>
                        {course.title} — Students: {course.studentCount}
                      </p>
                    ))
                }

              </div>

            </div>

          )}

          {teacherError &&
            <p className="form-error">{teacherError}</p>}

        </div>

      )}

      {/* =========================
          ADMIN DASHBOARD
      ========================= */}

      {user?.role === "admin" && (

        <div style={{ marginTop: 25 }}>

          <h3>Admin Dashboard</h3>

          {loadingAdmin ? (

            <div className="grid">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>

          ) : adminDashboard && (

            <div className="grid">

              <div className="card">
                <h4>Total Users</h4>
                <p>{adminDashboard.users?.total}</p>
              </div>

              <div className="card">
                <h4>Students</h4>
                <p>{adminDashboard.users?.students}</p>
              </div>

              <div className="card">
                <h4>Teachers</h4>
                <p>{adminDashboard.users?.teachers}</p>
              </div>

              <div className="card">
                <h4>Total Courses</h4>
                <p>{adminDashboard.courses?.total}</p>
              </div>

              <div className="card">
                <h4>Published Courses</h4>
                <p>{adminDashboard.courses?.published}</p>
              </div>

              <div className="card">
                <h4>Lesson Completions</h4>
                <p>{adminDashboard.activity?.lessonCompletions}</p>
              </div>

              <div className="card">
                <h4>Quiz Attempts</h4>
                <p>{adminDashboard.activity?.quizAttempts}</p>
              </div>

              <div className="card">
                <h4>Certificates Issued</h4>
                <p>{adminDashboard.activity?.certificatesIssued}</p>
              </div>

              <div className="card">
                <h4>Total Revenue</h4>
                <p>{adminDashboard.revenue?.total}</p>
              </div>

              <div className="card">
                <h4>Admin Tools</h4>
                <p><Link to="/admin/users">Manage Users</Link></p>
              </div>

            </div>

          )}

          {adminError &&
            <p className="form-error">{adminError}</p>}

        </div>

      )}

      {/* =========================
          AVAILABLE COURSES
      ========================= */}

      <h4 style={{ marginTop: 30 }}>
        Available Courses
      </h4>

      {loadingCourses ? (

        <div className="grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

      ) : (

        <div className="grid">

          {courses.map((course) => (

            <div key={course.id} className="card">

              <Link to={`/courses/${course.id}`}>
                {course.title}
              </Link>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}

export default Dashboard;
