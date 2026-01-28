import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubmissions } from '../services/assignment.service';

function AssignmentSubmissions() {
  const { assignmentId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getSubmissions(assignmentId)
      .then(setSubmissions)
      .catch(() => setError('Failed to load submissions'));
  }, [assignmentId]);

  return (
    <div style={{ maxWidth: 800, margin: '30px auto' }}>
      <h2>Assignment Submissions</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {submissions.length === 0 && <p>No submissions yet.</p>}

      <table border="1" width="100%" cellPadding="8">
        <thead>
          <tr>
            <th>Student</th>
            <th>Submitted At</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map(s => (
            <tr key={s.id}>
              <td>{s.student?.name || 'Student'}</td>
              <td>{new Date(s.submittedAt).toLocaleString()}</td>
              <td>{s.grade ? 'Graded' : 'Pending'}</td>
              <td>
                <Link to={`/assignments/submissions/${s.id}/grade`}>
                  Grade
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AssignmentSubmissions;
