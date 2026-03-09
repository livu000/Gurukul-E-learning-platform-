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
     FETCH SUBMISSIONS
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

    if (marks === "" || marks === null) {
      alert("Please enter marks before saving");
      return;
    }

    try {

      await gradeSubmission(submissionId, {
        marks: Number(marks),
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

  return (

    <div className="page">

      <PageHeader title="Assignment Submissions" />

      {error && <p className="form-error">{error}</p>}

      {/* =========================
          LOADING STATE
      ========================= */}

      {loading && (
        <div className="grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* =========================
          EMPTY STATE
      ========================= */}

      {!loading && submissions.length === 0 && (
        <div className="card-muted">
          No submissions yet.
        </div>
      )}

      {/* =========================
          SUBMISSION LIST
      ========================= */}

      {!loading && submissions.length > 0 && (

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
   SUBMISSION CARD
================================================== */

function SubmissionCard({ submission, onGrade }) {

  const [marks, setMarks] = useState(
    submission.grade?.marks ?? ""
  );

  const [feedback, setFeedback] = useState(
    submission.grade?.feedback ?? ""
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
        {submission.submittedAt
          ? new Date(submission.submittedAt).toLocaleString()
          : "Unknown"}
      </p>

      <p><strong>Submission:</strong></p>

      <div className="card-muted">
        {submission.answerText || submission.content || "No answer text"}
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