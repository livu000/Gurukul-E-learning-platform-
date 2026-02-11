import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  createAssignment,
  getAssignmentsByCourse
} from '../services/assignment.service';

function TeacherAssignments() {
  const { courseId } = useParams();

  // =========================
  // State
  // =========================
  const [assignments, setAssignments] = useState([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxMarks, setMaxMarks] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // =========================
  // Load assignments
  // =========================
  const fetchAssignments = useCallback(async () => {
    try {
      const data = await getAssignmentsByCourse(courseId);
      setAssignments(data);
    } catch {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // =========================
  // Create assignment
  // =========================
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

      // Reset form
      setTitle('');
      setDescription('');
      setMaxMarks('');
      setDueDate('');

      // Reload list
      fetchAssignments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create assignment');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '30px auto' }}>
      <h2>Assignments</h2>

      
      {/* Assignment List */}
     
      {loading && <p>Loading assignments...</p>}

      {!loading && assignments.length === 0 && (
        <p>No assignments created yet.</p>
      )}

      {assignments.map((a) => (
        <div
          key={a.id}
          style={{
            border: '1px solid #ccc',
            padding: 12,
            marginBottom: 12,
            borderRadius: 6
          }}
        >
          <h4>{a.title}</h4>
          <p>Max Marks: {a.maxMarks}</p>
          <p>
            Due Date:{' '}
            {a.dueDate
              ? new Date(a.dueDate).toLocaleDateString()
              : 'No due date'}
          </p>

          <Link to={`/teacher/assignments/${a.id}/submissions`}>
            View Submissions
          </Link>
        </div>
      ))}

      <hr style={{ margin: '30px 0' }} />

      
      {/* Create Assignment */}
      
      <h3>Create Assignment</h3>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Assignment title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br /><br />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
        <br /><br />

        <input
          type="number"
          placeholder="Max Marks"
          value={maxMarks}
          onChange={(e) => setMaxMarks(e.target.value)}
          required
        />
        <br /><br />

        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <br /><br />

        <button type="submit">Create Assignment</button>
      </form>
    </div>
  );
}

export default TeacherAssignments;
