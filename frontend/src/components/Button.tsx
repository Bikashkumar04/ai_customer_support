import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
};

const baseClasses =
  "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary: "bg-cyan-600 text-white hover:bg-cyan-700",
  secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
};

export function Button({ children, className = "", variant = "primary", isLoading = false, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Please wait..." : children}
    </button>
  );
}
