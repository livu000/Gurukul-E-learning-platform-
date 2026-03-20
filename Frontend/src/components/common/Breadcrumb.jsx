import { useLocation } from 'react-router-dom';
import { roleMenus } from './sidebar.config';

function Breadcrumb() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const menus = roleMenus[user?.role] || [];
  const current = menus.find((item) => location.pathname.startsWith(item.path) && item.path !== '/dashboard') || menus.find((item) => item.path === '/dashboard');
  return (
    <div className="breadcrumb">
      <span>Gurukul</span>
      <span className="breadcrumb-separator">/</span>
      <span>{current?.label || 'Workspace'}</span>
    </div>
  );
}

export default Breadcrumb;
