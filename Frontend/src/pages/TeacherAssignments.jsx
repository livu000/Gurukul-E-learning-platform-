import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { createAssignment } from '../services/assignment.service';

function TeacherAssignments() {
  const { courseId } = useParams();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxMarks, setMaxMarks] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await createAssignment({
        courseId,
        title,
        description,
        maxMarks,
        dueDate
      });

      setSuccess('Assignment created successfully');
      setTitle('');
      setDescription('');
      setMaxMarks('');
      setDueDate('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create assignment');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '30px auto' }}>
      <h2>Create Assignment</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Assignment title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <br /><br />

        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
        />
        <br /><br />

        <input
          type="number"
          placeholder="Max Marks"
          value={maxMarks}
          onChange={e => setMaxMarks(e.target.value)}
          required
        />
        <br /><br />

        <input
          type="datetime-local"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        />
        <br /><br />

        <button type="submit">Create Assignment</button>
      </form>
    </div>
  );
}

export default TeacherAssignments;
