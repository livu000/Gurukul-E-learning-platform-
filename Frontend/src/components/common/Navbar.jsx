import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/auth.service';
import { clearNotifications, getNotifications, subscribeNotifications } from '../../utils/notifications';
import { applyTheme, getStoredTheme, toggleTheme } from '../../utils/theme';
import { getSessionUser } from '../../utils/session';
import BrandLogo from './BrandLogo';

function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const user = getSessionUser();
  const [theme, setTheme] = useState(getStoredTheme());
  const [notifications, setNotifications] = useState(getNotifications());
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => subscribeNotifications(setNotifications), []);

  const suggestedNotifications = useMemo(() => {
    if (notifications.length) return notifications;

    if (user?.role === 'admin') {
      return [{ id: 'seed-admin', title: 'Admin Focus', message: 'Review pending courses and export analytics regularly.', createdAt: new Date().toISOString() }];
    }

    if (user?.role === 'teacher') {
      return [{ id: 'seed-teacher', title: 'Teacher Focus', message: 'Keep quizzes, assignments, and curriculum ready before review.', createdAt: new Date().toISOString() }];
    }

    return [{ id: 'seed-student', title: 'Learning Focus', message: 'Resume your latest lesson and keep assignment deadlines in check.', createdAt: new Date().toISOString() }];
  }, [notifications, user?.role]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="hamburger" onClick={onToggleSidebar} type="button">☰</button>
        <button className="brand-button" type="button" onClick={() => navigate('/dashboard')}>
          <BrandLogo size="md" subtitle={user?.role ? `${user.role} portal` : 'learning platform'} />
        </button>
      </div>

      <div className="navbar-right navbar-tools">
        <button className="btn btn-secondary" type="button" onClick={() => setTheme(toggleTheme())}>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>

        <div className="notification-shell">
          <button className="btn btn-secondary" type="button" onClick={() => setPanelOpen((value) => !value)}>
            Notifications {suggestedNotifications.length ? `(${suggestedNotifications.length})` : ''}
          </button>
          {panelOpen && (
            <div className="notification-panel card">
              <div className="section-head">
                <h3>Updates</h3>
                <button className="btn btn-outline" type="button" onClick={() => clearNotifications()}>Clear</button>
              </div>
              <div className="notification-list">
                {suggestedNotifications.map((item) => (
                  <div key={item.id} className="notification-item">
                    <strong>{item.title}</strong>
                    <p>{item.message}</p>
                    <small>{new Date(item.createdAt).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="user-chip">
          <span className="user-chip-label">Signed in as</span>
          <strong>{user?.name || user?.email || 'User'}</strong>
        </div>
        <button className="btn btn-secondary" onClick={handleLogout} type="button">Logout</button>
      </div>
    </header>
  );
}

export default Navbar;
