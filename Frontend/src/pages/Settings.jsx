import { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import { clearNotifications } from '../utils/notifications';
import { applyTheme, getStoredTheme, toggleTheme } from '../utils/theme';

export default function Settings() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [theme, setTheme] = useState(getStoredTheme());

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

  return (
    <div className="page">
      <PageHeader title="Settings" />
      <div className="grid-2">
        <div className="card">
          <p className="stat-label">Account</p>
          <h3>{user?.name || 'User'}</h3>
          <p>{user?.email || 'No email available'}</p>
          <p>Role: <strong>{user?.role || 'student'}</strong></p>
          <p>Status: <strong>{user?.status || 'active'}</strong></p>
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

      <div className="card">
        <p className="stat-label">Notifications</p>
        <h3>Notification Center</h3>
        <p>Clear all in-app notifications when you want a fresh workspace.</p>
        <button className="btn btn-secondary" type="button" onClick={clearNotifications}>Clear Notifications</button>
      </div>
    </div>
  );
}
