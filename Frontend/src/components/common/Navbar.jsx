import { useNavigate } from "react-router-dom";

function Navbar({ onToggleSidebar }) {

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="navbar">

      {/* LEFT SECTION */}
      <div style={{ display: "flex", alignItems: "center", gap: 15 }}>

        {/* Hamburger (Mobile Only) */}
        <button
          className="hamburger"
          onClick={onToggleSidebar}
        >
          ☰
        </button>

        {/* Logo */}
        <h3
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/dashboard")}
        >
          Gurukul
        </h3>

      </div>

      {/* RIGHT SECTION */}
      <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
        {user && <span>{user.role}</span>}
        <button onClick={handleLogout}>Logout</button>
      </div>

    </div>
  );
}

export default Navbar;
