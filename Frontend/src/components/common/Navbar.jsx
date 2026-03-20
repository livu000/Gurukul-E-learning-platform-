import { useNavigate } from 'react-router-dom';

function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };
  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="hamburger" onClick={onToggleSidebar} type="button">☰</button>
        <button className="brand-button" type="button" onClick={() => navigate('/dashboard')}>
          <span className="brand-mark">G</span>
          <span>
            <strong>Gurukul</strong>
            <small>{user?.role ? `${user.role} portal` : 'learning platform'}</small>
          </span>
        </button>
      </div>
      <div className="navbar-right">
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
