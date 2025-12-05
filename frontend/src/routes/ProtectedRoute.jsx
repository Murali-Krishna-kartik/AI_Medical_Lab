import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();

  const isAllowed = allowedRoles.includes(role);
  const accessibleRoute =
    isAuthenticated && isAllowed ? children : <Navigate to="/login" replace={true} />;

  return accessibleRoute;
};

export default ProtectedRoute;
