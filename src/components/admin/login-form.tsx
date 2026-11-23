"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({ showHint }: { showHint: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const password = String(new FormData(event.currentTarget).get("password") || "");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Could not sign in.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-16 max-w-sm border border-neutral-200 bg-white p-6">
      <p className="font-serif text-3xl">Noorandaaz</p>
      <p className="mt-1 text-sm text-neutral-500">Owner sign in</p>
      {showHint ? <p className="mt-4 text-sm text-neutral-600">Sample password: noorandaaz-admin. Change ADMIN_PASSWORD before real orders.</p> : null}
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      <input name="password" type="password" required placeholder="Password" className="mt-4 h-12 w-full border border-neutral-300 px-3 text-base" />
      <button disabled={pending} className="mt-3 h-12 w-full bg-neutral-950 text-sm text-white">{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
