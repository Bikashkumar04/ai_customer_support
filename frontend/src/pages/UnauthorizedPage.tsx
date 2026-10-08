import { Link } from "react-router-dom";

export function UnauthorizedPage({ title = "Access denied" }: { title?: string }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <section className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">403</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          You do not have permission to view this area.
        </p>
        <Link className="mt-6 inline-flex rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-700" to="/dashboard">
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}
