import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Frontend-only demo guard (NOT secure authorization — purely UX).
export default function DemoGuard({ children }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
