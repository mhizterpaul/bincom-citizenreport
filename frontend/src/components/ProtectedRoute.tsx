import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { isTokenExpired } from "../utils/auth";
import { store } from "../store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const token = store.getState().auth.token;

  if (!isAuthenticated || (token && isTokenExpired(token))) {
    if (import.meta.env.VITE_ENVIRONMENT !== "production") {
      return <>{children}</>;
    }
    // Clear token and redirect to login if token is expired
    if (token) {
      store.dispatch({ type: "auth/logout" });
    }
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
