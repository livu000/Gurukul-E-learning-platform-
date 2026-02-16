import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function MainLayout({ children }) {

  return (
    <div className="app-layout">

      <Navbar />

      <div className="layout-body">

        <Sidebar />

        <div className="content-area">
          {children}
        </div>

      </div>

    </div>
  );
}

export default MainLayout;
