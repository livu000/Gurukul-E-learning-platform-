import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    api.get('/courses')
      .then(res => setCourses(res.data))
      .catch(() => setError('Failed to load courses'));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* ROLE-BASED UI */}
      {(user?.role === 'admin' || user?.role === 'teacher') && (
        <button onClick={() => alert('Create Course UI goes here')}>
          Create Course
        </button>
      )}

      {/* STUDENT ACTIONS */}
      {user?.role === 'student' && (
        <div style={{ margin: '20px 0' }}>
          <h4>Student Actions</h4>
          <Link to="/my-certificates">My Certificates</Link>
        </div>
      )}

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
