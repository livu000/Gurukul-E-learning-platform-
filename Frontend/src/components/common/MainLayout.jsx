import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Breadcrumb from './Breadcrumb';

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="layout-wrapper">
      <Navbar onToggleSidebar={() => setSidebarOpen((value) => !value)} />
      <div className="layout-body">
        <Sidebar sidebarOpen={sidebarOpen} />
        <main className="layout-content" onClick={() => sidebarOpen && setSidebarOpen(false)}>
          <Breadcrumb />
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
