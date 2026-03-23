"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function CadastrarPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("As senhas nao conferem.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          password
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao cadastrar.");
      }

      setMessage("Conta criada com sucesso. Redirecionando para login...");
      setTimeout(() => {
        router.push(`/entrar?email=${encodeURIComponent(email)}`);
      }, 700);
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : "Falha ao cadastrar.";
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
          <h1 className="mt-6 text-3xl font-black tracking-tight">Criar Conta</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Cadastre-se para agendar e acompanhar seus horarios.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-primary/20 bg-white dark:bg-white/5 p-6 md:p-8 shadow-xl shadow-primary/5"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Nome
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 dark:border-primary/10 bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>

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
                Telefone (opcional)
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 dark:border-primary/10 bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="(11) 99999-9999"
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
                placeholder="Minimo 6 caracteres"
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
                placeholder="Digite novamente"
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
            {isSubmitting ? "Cadastrando..." : "Cadastrar"}
          </button>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-slate-500 dark:text-slate-400">Ja tem conta?</span>
            <Link href="/entrar" className="font-bold text-primary hover:underline">
              Entrar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
