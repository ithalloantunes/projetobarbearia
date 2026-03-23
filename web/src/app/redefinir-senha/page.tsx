"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

export default function RedefinirSenhaPage() {
  const [token, setToken] = useState("");

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("token") || "";
    setToken(value);
  }, []);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!token) {
      setError("Token de recuperacao invalido.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas nao conferem.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Falha ao redefinir senha.");
      }
      setMessage("Senha redefinida com sucesso. Voce ja pode entrar.");
      setPassword("");
      setConfirmPassword("");
    } catch (submitError) {
      const messageText = submitError instanceof Error ? submitError.message : "Falha ao redefinir senha.";
      setError(messageText);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">content_cut</span>
            <span className="text-xl font-bold tracking-tight">BarberSaaS</span>
          </Link>
          <h1 className="mt-6 text-3xl font-black tracking-tight">Redefinir senha</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Defina uma nova senha para continuar.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-primary/20 bg-white dark:bg-white/5 p-6 md:p-8 shadow-xl shadow-primary/5"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Nova senha
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 dark:border-primary/10 bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Confirmar senha
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 dark:border-primary/10 bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={6}
                required
              />
            </div>
          </div>

          {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
          {message ? <p className="mt-4 text-sm text-emerald-500">{message}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-background-dark hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>

          <div className="mt-6 text-sm">
            <Link href="/entrar" className="font-bold text-primary hover:underline">
              Ir para login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
