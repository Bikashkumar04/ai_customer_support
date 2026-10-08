import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../components/Button";
import { ErrorMessage } from "../components/ErrorMessage";
import { Input } from "../components/Input";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../services/api";
import { userService } from "../services/userService";

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setForm({ first_name: user.first_name, last_name: user.last_name, email: user.email });
    setLoading(false);
  }, [user]);

  if (loading) return <LoadingSpinner label="Loading profile..." />;

  const update = (field: keyof typeof form, value: string) => {
    setMessage(null);
    setError(null);
    setForm((current) => ({ ...current, [field]: value }));
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await userService.updateCurrentUser(form);
      await refreshUser();
      setMessage("Profile updated successfully.");
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, "Unable to update your profile."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <p className="text-sm font-medium text-cyan-700">Account settings</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-950">Your profile</h1>
        <p className="mt-2 text-sm text-slate-600">Keep your contact details up to date.</p>
      </div>
      <form onSubmit={save} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="First name" value={form.first_name} onChange={(event) => update("first_name", event.target.value)} required />
          <Input label="Last name" value={form.last_name} onChange={(event) => update("last_name", event.target.value)} required />
        </div>
        <Input label="Email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required />
        <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">Role: <strong>{user?.role}</strong></div>
        <ErrorMessage message={error} />
        {message ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" isLoading={saving}>Save changes</Button>
          <Button type="button" variant="secondary" onClick={() => void logout().then(() => navigate("/login", { replace: true }))}>Log out</Button>
        </div>
      </form>
    </div>
  );
}
