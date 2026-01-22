import { useEffect, useState } from 'react';
import { getCourses } from '../services/course.service';

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getCourses()
      .then(res => setCourses(res.data))
      .catch(() => setError('Failed to load courses'));
  }, []);

  return (
    <div>
      <h2>Courses</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {courses.length === 0 && <p>No courses available</p>}

      <ul>
        {courses.map(course => (
          <li key={course.id}>
            <strong>{course.title}</strong>
            <p>{course.description}</p>
            <small>Status: {course.status}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CourseList;

