import { Navigate, Outlet } from "react-router-dom";
import { getAccessToken, getSessionUser } from "../utils/session";

function ProtectedRoute({ roles = [] }) {

  const accessToken = getAccessToken();
  const user = getSessionUser();

  // ===============================
  // NOT LOGGED IN
  // ===============================
  if (!accessToken || !user) {
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
