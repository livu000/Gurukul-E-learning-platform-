import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { getAssignmentsByCourse } from "../services/assignment.service";

import PageHeader from "../components/common/PageHeader";
import SkeletonCard from "../components/common/SkeletonCard";

function AssignmentsList() {

  const { courseId } = useParams();

  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD ASSIGNMENTS
  ========================= */
  useEffect(() => {

    const loadAssignments = async () => {

      try {

        const data = await getAssignmentsByCourse(courseId);

        setAssignments(data || []);
        setError("");

      } catch (err) {

        console.error("Failed to load assignments:", err);
        setError("Failed to load assignments");

      } finally {

        setLoading(false);

      }

    };

    loadAssignments();

  }, [courseId]);

  /* =========================
     LOADING STATE
  ========================= */
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

      {error && <p className="form-error">{error}</p>}

      {/* =========================
          EMPTY STATE
      ========================= */}
      {!loading && assignments.length === 0 && (

        <div className="card-muted">
          No assignments available.
        </div>

      )}

      {/* =========================
          ASSIGNMENT CARDS
      ========================= */}
      <div className="grid">

        {assignments.map((a) => (

          <div key={a.id} className="card">

            <h4>{a.title}</h4>

            <p>Max Marks: {a.maxMarks}</p>

            <p>
              Due:{" "}
              {a.dueDate
                ? new Date(a.dueDate).toLocaleString()
                : "No deadline"}
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