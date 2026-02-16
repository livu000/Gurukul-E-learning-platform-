import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAssignmentsByCourse } from '../services/assignment.service';

import PageHeader from '../components/common/PageHeader';
import SkeletonCard from '../components/common/SkeletonCard';

function AssignmentsList() {
  const { courseId } = useParams();

  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const data = await getAssignmentsByCourse(courseId);
        setAssignments(data);
        setError('');
      } catch {
        setError('Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, [courseId]);

  // =========================
  // ENTERPRISE SKELETON LOADING
  // =========================
  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Assignments" />
        <div className="grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader title="Assignments" />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {assignments.length === 0 && (
        <p>No assignments available.</p>
      )}

      {/* =========================
          ENTERPRISE GRID + CARD SYSTEM
      ========================= */}
      <div className="grid">
        {assignments.map((a) => (
          <div key={a.id} className="card">
            <h4>{a.title}</h4>

            <p>Max Marks: {a.maxMarks}</p>

            <p>
              Due:{' '}
              {a.dueDate
                ? new Date(a.dueDate).toLocaleString()
                : 'No deadline'}
            </p>

            <Link
              className="btn btn-primary"
              to={`/assignments/${a.id}/submit`}
            >
              Submit Assignment
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AssignmentsList;
