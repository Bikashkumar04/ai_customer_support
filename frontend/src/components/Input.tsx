import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <label className="block w-full text-sm font-medium text-slate-700">
      {label ? <span className="mb-1.5 block">{label}</span> : null}
      <input
        className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${
          error ? "border-rose-300" : ""
        } ${className}`}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}
