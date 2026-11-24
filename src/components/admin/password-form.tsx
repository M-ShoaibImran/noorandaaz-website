"use client";

import { useState } from "react";

export function PasswordForm() {
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setDone(false);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current: String(form.get("current") || ""),
        next: String(form.get("next") || ""),
        confirm: String(form.get("confirm") || ""),
      }),
    });
    const data = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Could not change the password.");
      return;
    }
    event.currentTarget.reset();
    setDone(true);
  }

  const field = "mt-1 h-12 w-full border border-neutral-300 bg-white px-3 text-base";

  return (
    <form onSubmit={onSubmit} className="max-w-md">
      <h1 className="font-serif text-4xl">Change password</h1>
      <span className="mt-3 block h-px w-8" style={{ backgroundColor: "#B8893B" }} />
      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-neutral-700">
        <li>At least 10 characters.</li>
        <li>At least one letter.</li>
        <li>At least one number.</li>
      </ul>
      <p className="mt-3 text-sm text-neutral-600">You will stay signed in on this browser. Other browsers will need to sign in again.</p>
      {error ? <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
      {done ? <p className="mt-4 border border-neutral-200 bg-white px-3 py-2 text-sm">Password changed. Other browsers will need to sign in again.</p> : null}
      <label className="mt-4 block text-sm">
        Current password
        <input name="current" type="password" required autoComplete="current-password" className={field} />
      </label>
      <label className="mt-3 block text-sm">
        New password
        <input name="next" type="password" required autoComplete="new-password" className={field} />
      </label>
      <label className="mt-3 block text-sm">
        Confirm new password
        <input name="confirm" type="password" required autoComplete="new-password" className={field} />
      </label>
      <button disabled={pending} className="mt-4 h-12 bg-neutral-950 px-5 text-sm text-white disabled:opacity-50">
        {pending ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
