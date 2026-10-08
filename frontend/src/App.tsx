import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

import { api } from "./api/client";

type ServiceStatus = "checking" | "ok" | "error";

type HealthState = {
  api: ServiceStatus;
  database: ServiceStatus;
  qdrant: ServiceStatus;
};

const checks: Array<{
  key: keyof HealthState;
  label: string;
  path: string;
}> = [
  { key: "api", label: "FastAPI", path: "/api/v1/health" },
  { key: "database", label: "PostgreSQL", path: "/api/v1/health/db" },
  { key: "qdrant", label: "Qdrant", path: "/api/v1/health/qdrant" },
];

function statusClass(status: ServiceStatus) {
  if (status === "ok") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "error") return "border-rose-200 bg-rose-50 text-rose-800";
  return "border-slate-200 bg-white text-slate-700";
}

function Dashboard() {
  const [health, setHealth] = useState<HealthState>({
    api: "checking",
    database: "checking",
    qdrant: "checking",
  });

  useEffect(() => {
    let ignore = false;

    async function loadHealth() {
      const results = await Promise.all(
        checks.map(async (check) => {
          try {
            const response = await api.get(check.path);
            return [check.key, response.data.status === "ok" ? "ok" : "error"] as const;
          } catch {
            return [check.key, "error"] as const;
          }
        }),
      );

      if (!ignore) {
        setHealth(Object.fromEntries(results) as HealthState);
      }
    }

    loadHealth();
    const intervalId = window.setInterval(loadHealth, 15000);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8">
          <p className="text-sm font-medium uppercase tracking-wide text-cyan-700">
            Phase 1 foundation
          </p>
          <h1 className="text-3xl font-semibold">AI Customer Support Agent</h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            Backend, frontend, PostgreSQL, Qdrant, Alembic, and environment configuration are wired for the next phases.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 py-8 md:grid-cols-3">
        {checks.map((check) => (
          <article
            key={check.key}
            className={`rounded-lg border p-5 shadow-sm ${statusClass(health[check.key])}`}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">{check.label}</h2>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase">
                {health[check.key]}
              </span>
            </div>
            <p className="mt-4 text-sm opacity-80">{check.path}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
}
