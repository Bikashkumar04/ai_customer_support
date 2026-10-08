import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import type { User } from "../types/auth";

function getDisplayName(user: User | null) {
  if (!user) return "User";
  return `${user.first_name} ${user.last_name}`.trim() || user.email;
}

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-600 text-sm font-bold text-white">
            AI
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">Support Agent</p>
            <Link to="/dashboard" className="text-lg font-semibold text-slate-900">
              Customer Console
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/profile" className="text-sm font-medium text-slate-700 hover:text-cyan-700">
            {getDisplayName(user)}
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
