import { useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Breadcrumb from "./Breadcrumb";

function MainLayout() {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout-wrapper">

      {/* Navbar */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="layout-body">

        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} />

        {/* Content */}
        <div className="layout-content">

          <Breadcrumb />

          {/* Router renders pages here */}
          <Outlet />

        </div>

      </div>

    </div>
  );
}

export default MainLayout;