import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";

import {
  getSubmissionsByAssignment,
  gradeSubmission
} from "../services/assignment.service";

import PageHeader from "../components/common/PageHeader";
import SkeletonCard from "../components/common/SkeletonCard";

function AssignmentSubmissions() {

  const { assignmentId } = useParams();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================
     LOAD SUBMISSIONS
  ========================= */
  const fetchSubmissions = useCallback(async () => {

    try {

      const data = await getSubmissionsByAssignment(
        Number(assignmentId)
      );

      setSubmissions(data || []);
      setError("");

    } catch (err) {

      console.error("Failed to load submissions:", err);
      setError("Failed to load submissions");

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
  const handleGrade = async (
    submissionId,
    marks,
    feedback
  ) => {

    try {

      await gradeSubmission(submissionId, {
        marksAwarded: Number(marks),
        feedback
      });

      fetchSubmissions();

    } catch (err) {

      console.error("Grade submission failed:", err);

      alert(
        err.response?.data?.message ||
        "Failed to submit grade"
      );

    }

  };

  /* =========================
     LOADING STATE
  ========================= */
  if (loading) {

    return (

      <div className="page">

        <PageHeader title="Assignment Submissions" />

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

      <PageHeader title="Assignment Submissions" />

      {error && <p className="form-error">{error}</p>}

      {/* =========================
          EMPTY STATE
      ========================= */}
      {!loading && submissions.length === 0 && (

        <div className="card-muted">
          No submissions yet.
        </div>

      )}

      {/* =========================
          SUBMISSION CARDS
      ========================= */}
      <div className="grid">

        {submissions.map((s) => (

          <SubmissionCard
            key={s.id}
            submission={s}
            onGrade={handleGrade}
          />

        ))}

      </div>

    </div>

  );

}

/* =========================
   SUBMISSION CARD
========================= */

function SubmissionCard({ submission, onGrade }) {

  const [marks, setMarks] = useState(
    submission.grade?.marksAwarded || ""
  );

  const [feedback, setFeedback] = useState(
    submission.grade?.feedback || ""
  );

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {

    if (saving) return;

    setSaving(true);

    await onGrade(
      submission.id,
      marks,
      feedback
    );

    setSaving(false);

  };

  return (

    <div className="card">

      <h4>
        Student: {submission.student?.name || "Unknown"}
      </h4>

      <p>
        <strong>Submitted At:</strong>{" "}
        {new Date(submission.submittedAt).toLocaleString()}
      </p>

      <p><strong>Submission:</strong></p>

      <div className="card-muted">
        {submission.answerText || submission.content}
      </div>

      <div className="form-group">

        <label className="form-label">
          Marks
        </label>

        <input
          className="form-input"
          type="number"
          value={marks}
          onChange={(e) =>
            setMarks(e.target.value)
          }
        />

      </div>

      <div className="form-group">

        <label className="form-label">
          Feedback
        </label>

        <textarea
          className="form-textarea"
          rows={3}
          value={feedback}
          onChange={(e) =>
            setFeedback(e.target.value)
          }
        />

      </div>

      <button
        className="btn btn-primary"
        disabled={saving}
        onClick={handleSave}
      >
        {saving ? "Saving..." : "Save Grade"}
      </button>

    </div>

  );

}

export default AssignmentSubmissions;
