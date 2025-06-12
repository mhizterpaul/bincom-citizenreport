import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import theme from "./theme";
import Auth from "./components/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import Complaints from "./components/Complaints";
import CreateComplaint from "./components/CreateComplaint";

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to={import.meta.env.VITE_ENVIRONMENT === "production" ? "auth" : "dashboard"} replace />
              )
            }
          />
          <Route
            path="/auth"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth />
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints"
            element={
              <ProtectedRoute>
                <Complaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints/create"
            element={
              <ProtectedRoute>
                <CreateComplaint />
              </ProtectedRoute>
            }
          />
          {/* 404 route - must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
