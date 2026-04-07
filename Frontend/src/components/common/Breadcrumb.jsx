import { useLocation } from 'react-router-dom';
import { roleMenus } from './sidebar.config';
import BrandLogo from './BrandLogo';

function Breadcrumb() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const menus = roleMenus[user?.role] || [];
  const current = menus.find((item) => location.pathname.startsWith(item.path) && item.path !== '/dashboard') || menus.find((item) => item.path === '/dashboard');
  return (
    <div className="breadcrumb">
      <span className="breadcrumb-brand">
        <BrandLogo size="xs" showText={false} />
        <span>Gurukul</span>
      </span>
      <span className="breadcrumb-separator">/</span>
      <span>{current?.label || 'Workspace'}</span>
    </div>
  );
}

export default Breadcrumb;
