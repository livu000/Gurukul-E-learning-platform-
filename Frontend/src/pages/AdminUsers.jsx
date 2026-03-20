import { useEffect, useState } from "react";

import { getUsers, updateUser } from "../services/user.service";

import PageHeader from "../components/common/PageHeader";
import SkeletonCard from "../components/common/SkeletonCard";

function AdminUsers() {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingUserId, setSavingUserId] = useState(null);

  useEffect(() => {

    const loadUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data || []);
      } catch (err) {
        console.error("Failed to load users:", err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();

  }, []);

  const handleFieldChange = (userId, field, value) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, [field]: value }
          : user
      )
    );
  };

  const handleSave = async (user) => {
    try {
      setSavingUserId(user.id);

      const updatedUser = await updateUser(user.id, {
        name: user.name,
        email: user.email,
        role: user.role
      });

      setUsers((prev) =>
        prev.map((entry) =>
          entry.id === updatedUser.id
            ? updatedUser
            : entry
        )
      );
    } catch (err) {
      console.error("Failed to update user:", err);
      alert(err.response?.data?.message || "Failed to update user");
    } finally {
      setSavingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Manage Users" />
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
      <PageHeader title="Manage Users" />

      {error && <p className="form-error">{error}</p>}

      {users.length === 0 && (
        <div className="card-muted">
          No users found.
        </div>
      )}

      <div className="grid">
        {users.map((user) => (
          <div key={user.id} className="card">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                className="form-input"
                value={user.name || ""}
                onChange={(e) => handleFieldChange(user.id, "name", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                value={user.email || ""}
                onChange={(e) => handleFieldChange(user.id, "email", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={user.role}
                onChange={(e) => handleFieldChange(user.id, "role", e.target.value)}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              className="btn btn-primary"
              type="button"
              disabled={savingUserId === user.id}
              onClick={() => handleSave(user)}
            >
              {savingUserId === user.id ? "Saving..." : "Save"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

}

export default AdminUsers;
