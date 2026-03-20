import { NavLink } from 'react-router-dom';
import { roleMenus } from './sidebar.config';

function Sidebar({ sidebarOpen }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const role = user?.role || 'student';
  const menus = roleMenus[role] || [];
  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-section">
        <p className="sidebar-eyebrow">Workspace</p>
        <h3>{role.charAt(0).toUpperCase() + role.slice(1)} Center</h3>
      </div>
      <nav className="sidebar-nav">
        {menus.map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
