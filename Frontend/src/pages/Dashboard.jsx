import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import SkeletonCard from '../components/common/SkeletonCard';

function Dashboard() {

  const user = JSON.parse(localStorage.getItem('user'));

  /* =========================
     STATE
  ========================= */

  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [teacherDashboard, setTeacherDashboard] = useState(null);
  const [teacherError, setTeacherError] = useState('');
  const [loadingTeacher, setLoadingTeacher] = useState(user?.role === 'teacher');

  const [adminDashboard, setAdminDashboard] = useState(null);
  const [adminError, setAdminError] = useState('');
  const [loadingAdmin, setLoadingAdmin] = useState(user?.role === 'admin');

  /* =========================
     LOAD COURSES
  ========================= */

  useEffect(() => {
    api.get('/courses')
      .then(res => setCourses(res.data))
      .catch(() => setError('Failed to load courses'))
      .finally(() => setLoadingCourses(false));
  }, []);

  /* =========================
     TEACHER DASHBOARD
     ✔ NO setState in early return
  ========================= */

  useEffect(() => {
    if (user?.role !== 'teacher') return;

    api.get('/dashboard/teacher')
      .then(res => setTeacherDashboard(res.data))
      .catch(() => setTeacherError('Failed to load teacher dashboard'))
      .finally(() => setLoadingTeacher(false));

  }, [user]);

  /* =========================
     ADMIN DASHBOARD
  ========================= */

  useEffect(() => {
    if (user?.role !== 'admin') return;

    api.get('/dashboard/admin')
      .then(res => setAdminDashboard(res.data))
      .catch(() => setAdminError('Failed to load admin dashboard'))
      .finally(() => setLoadingAdmin(false));

  }, [user]);

  return (
    <div className="page">

      <PageHeader title="Dashboard" />

      {error && <p className="form-error">{error}</p>}

      {/* ROLE ACTION */}
      {(user?.role === 'admin' || user?.role === 'teacher') && (
        <button
          className="btn btn-primary"
          onClick={() => alert('Create Course UI goes here')}
        >
          Create Course
        </button>
      )}

      {/* =========================
          STUDENT VIEW
      ========================= */}
      {user?.role === 'student' && (
        <div className="card">
          <h4>Student Actions</h4>
          <Link to="/my-certificates">My Certificates</Link>
        </div>
      )}

      {/* =========================
          TEACHER DASHBOARD
      ========================= */}
      {user?.role === 'teacher' && (
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
                <p>{teacherDashboard.quizStats.totalAttempts}</p>
              </div>

              <div className="card">
                <h4>Average Quiz Score</h4>
                <p>{teacherDashboard.quizStats.averageScore}</p>
              </div>

              <div className="card">
                <h4>Your Courses</h4>
                {teacherDashboard.courses.length === 0
                  ? <p>No courses created yet.</p>
                  : teacherDashboard.courses.map(course => (
                      <p key={course.courseId}>
                        {course.title} — Students: {course.studentCount}
                      </p>
                    ))
                }
              </div>

            </div>
          )}

          {teacherError && <p className="form-error">{teacherError}</p>}
        </div>
      )}

      {/* =========================
          ADMIN DASHBOARD
      ========================= */}
      {user?.role === 'admin' && (
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
                <p>{adminDashboard.users.total}</p>
              </div>

              <div className="card">
                <h4>Students</h4>
                <p>{adminDashboard.users.students}</p>
              </div>

              <div className="card">
                <h4>Teachers</h4>
                <p>{adminDashboard.users.teachers}</p>
              </div>

              <div className="card">
                <h4>Total Courses</h4>
                <p>{adminDashboard.courses.total}</p>
              </div>

              <div className="card">
                <h4>Published Courses</h4>
                <p>{adminDashboard.courses.published}</p>
              </div>

              <div className="card">
                <h4>Lesson Completions</h4>
                <p>{adminDashboard.activity.lessonCompletions}</p>
              </div>

              <div className="card">
                <h4>Quiz Attempts</h4>
                <p>{adminDashboard.activity.quizAttempts}</p>
              </div>

              <div className="card">
                <h4>Total Revenue</h4>
                <p>{adminDashboard.revenue.total}</p>
              </div>

            </div>
          )}

          {adminError && <p className="form-error">{adminError}</p>}
        </div>
      )}

      {/* =========================
          AVAILABLE COURSES
      ========================= */}
      <h4 style={{ marginTop: 30 }}>Available Courses</h4>

      {loadingCourses ? (
        <div className="grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid">
          {courses.map(course => (
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
