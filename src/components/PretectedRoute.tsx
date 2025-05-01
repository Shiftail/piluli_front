import { Navigate } from "react-router-dom";
import { AuthStore } from "../stores/AuthStore";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const authStore = AuthStore.use();

  if (!authStore.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
