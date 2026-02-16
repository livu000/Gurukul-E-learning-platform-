import { useLocation } from "react-router-dom";
import { roleMenus } from "./sidebar.config";

function Breadcrumb() {

  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const menus = roleMenus[user?.role] || [];

  // find matching menu
  const current = menus.find(m =>
    location.pathname.startsWith(m.path)
  );

  return (
    <div className="breadcrumb">

      <span>Gurukul</span>

      {current && (
        <>
          <span className="breadcrumb-separator">/</span>
          <span>{current.label}</span>
        </>
      )}

    </div>
  );
}

export default Breadcrumb;
