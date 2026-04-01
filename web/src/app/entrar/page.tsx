"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import AuthShell from "@/components/shells/auth-shell";
import { Button, Checkbox, Input } from "@/components/ui";

export default function EntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const emailFromQuery = new URLSearchParams(window.location.search).get("email");
    if (emailFromQuery) {
      setEmail(emailFromQuery);
      setMessage("Cadastro concluido. Informe sua senha para entrar.");
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
      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json().catch(() => null)
        : null;
      if (!response.ok) {
        const apiMessage =
          data && typeof data === "object" && "error" in data ? String(data.error) : null;
        throw new Error(apiMessage || "Falha ao entrar. Tente novamente.");
      }

      try {
        localStorage.setItem("barbersaas_user", JSON.stringify(data?.user ?? null));
        localStorage.setItem("barbersaas_remember", rememberMe ? "1" : "0");
      } catch {
        // Ignora erro de armazenamento local para nao bloquear login.
      }

      const nextPath = new URLSearchParams(window.location.search).get("next");
      if (nextPath && nextPath.startsWith("/")) {
        router.push(nextPath);
      } else {
        router.push((data && data.redirectTo) || "/agendar");
      }
    } catch (submitError) {
      const messageText = submitError instanceof Error ? submitError.message : "Falha ao entrar.";
      setError(messageText);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Entrar"
      description="Acesse sua conta para seguir com agendamentos, painel e administracao."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>Nao possui conta?</span>
          <Link href="/cadastrar" className="font-semibold text-primary hover:underline">
            Criar conta
          </Link>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-1 text-sm">
          <span className="atelier-label">E-mail</span>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@exemplo.com"
            required
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="atelier-label">Senha</span>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Sua senha"
            required
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Checkbox checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} label="Lembrar de mim" />
          <Link href="/esqueci-senha" className="text-xs font-semibold text-primary hover:underline">
            Esqueci minha senha
          </Link>
        </div>

        {message ? <p className="text-sm text-success">{message}</p> : null}
        {error ? <p className="text-sm text-error">{error}</p> : null}

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar agora"}
        </Button>
      </form>
    </AuthShell>
  );
}
