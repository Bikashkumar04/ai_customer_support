import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../components/Button";
import { ErrorMessage } from "../components/ErrorMessage";
import { Input } from "../components/Input";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../services/api";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleChange = (field: "email" | "password", value: string) => {
    setError(null);
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(form);
      navigate("/dashboard", { replace: true });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "Unable to sign in. Please check your credentials."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600 text-lg font-bold text-white">
            AI
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to continue to your support workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(event) => handleChange("password", event.target.value)}
            placeholder="••••••••"
          />

          <ErrorMessage message={error} />

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Sign in
          </Button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-600">
          Need an account?{" "}
          <Link to="/register" className="font-medium text-cyan-700 hover:text-cyan-800">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
