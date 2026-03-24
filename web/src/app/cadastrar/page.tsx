"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import AuthShell from "@/components/shells/auth-shell";
import { Button, Checkbox, Input } from "@/components/ui";

export default function CadastrarPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!acceptTerms) {
      setError("Aceite os termos para continuar.");
      return;
    }

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

      setMessage("Conta criada com sucesso. Redirecionando...");
      setTimeout(() => {
        router.push(`/entrar?email=${encodeURIComponent(email)}`);
      }, 800);
    } catch (submitError) {
      const messageText = submitError instanceof Error ? submitError.message : "Falha ao cadastrar.";
      setError(messageText);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Criar conta"
      description="Configure seu acesso para agendar e acompanhar atendimentos em tempo real."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>Ja possui conta?</span>
          <Link href="/entrar" className="font-semibold text-primary hover:underline">
            Entrar
          </Link>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-1 text-sm">
          <span className="atelier-label">Nome completo</span>
          <Input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Seu nome"
            required
          />
        </label>

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
          <span className="atelier-label">Telefone (opcional)</span>
          <Input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="(11) 99999-9999"
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="atelier-label">Senha</span>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="atelier-label">Confirmar senha</span>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={6}
              required
            />
          </label>
        </div>

        <Checkbox
          checked={acceptTerms}
          onChange={(event) => setAcceptTerms(event.target.checked)}
          label="Li e aceito os termos de uso e politica de privacidade."
        />

        {message ? <p className="text-sm text-success">{message}</p> : null}
        {error ? <p className="text-sm text-error">{error}</p> : null}

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Cadastrando..." : "Finalizar cadastro"}
        </Button>
      </form>
    </AuthShell>
  );
}
