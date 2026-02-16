import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAssignmentsByCourse } from '../services/assignment.service';

function AssignmentsList() {
  const { courseId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getAssignmentsByCourse(courseId)
      .then(setAssignments)
      .catch(() => setError('Failed to load assignments'));
  }, [courseId]);

  return (
      <div className="page">
      <h2>Assignments</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {assignments.length === 0 && <p>No assignments available.</p>}

      <ul>
        {assignments.map(a => (
          <li key={a.id} style={{ marginBottom: 15 }}>
            <strong>{a.title}</strong><br />
            Max Marks: {a.maxMarks}<br />
            Due: {a.dueDate ? new Date(a.dueDate).toLocaleString() : 'No deadline'}<br />
            <Link to={`/assignments/${a.id}/submit`}>Submit Assignment</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AssignmentsList;
