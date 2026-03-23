"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function EntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const emailFromQuery = new URLSearchParams(window.location.search).get("email");
    if (emailFromQuery) {
      setEmail(emailFromQuery);
      setMessage("Cadastro realizado com sucesso. Entre com sua senha.");
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Falha ao entrar.");
      }

      try {
        localStorage.setItem("barbersaas_user", JSON.stringify(data.user));
      } catch {
        // Ignora erro de armazenamento local para nao bloquear o login.
      }

      const nextPath = new URLSearchParams(window.location.search).get("next");
      if (nextPath && nextPath.startsWith("/")) {
        router.push(nextPath);
      } else {
        router.push(data.redirectTo || "/agendar");
      }
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : "Falha ao entrar.";
      setError(errMessage);
    } finally {
      setIsSubmitting(false);
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
          <h1 className="mt-6 text-3xl font-black tracking-tight">Entrar</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Acesse sua conta para continuar.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-primary/20 bg-white dark:bg-white/5 p-6 md:p-8 shadow-xl shadow-primary/5"
        >
          <div className="space-y-4">
            <div>
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
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Senha
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 dark:border-primary/10 bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Sua senha"
                required
              />
            </div>
          </div>

          {message ? <p className="mt-4 text-sm text-emerald-500">{message}</p> : null}
          {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-background-dark hover:brightness-110 disabled:opacity-60"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-slate-500 dark:text-slate-400">Nao tem conta?</span>
            <Link href="/cadastrar" className="font-bold text-primary hover:underline">
              Cadastrar
            </Link>
          </div>
          <div className="mt-3 text-sm">
            <Link href="/esqueci-senha" className="text-slate-500 hover:text-primary hover:underline">
              Esqueci minha senha
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
