import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  getSubmissionsByAssignment,
  gradeSubmission
} from '../services/assignment.service';
import PageHeader from '../components/common/PageHeader';
import SkeletonCard from '../components/common/SkeletonCard';

function AssignmentSubmissions() {

  const { assignmentId } = useParams();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* =========================
     FETCH SUBMISSIONS
  ========================= */

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

  /* =========================
     GRADE HANDLER
  ========================= */

  const handleGrade = async (submissionId, marks, feedback) => {
    try {
      await gradeSubmission(submissionId, { marks, feedback });
      fetchSubmissions();
    } catch {
      alert('Failed to submit grade');
    }
  };

  return (
    <div className="page">

      <PageHeader title="Assignment Submissions" />

      {error && <p className="form-error">{error}</p>}

      {/* =========================
          SKELETON LOADING
      ========================= */}
      {loading && (
        <div className="grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!loading && submissions.length === 0 && (
        <p>No submissions yet.</p>
      )}

      {!loading && (
        <div className="grid">
          {submissions.map((s) => (
            <SubmissionCard
              key={s.id}
              submission={s}
              onGrade={handleGrade}
            />
          ))}
        </div>
      )}

    </div>
  );
}


/* ==================================================
   ENTERPRISE SUBMISSION CARD
================================================== */

function SubmissionCard({ submission, onGrade }) {

  const [marks, setMarks] = useState(submission.grade?.marks || '');
  const [feedback, setFeedback] = useState(submission.grade?.feedback || '');

  return (
    <div className="card">

      <h4>Student: {submission.student?.name || 'Unknown'}</h4>

      <p>
        <strong>Submitted At:</strong>{' '}
        {new Date(submission.submittedAt).toLocaleString()}
      </p>

      <p><strong>Submission:</strong></p>

      <div className="card-muted">
        {submission.answerText || submission.content}
      </div>

      <div className="form-group">
        <label className="form-label">Marks</label>
        <input
          className="form-input"
          type="number"
          value={marks}
          onChange={(e) => setMarks(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Feedback</label>
        <textarea
          className="form-textarea"
          rows={3}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={() => onGrade(submission.id, marks, feedback)}
      >
        Save Grade
      </button>

    </div>
  );
}

export default AssignmentSubmissions;
