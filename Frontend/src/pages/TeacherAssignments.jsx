import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";

import {
  createAssignment,
  getAssignmentsByCourse
} from "../services/assignment.service";

import PageHeader from "../components/common/PageHeader";
import SkeletonCard from "../components/common/SkeletonCard";

function TeacherAssignments() {

  const { courseId } = useParams();

  const [assignments, setAssignments] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxMarks, setMaxMarks] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  /* =========================
     LOAD ASSIGNMENTS
  ========================= */
  const fetchAssignments = useCallback(async () => {

    try {

      const data = await getAssignmentsByCourse(
        Number(courseId)
      );

      setAssignments(data || []);

    } catch (err) {

      console.error("Failed to load assignments:", err);
      setError("Failed to load assignments");

    } finally {

      setLoading(false);

    }

  }, [courseId]);

  useEffect(() => {

    fetchAssignments();

  }, [fetchAssignments]);

  /* =========================
     CREATE ASSIGNMENT
  ========================= */
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (creating) return;

    setError("");
    setSuccess("");
    setCreating(true);

    try {

      await createAssignment({
        courseId: Number(courseId),
        title: title.trim(),
        description: description.trim(),
        maxMarks: Number(maxMarks),
        dueDate: dueDate || null
      });

      setSuccess("Assignment created successfully");

      setTitle("");
      setDescription("");
      setMaxMarks("");
      setDueDate("");

      fetchAssignments();

    } catch (err) {

      console.error("Assignment creation failed:", err);

      setError(
        err.response?.data?.message ||
        "Failed to create assignment"
      );

    } finally {

      setCreating(false);

    }

  };

  return (

    <div className="page">

      <PageHeader title="Assignments" />

      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">{success}</p>}

      {/* =========================
          ASSIGNMENT LIST
      ========================= */}
      <div className="grid">

        {loading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {!loading && assignments.length === 0 && (

          <div className="card-muted">
            No assignments created yet.
          </div>

        )}

        {!loading && assignments.map((a) => (

          <div key={a.id} className="card">

            <h4>{a.title}</h4>

            <p className="card-muted">
              Max Marks: {a.maxMarks}
            </p>

            {a.dueDate && (

              <span className="badge badge-info">
                Due: {new Date(a.dueDate).toLocaleDateString()}
              </span>

            )}

            <div className="card-actions">

              <Link
                to={`/assignments/${a.id}/submissions`}
                className="btn btn-secondary"
              >
                View Submissions
              </Link>

            </div>

          </div>

        ))}

      </div>

      {/* =========================
          CREATE ASSIGNMENT FORM
      ========================= */}
      <div className="card">

        <h3>Create Assignment</h3>

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label className="form-label">
              Title
            </label>

            <input
              className="form-input"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              required
            />

          </div>

          <div className="form-group">

            <label className="form-label">
              Description
            </label>

            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />

          </div>

          <div className="form-grid">

            <div className="form-group">

              <label className="form-label">
                Max Marks
              </label>

              <input
                className="form-input"
                type="number"
                value={maxMarks}
                onChange={(e) =>
                  setMaxMarks(e.target.value)
                }
              />

            </div>

            <div className="form-group">

              <label className="form-label">
                Due Date
              </label>

              <input
                className="form-input"
                type="datetime-local"
                value={dueDate}
                onChange={(e) =>
                  setDueDate(e.target.value)
                }
              />

            </div>

          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={creating}
          >
            {creating
              ? "Creating..."
              : "Create Assignment"}
          </button>

        </form>

      </div>

    </div>

  );

}

export default TeacherAssignments;
