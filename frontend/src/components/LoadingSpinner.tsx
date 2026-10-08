export function LoadingSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-8 text-sm text-slate-600">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
      <span>{label}</span>
    </div>
  );
}
