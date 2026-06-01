"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import AuthShell from "@/components/shells/auth-shell";
import { Button, Input } from "@/components/ui";

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
    <AuthShell
      title="Recuperar senha"
      description="Informe seu e-mail para receber um link seguro de redefinicao."
      footer={
        <Link href="/entrar" className="font-semibold text-primary hover:underline">
          Voltar para login
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-1 text-sm">
          <span className="atelier-label">E-mail cadastrado</span>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@exemplo.com"
            required
          />
        </label>

        {error ? <p className="text-sm text-error">{error}</p> : null}
        {message ? <p className="text-sm text-success">{message}</p> : null}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Enviando..." : "Enviar link de recuperacao"}
        </Button>
      </form>
    </AuthShell>
  );
}
