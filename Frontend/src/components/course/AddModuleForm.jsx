import { useState } from "react";
import { createModule } from "../../services/course.service";

function AddModuleForm({ courseId, refreshModules }) {

  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e) => {

    e.preventDefault();

    if (!title) return;

    setSaving(true);

    try {

      await createModule(courseId, title);

      setTitle("");

      refreshModules();

    } catch {

      alert("Failed to create module");

    } finally {

      setSaving(false);

    }

  };

  return (

    <form onSubmit={handleCreate} className="card">

      <h4>Add Module</h4>

      <input
        className="form-input"
        placeholder="Module title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <button className="btn btn-primary" disabled={saving}>
        {saving ? "Creating..." : "Create Module"}
      </button>

    </form>

  );

}

export default AddModuleForm;