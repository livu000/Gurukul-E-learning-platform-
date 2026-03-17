import { useState } from "react";
import api from "../../services/api";
import { deleteLesson } from "../../services/course.service";

function LessonEditor({ lesson, moduleId }) {

  const [title, setTitle] = useState(lesson.title);
  const [content, setContent] = useState(lesson.content);
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl || "");

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {

    if (saving) return;

    setSaving(true);

    try {

      await api.patch(`/lessons/${lesson.id}`, {
        title,
        content,
        videoUrl,
        moduleId
      });

      alert("Lesson updated");

    } catch {

      alert("Failed to update lesson");

    } finally {

      setSaving(false);

    }

  };

  const handleDelete = async () => {

    if (!window.confirm("Delete this lesson?")) return;

    try {

      await deleteLesson(lesson.id);

      window.location.reload();

    } catch {

      alert("Failed to delete lesson");

    }

  };

  return (

    <div className="card-muted" style={{ marginTop: 10 }}>

      <strong>Lesson</strong>

      <input
        className="form-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="form-textarea"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <input
        className="form-input"
        placeholder="Video URL"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
      />

      <div style={{ marginTop: 10 }}>

        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          Save Lesson
        </button>

        <button
          className="btn btn-danger"
          onClick={handleDelete}
          style={{ marginLeft: 10 }}
        >
          Delete Lesson
        </button>

      </div>

    </div>

  );

}

export default LessonEditor;