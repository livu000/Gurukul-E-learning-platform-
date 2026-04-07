import { NavLink } from 'react-router-dom';
import { roleMenus } from './sidebar.config';
import { getSessionUser } from '../../utils/session';
import BrandLogo from './BrandLogo';

function Sidebar({ sidebarOpen }) {
  const user = getSessionUser();
  const role = user?.role || 'student';
  const menus = roleMenus[role] || [];
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <BrandLogo size="md" subtitle="Role-based learning workspace" tone="inverse" />
      </div>
      <div className="sidebar-section">
        <p className="sidebar-eyebrow">Workspace</p>
        <h3>{roleLabel} Center</h3>
        <p>{user?.name || user?.email || 'Gurukul User'}</p>
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
