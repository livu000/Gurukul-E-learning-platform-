import { useEffect, useState } from 'react';
import {
  getCourses,
  submitCourse,
  updateCourseStatus
} from '../services/course.service';

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Logged-in user (if any)
  const user = JSON.parse(localStorage.getItem('user'));

  const loadCourses = async () => {
    try {
      const res = await getCourses();
      setCourses(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // Teacher submits course
  const handleSubmitForReview = async (id) => {
    try {
      await submitCourse(id);
      alert('Course submitted for review');
      loadCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  // Admin approves/rejects
  const handleUpdateStatus = async (id, status) => {
    try {
      await updateCourseStatus(id, status);
      alert(`Course ${status}`);
      loadCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) return <p>Loading courses...</p>;

  return (
    <div style={{ maxWidth: 700, margin: '40px auto' }}>
      <h2>Courses</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {courses.length === 0 && <p>No courses available</p>}

      <ul>
        {courses.map(course => (
          <li key={course.id} style={{ marginBottom: 20 }}>
            <h4>{course.title}</h4>
            <p>{course.description}</p>
            <small>Status: {course.status}</small>
            <br /><br />

            {/* TEACHER ACTION */}
            {user?.role === 'teacher' && course.status === 'draft' && (
              <button onClick={() => handleSubmitForReview(course.id)}>
                Submit for Review
              </button>
            )}

            {/* ADMIN ACTION */}
            {user?.role === 'admin' && course.status === 'review' && (
              <>
                <button
                  onClick={() => handleUpdateStatus(course.id, 'published')}
                >
                  Approve
                </button>
                &nbsp;
                <button
                  onClick={() => handleUpdateStatus(course.id, 'draft')}
                >
                  Reject
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CourseList;
