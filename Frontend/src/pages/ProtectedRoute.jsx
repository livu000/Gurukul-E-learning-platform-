import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ roles = [] }) {

  const accessToken = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user"));

  // ===============================
  // NOT LOGGED IN
  // ===============================
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // ===============================
  // ROLE CHECK
  // ===============================
  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // ===============================
  // ALLOW ROUTE
  // ===============================
  return <Outlet />;
}

export default ProtectedRoute;