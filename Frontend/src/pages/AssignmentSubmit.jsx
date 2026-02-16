import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submitAssignment } from '../services/assignment.service';

function AssignmentSubmit() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [answerText, setAnswerText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
    }
  };

  return (
    <div className="page">
      <h2>Submit Assignment</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <textarea
          rows={8}
          placeholder="Write your answer here..."
          value={answerText}
          onChange={e => setAnswerText(e.target.value)}
          required
        />
        <br /><br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default AssignmentSubmit;
