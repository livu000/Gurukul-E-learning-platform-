import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function MainLayout({ children }) {

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
          {children}
        </div>

      </div>

    </div>
  );
}

export default MainLayout;
