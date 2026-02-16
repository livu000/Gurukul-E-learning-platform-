import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submitAssignment } from '../services/assignment.service';
import PageHeader from '../components/common/PageHeader';

function AssignmentSubmit() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [answerText, setAnswerText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await submitAssignment({
        assignmentId,
        answerText,
        fileUrl: null
      });

      setSuccess('Assignment submitted successfully');

      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <PageHeader title="Submit Assignment" />

      {/* =========================
          ENTERPRISE CARD WRAPPER
      ========================= */}
      <div className="card">

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Your Answer</label>

            <textarea
              className="form-textarea"
              rows={8}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              required
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>

      </div>
    </div>
  );
}

export default AssignmentSubmit;
