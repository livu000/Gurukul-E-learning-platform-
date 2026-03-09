import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createCourse } from "../services/course.service";
import PageHeader from "../components/common/PageHeader";

function CreateCourse() {

  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [submitting, setSubmitting] = useState(false);

  /* =========================
     CREATE COURSE
  ========================= */
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (submitting) return;

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle || !cleanDescription) {
      setError("Title and description are required");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {

      await createCourse({
        title: cleanTitle,
        description: cleanDescription
      });

      setSuccess("Course created successfully");

      setTitle("");
      setDescription("");

      // redirect to course list
      setTimeout(() => {
        navigate("/courses");
      }, 1200);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        "Not authorized or error occurred"
      );

    } finally {

      setSubmitting(false);

    }

  };

  return (

    <div className="page">

      <PageHeader title="Create Course" />

      <div className="card">

        {error && (
          <p className="form-error">{error}</p>
        )}

        {success && (
          <p className="form-success">{success}</p>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label className="form-label">
              Course Title
            </label>

            <input
              type="text"
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
              Course Description
            </label>

            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows={5}
              required
            />

          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Creating..."
              : "Create"}
          </button>

        </form>

      </div>

    </div>

  );

}

export default CreateCourse;