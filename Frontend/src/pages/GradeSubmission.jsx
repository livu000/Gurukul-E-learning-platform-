import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  getSubmissionsByAssignment,
  gradeSubmission
} from '../services/assignment.service';

function AssignmentSubmissions() {
  const { assignmentId } = useParams();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  
  // Fetch submissions (React-correct)
  
  const fetchSubmissions = useCallback(async () => {
    try {
      const data = await getSubmissionsByAssignment(assignmentId);
      setSubmissions(data);
      setError('');
    } catch {
      setError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  
  // Grade submission

  const handleGrade = async (submissionId, marks, feedback) => {
    try {
      await gradeSubmission(submissionId, { marks, feedback });
      fetchSubmissions(); // refresh after grading
    } catch {
      alert('Failed to submit grade');
    }
  };

  if (loading) return <p>Loading submissions...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: 900, margin: '30px auto' }}>
      <h2>Assignment Submissions</h2>

      {submissions.length === 0 && <p>No submissions yet.</p>}

      {submissions.map((s) => (
        <SubmissionCard
          key={s.id}
          submission={s}
          onGrade={handleGrade}
        />
      ))}
    </div>
  );
}


// Submission Card

function SubmissionCard({ submission, onGrade }) {
  const [marks, setMarks] = useState(submission.grade?.marks || '');
  const [feedback, setFeedback] = useState(submission.grade?.feedback || '');

  return (
    <div
      style={{
        border: '1px solid #ccc',
        padding: 15,
        marginBottom: 15,
        borderRadius: 6
      }}
    >
      <h4>Student: {submission.student?.name || 'Unknown'}</h4>

      <p>
        <strong>Submitted At:</strong>{' '}
        {new Date(submission.submittedAt).toLocaleString()}
      </p>

      <p><strong>Submission:</strong></p>
      <p style={{ background: '#f9f9f9', padding: 10 }}>
        {submission.answerText}
      </p>

      <hr />

      <input
        type="number"
        placeholder="Marks"
        value={marks}
        onChange={(e) => setMarks(e.target.value)}
      />
      <br /><br />

      <textarea
        placeholder="Feedback"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={3}
      />
      <br /><br />

      <button
        onClick={() =>
          onGrade(submission.id, marks, feedback)
        }
      >
        Save Grade
      </button>
    </div>
  );
}

export default AssignmentSubmissions;
