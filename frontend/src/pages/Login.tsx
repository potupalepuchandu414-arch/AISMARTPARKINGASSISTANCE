import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async () => {
    if (!username.trim() || !password) return;
    try {
      const { data } = await api.post<{ access_token: string }>("/auth/login/json", {
        username: username.trim(),
        password,
      });
      await login(data.access_token);
      navigate("/dashboard");
    } catch {
      alert("Invalid username or password.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-park-950 px-4 py-10">
      <Link to="/" className="mb-8 text-sm text-slate-500 hover:text-teal-400">
        ← Back to home
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl backdrop-blur">
        <h1 className="text-center font-display text-2xl font-semibold text-white">Log in</h1>
        <p className="mt-1 text-center text-sm text-slate-500">Campus smart parking</p>

        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/50 px-3">
            <User className="h-4 w-4 text-slate-500" />
            <input
              className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-600"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/50 px-3">
            <Lock className="h-4 w-4 text-slate-500" />
            <input
              type="password"
              className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-600"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button
            type="button"
            onClick={submit}
            className="w-full rounded-xl bg-teal-500 py-3 text-sm font-semibold text-park-950 transition hover:bg-teal-400"
          >
            Log in
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          No account?{" "}
          <Link to="/signup" className="text-teal-400 hover:underline">
            Sign up
          </Link>
        </p>
        <p className="mt-4 text-center text-xs text-slate-600">
          Demo admin: <span className="text-slate-500">admin</span> / <span className="text-slate-500">admin123</span>
        </p>
      </div>
    </div>
  );
}
