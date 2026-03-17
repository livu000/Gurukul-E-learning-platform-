import { useState } from "react";
import { createLesson } from "../../services/course.service";

function AddLessonForm({ moduleId, refreshLessons }) {

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [saving, setSaving] = useState(false);

  const handleCreate = async (e) => {

    e.preventDefault();

    if (!title) return;

    setSaving(true);

    try {

      await createLesson(moduleId, {
        title,
        content,
        videoUrl
      });

      setTitle("");
      setContent("");
      setVideoUrl("");

      refreshLessons();

    } catch {

      alert("Failed to create lesson");

    } finally {

      setSaving(false);

    }

  };

  return (

    <form className="card-muted" onSubmit={handleCreate}>

      <strong>Add Lesson</strong>

      <input
        className="form-input"
        placeholder="Lesson title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="form-textarea"
        placeholder="Lesson content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <input
        className="form-input"
        placeholder="Video URL"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
      />

      <button className="btn btn-primary" disabled={saving}>
        {saving ? "Creating..." : "Add Lesson"}
      </button>

    </form>

  );

}

export default AddLessonForm;