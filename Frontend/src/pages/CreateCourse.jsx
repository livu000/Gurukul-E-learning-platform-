import { useState } from 'react';
import { createCourse } from '../services/course.service';
import PageHeader from '../components/common/PageHeader';

function CreateCourse() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setMessage('');

    try {
      await createCourse({ title, description });

      setMessage('Course created successfully');

      setTitle('');
      setDescription('');
    } catch (err) {
      console.error(err);
      setMessage('Not authorized or error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <PageHeader title="Create Course" />

      {/* =========================
          ENTERPRISE CARD CONTAINER
      ========================= */}
      <div className="card">

        {message && <p className="form-error">{message}</p>}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label className="form-label">Course Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Course Description</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              required
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Creating...' : 'Create'}
          </button>

        </form>

      </div>
    </div>
  );
}

export default CreateCourse;
