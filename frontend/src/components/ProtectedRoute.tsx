import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-park-950 text-slate-400">
        Loading…
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
