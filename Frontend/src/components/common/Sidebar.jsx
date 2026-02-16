import { Link } from "react-router-dom";
import { roleMenus } from "./sidebar.config";

function Sidebar() {

  const user = JSON.parse(localStorage.getItem("user"));

  // Safety check
  if (!user) return null;

  // Get menus based on role
  const menus = roleMenus[user.role] || [];

  return (
    <div className="sidebar">

      {menus.map((item, index) => (
        <Link key={index} to={item.path}>
          {item.label}
        </Link>
      ))}

    </div>
  );
}

export default Sidebar;

