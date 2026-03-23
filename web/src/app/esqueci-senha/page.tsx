"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Falha ao enviar link.");
      }
      setMessage(data.message || "Se o email existir, enviaremos um link.");
    } catch (submitError) {
      const messageText = submitError instanceof Error ? submitError.message : "Falha ao enviar link.";
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
          <h1 className="mt-6 text-3xl font-black tracking-tight">Esqueci minha senha</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Informe seu e-mail para receber o link de redefinicao.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-primary/20 bg-white dark:bg-white/5 p-6 md:p-8 shadow-xl shadow-primary/5"
        >
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
            E-mail
          </label>
          <input
            className="w-full rounded-xl border border-slate-200 dark:border-primary/10 bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@exemplo.com"
            required
          />

          {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
          {message ? <p className="mt-4 text-sm text-emerald-500">{message}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-background-dark hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Enviar link"}
          </button>

          <div className="mt-6 text-sm">
            <Link href="/entrar" className="font-bold text-primary hover:underline">
              Voltar para login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
