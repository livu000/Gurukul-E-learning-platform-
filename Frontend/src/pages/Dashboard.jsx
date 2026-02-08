import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');

  // Teacher dashboard state
  const [teacherDashboard, setTeacherDashboard] = useState(null);
  const [teacherError, setTeacherError] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));

  /* ================================
     Load all courses (existing logic)
  ================================ */
  useEffect(() => {
    api.get('/courses')
      .then(res => setCourses(res.data))
      .catch(() => setError('Failed to load courses'));
  }, []);

  /* ================================
     Load Teacher Dashboard (NEW)
  ================================ */
  useEffect(() => {
    if (user?.role !== 'teacher') return;

    api.get('/dashboard/teacher')
      .then(res => setTeacherDashboard(res.data))
      .catch(() => setTeacherError('Failed to load teacher dashboard'));
  }, [user]);

  return (
    <div>
      <h2>Dashboard</h2>

      {/* General error */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* ================================
          ROLE-BASED ACTIONS
      ================================ */}
      {(user?.role === 'admin' || user?.role === 'teacher') && (
        <button onClick={() => alert('Create Course UI goes here')}>
          Create Course
        </button>
      )}

      {/* ================================
          STUDENT VIEW
      ================================ */}
      {user?.role === 'student' && (
        <div style={{ margin: '20px 0' }}>
          <h4>Student Actions</h4>
          <Link to="/my-certificates">My Certificates</Link>
        </div>
      )}

      {/* ================================
          TEACHER DASHBOARD VIEW (NEW)
      ================================ */}
      {user?.role === 'teacher' && teacherDashboard && (
        <div style={{ marginTop: 30 }}>
          <h3>Teacher Dashboard</h3>

          {/* Teacher Courses */}
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

          {/* Pending Assignments */}
          <p>
            <strong>Pending Assignments to Grade:</strong>{' '}
            {teacherDashboard.pendingAssignments}
          </p>

          {/* Quiz Stats */}
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

      {/* Teacher dashboard error */}
      {teacherError && (
        <p style={{ color: 'red' }}>{teacherError}</p>
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
