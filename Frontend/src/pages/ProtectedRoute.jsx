import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ roles }) => {
  const token = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user"));

  // Not logged in
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Role-based restriction
  if (roles && (!user || !roles.includes(user.role))) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;