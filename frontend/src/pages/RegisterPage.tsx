import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../components/Button";
import { ErrorMessage } from "../components/ErrorMessage";
import { Input } from "../components/Input";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../services/api";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setError(null);
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
      });
      navigate("/dashboard", { replace: true });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "Unable to create an account."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600 text-lg font-bold text-white">
            AI
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>
          <p className="mt-2 text-sm text-slate-500">Start your support workspace in a few steps.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              type="text"
              autoComplete="given-name"
              value={form.first_name}
              onChange={(event) => handleChange("first_name", event.target.value)}
              placeholder="Jane"
            />
            <Input
              label="Last name"
              type="text"
              autoComplete="family-name"
              value={form.last_name}
              onChange={(event) => handleChange("last_name", event.target.value)}
              placeholder="Doe"
            />
          </div>

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
            autoComplete="new-password"
            value={form.password}
            onChange={(event) => handleChange("password", event.target.value)}
            placeholder="At least 8 characters"
          />

          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(event) => handleChange("confirmPassword", event.target.value)}
            placeholder="Repeat your password"
          />

          <ErrorMessage message={error} />

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Create account
          </Button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-cyan-700 hover:text-cyan-800">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
