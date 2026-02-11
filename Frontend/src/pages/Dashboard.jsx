import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Dashboard() {
  /* 
     Common state
  */
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');

  /* 
     Teacher dashboard state
  */
  const [teacherDashboard, setTeacherDashboard] = useState(null);
  const [teacherError, setTeacherError] = useState('');

  /* 
     Admin dashboard state
   */
  const [adminDashboard, setAdminDashboard] = useState(null);
  const [adminError, setAdminError] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));

  /* 
     Load all courses (ALL USERS)
   */
  useEffect(() => {
    api.get('/courses')
      .then(res => setCourses(res.data))
      .catch(() => setError('Failed to load courses'));
  }, []);

  /* 
     Load Teacher Dashboard
   */
  useEffect(() => {
    if (user?.role !== 'teacher') return;

    api.get('/dashboard/teacher')
      .then(res => setTeacherDashboard(res.data))
      .catch(() => setTeacherError('Failed to load teacher dashboard'));
  }, [user]);

  /* 
     Load Admin Dashboard
   */
  useEffect(() => {
    if (user?.role !== 'admin') return;

    api.get('/dashboard/admin')
      .then(res => setAdminDashboard(res.data))
      .catch(() => setAdminError('Failed to load admin dashboard'));
  }, [user]);

  return (
    <div>
      <h2>Dashboard</h2>

      {/* 
          GLOBAL ERROR
       */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* 
          ROLE-BASED ACTIONS
       */}
      {(user?.role === 'admin' || user?.role === 'teacher') && (
        <button onClick={() => alert('Create Course UI goes here')}>
          Create Course
        </button>
      )}

      {/*
          STUDENT VIEW
       */}
      {user?.role === 'student' && (
        <div style={{ margin: '20px 0' }}>
          <h4>Student Actions</h4>
          <Link to="/my-certificates">My Certificates</Link>
        </div>
      )}

      {/* 
          TEACHER DASHBOARD VIEW
       */}
      {user?.role === 'teacher' && teacherDashboard && (
        <div style={{ marginTop: 30 }}>
          <h3>Teacher Dashboard</h3>

          <h4>Your Courses</h4>
          {teacherDashboard.courses.length === 0 ? (
            <p>No courses created yet.</p>
          ) : (
            <ul>
              {teacherDashboard.courses.map(course => (
                <li key={course.courseId}>
                  {course.title} — Students: {course.studentCount}
                </li>
              ))}
            </ul>
          )}

          <p>
            <strong>Pending Assignments to Grade:</strong>{' '}
            {teacherDashboard.pendingAssignments}
          </p>

          <p>
            <strong>Total Quiz Attempts:</strong>{' '}
            {teacherDashboard.quizStats.totalAttempts}
          </p>

          <p>
            <strong>Average Quiz Score:</strong>{' '}
            {teacherDashboard.quizStats.averageScore}
          </p>
        </div>
      )}

      {teacherError && (
        <p style={{ color: 'red' }}>{teacherError}</p>
      )}

      {/* ================================
          ADMIN DASHBOARD VIEW
      ================================ */}
      {user?.role === 'admin' && adminDashboard && (
        <div style={{ marginTop: 30 }}>
          <h3>Admin Dashboard</h3>

          <h4>User Statistics</h4>
          <p>Total Users: {adminDashboard.users.total}</p>
          <p>Students: {adminDashboard.users.students}</p>
          <p>Teachers: {adminDashboard.users.teachers}</p>

          <h4>Course Statistics</h4>
          <p>Total Courses: {adminDashboard.courses.total}</p>
          <p>Published Courses: {adminDashboard.courses.published}</p>

          <h4>Learning Activity</h4>
          <p>Lesson Completions: {adminDashboard.activity.lessonCompletions}</p>
          <p>Quiz Attempts: {adminDashboard.activity.quizAttempts}</p>

          <h4>Revenue</h4>
          <p>Total Revenue: {adminDashboard.revenue.total}</p>
        </div>
      )}

      {adminError && (
        <p style={{ color: 'red' }}>{adminError}</p>
      )}

      {/* ================================
          AVAILABLE COURSES (ALL USERS)
      ================================ */}
      <h4>Available Courses</h4>

      <ul>
        {courses.map(course => (
          <li key={course.id}>
            <Link to={`/courses/${course.id}`}>
              {course.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
