import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../lib/authContext";

export const ProtectedRoute = ({
  requireAdmin = false,
}: {
  requireAdmin?: boolean;
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const location = useLocation();

  if (user.must_change_password) {
    // Only allow them to be on the reset-password page
    if (location.pathname !== "/reset-password") {
      return <Navigate to="/reset-password" replace />;
    }
  }

  if (requireAdmin && !user.is_admin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
