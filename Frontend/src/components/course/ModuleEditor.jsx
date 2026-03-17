import { useState } from "react";
import { deleteModule } from "../../services/course.service";
import api from "../../services/api";

function ModuleEditor({ module, refreshModules }) {

  const [title, setTitle] = useState(module.title);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {

    if (saving) return;

    setSaving(true);

    try {

      await api.patch(`/modules/${module.id}`, {
        title
      });

      refreshModules();

    } catch {

      alert("Failed to update module");

    } finally {

      setSaving(false);

    }

  };

  const handleDelete = async () => {

    if (!window.confirm("Delete this module?")) return;

    try {

      await deleteModule(module.id);

      refreshModules();

    } catch {

      alert("Failed to delete module");

    }

  };

  return (

    <div>

      <h4>Module</h4>

      <input
        className="form-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div style={{ marginTop: 10 }}>

        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          Save
        </button>

        <button
          className="btn btn-danger"
          onClick={handleDelete}
          style={{ marginLeft: 10 }}
        >
          Delete Module
        </button>

      </div>

    </div>

  );

}

export default ModuleEditor;