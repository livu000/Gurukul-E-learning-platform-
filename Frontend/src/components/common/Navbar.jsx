import { useNavigate } from "react-router-dom";

function Navbar() {

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="navbar">

      <h3 style={{ cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
        Gurukul
      </h3>

      <div>
        {user && <span style={{ marginRight: 15 }}>{user.role}</span>}
        <button onClick={handleLogout}>Logout</button>
      </div>

    </div>
  );
}

export default Navbar;
