import { useEffect, useState } from 'react';
import { deleteUser, getUsers, updateUser } from '../services/user.service';
import PageHeader from '../components/common/PageHeader';
import SkeletonCard from '../components/common/SkeletonCard';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingUserId, setSavingUserId] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setUsers(await getUsers());
    } catch (err) {
      console.error(err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleFieldChange = (userId, field, value) => setUsers((prev) => prev.map((user) => user.id === userId ? { ...user, [field]: value } : user));

  const handleSave = async (user) => {
    try {
      setSavingUserId(user.id);
      const updated = await updateUser(user.id, { name: user.name, email: user.email, role: user.role, status: user.status, phone: user.phone });
      setUsers((prev) => prev.map((entry) => entry.id === updated.id ? { ...entry, ...updated } : entry));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSavingUserId(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user from the active system?')) return;
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) return <div className="page"><PageHeader title="Manage Users" /><div className="grid"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div></div>;

  return (
    <div className="page">
      <PageHeader title="Manage Users" action={<button className="btn btn-secondary" onClick={loadUsers}>Refresh</button>} />
      {error && <p className="form-error">{error}</p>}
      <div className="grid">
        {users.map((user) => <div key={user.id} className="card"><div className="form-group"><label className="form-label">Name</label><input className="form-input" value={user.name || ''} onChange={(e) => handleFieldChange(user.id, 'name', e.target.value)} /></div><div className="form-group"><label className="form-label">Email</label><input className="form-input" value={user.email || ''} onChange={(e) => handleFieldChange(user.id, 'email', e.target.value)} /></div><div className="form-grid"><div className="form-group"><label className="form-label">Role</label><select className="form-select" value={user.role} onChange={(e) => handleFieldChange(user.id, 'role', e.target.value)}><option value="student">Student</option><option value="teacher">Teacher</option><option value="admin">Admin</option></select></div><div className="form-group"><label className="form-label">Status</label><select className="form-select" value={user.status || 'active'} onChange={(e) => handleFieldChange(user.id, 'status', e.target.value)}><option value="active">Active</option><option value="blocked">Blocked</option><option value="inactive">Inactive</option></select></div></div><p className="stat-label">Last login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</p><div className="card-actions"><button className="btn btn-primary" onClick={() => handleSave(user)} disabled={savingUserId === user.id}>{savingUserId === user.id ? 'Saving...' : 'Save'}</button><button className="btn btn-danger" onClick={() => handleDelete(user.id)}>Delete</button></div></div>)}
        {!users.length && <div className="card-muted">No users found.</div>}
      </div>
    </div>
  );
}

export default AdminUsers;
