import type { ReactNode } from "react";

import { Navbar } from "../components/Navbar";

export function AppLayout({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {title ? (
          <header className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          </header>
        ) : null}
        {children}
      </main>
    </div>
  );
}
