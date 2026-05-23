import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, token } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-park-950 text-slate-400">
        Loading…
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;
  if (!user?.is_admin) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
