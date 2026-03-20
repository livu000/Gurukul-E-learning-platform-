import { useEffect, useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import { clearNotifications } from '../utils/notifications';
import { applyTheme, getStoredTheme, toggleTheme } from '../utils/theme';
import { getSessions, logoutAll } from '../services/auth.service';
import { getProfile, updateProfile } from '../services/user.service';
import { updateSessionUser } from '../utils/session';

export default function Settings() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [theme, setTheme] = useState(getStoredTheme());
  const [profile, setProfile] = useState(user || null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getProfile(), getSessions()])
      .then(([profileData, sessionData]) => {
        setProfile(profileData);
        setSessions(sessionData || []);
        updateSessionUser(profileData);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load settings');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleTheme = () => {
    const nextTheme = toggleTheme();
    setTheme(nextTheme);
  };

  const handleLight = () => {
    setTheme(applyTheme('light'));
  };

  const handleDark = () => {
    setTheme(applyTheme('dark'));
  };

  const handleProfileSave = async () => {
    try {
      setSaving(true);
      const updated = await updateProfile({
        name: profile?.name,
        bio: profile?.bio,
        phone: profile?.phone,
        profileImage: profile?.profileImage
      });
      setProfile(updated);
      updateSessionUser(updated);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutAll = async () => {
    await logoutAll();
    window.location.href = '/login';
  };

  return (
    <div className="page">
      <PageHeader title="Settings" />
      {error && <p className="form-error">{error}</p>}
      <div className="grid-2">
        <div className="card">
          <p className="stat-label">Account</p>
          {loading ? <p>Loading profile...</p> : (
            <>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={profile?.name || ''} onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={profile?.phone || ''} onChange={(event) => setProfile((prev) => ({ ...prev, phone: event.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Profile Image URL</label>
                <input className="form-input" value={profile?.profileImage || ''} onChange={(event) => setProfile((prev) => ({ ...prev, profileImage: event.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-textarea" rows={4} value={profile?.bio || ''} onChange={(event) => setProfile((prev) => ({ ...prev, bio: event.target.value }))} />
              </div>
              <p>{profile?.email || 'No email available'}</p>
              <p>Role: <strong>{profile?.role || 'student'}</strong></p>
              <p>Status: <strong>{profile?.status || 'active'}</strong></p>
              <div className="card-actions">
                <button className="btn btn-primary" type="button" onClick={handleProfileSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="card">
          <p className="stat-label">Appearance</p>
          <h3>{theme === 'dark' ? 'Dark Theme' : 'Light Theme'}</h3>
          <div className="card-actions">
            <button className="btn btn-secondary" type="button" onClick={handleLight}>Light</button>
            <button className="btn btn-secondary" type="button" onClick={handleDark}>Dark</button>
            <button className="btn btn-primary" type="button" onClick={handleTheme}>Toggle Theme</button>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <p className="stat-label">Sessions</p>
          <h3>Active Sign-ins</h3>
          {loading ? <p>Loading sessions...</p> : sessions.length ? sessions.map((session) => (
            <div key={session.id} className="list-row">
              <div>
                <strong>{session.deviceInfo || 'Unknown device'}</strong>
                <p>{session.ipAddress || 'Unknown IP'} • {session.revokedAt ? 'Revoked' : 'Active'}</p>
              </div>
              <span className={`badge ${session.revokedAt ? 'badge-warning' : 'badge-success'}`}>
                {session.revokedAt ? 'Revoked' : 'Active'}
              </span>
            </div>
          )) : <p>No sessions found.</p>}
          <div className="card-actions">
            <button className="btn btn-danger" type="button" onClick={handleLogoutAll}>Logout All Devices</button>
          </div>
        </div>

        <div className="card">
          <p className="stat-label">Notifications</p>
          <h3>Notification Center</h3>
          <p>Clear all in-app notifications when you want a fresh workspace.</p>
          <button className="btn btn-secondary" type="button" onClick={clearNotifications}>Clear Notifications</button>
        </div>
      </div>

      <div className="card">
        <p className="stat-label">Notifications</p>
        <h3>Workspace Notes</h3>
        <p>Profile, theme, sessions, and notifications are now aligned with the updated backend auth and role system.</p>
      </div>
    </div>
  );
}
