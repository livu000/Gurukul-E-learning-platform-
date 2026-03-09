import { NavLink } from "react-router-dom";
import { roleMenus } from "./sidebar.config";

function Sidebar({ sidebarOpen }) {

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const role = user?.role || "student";

  const menus = roleMenus[role] || [];

  return (
    <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>

      {menus.map((item) => (

        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          {item.label}
        </NavLink>

      ))}

    </div>
  );
}

export default Sidebar;