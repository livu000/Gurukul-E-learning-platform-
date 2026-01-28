import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function GradeSubmission() {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/assignments/submissions/${submissionId}`)
      .then(res => setSubmission(res.data))
      .catch(() => setError('Failed to load submission'));
  }, [submissionId]);

  const handleGrade = async () => {
    try {
      await api.post('/assignments/grade', {
        submissionId,
        marks,
        feedback
      });

      navigate(-1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to grade');
    }
  };

  if (!submission) return <p>Loading submission...</p>;

  return (
    <div style={{ maxWidth: 600, margin: '30px auto' }}>
      <h2>Grade Submission</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <p><strong>Answer:</strong></p>
      <p>{submission.answerText}</p>

      <input
        type="number"
        placeholder="Marks"
        value={marks}
        onChange={e => setMarks(e.target.value)}
        required
      />
      <br /><br />

      <textarea
        placeholder="Feedback"
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
        rows={4}
      />
      <br /><br />

      <button onClick={handleGrade}>Submit Grade</button>
    </div>
  );
}

export default GradeSubmission;
