"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import AuthShell from "@/components/shells/auth-shell";
import { Badge, Button, Checkbox, Input, Panel } from "@/components/ui";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_POLICY_TEXT,
  validatePasswordPolicy
} from "@/lib/password-policy";

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
  const [nextPath, setNextPath] = useState("/agendar");
  const [serviceName, setServiceName] = useState("");
  const [barberName, setBarberName] = useState("");

  const loginPath = useMemo(() => {
    const params = new URLSearchParams();
    params.set("next", nextPath);
    return `/entrar?${params.toString()}`;
  }, [nextPath]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextPath(params.get("next") || "/agendar");
    setServiceName(params.get("serviceName") || "");
    setBarberName(params.get("barberName") || "");
  }, []);

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
    const passwordPolicy = validatePasswordPolicy(password);
    if (!passwordPolicy.valid) {
      setError(passwordPolicy.message);
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

      setMessage(data.message || "Conta criada. Verifique seu email para ativar o acesso.");
      setTimeout(() => {
        const params = new URLSearchParams();
        params.set("email", email);
        params.set("next", nextPath);
        if (serviceName) {
          params.set("serviceName", serviceName);
        }
        if (barberName) {
          params.set("barberName", barberName);
        }
        router.push(`/verificar-email?${params.toString()}`);
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
          <Link href={loginPath} className="font-semibold text-primary hover:underline">
            Entrar
          </Link>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {serviceName || barberName ? (
          <Panel className="bg-primary/10 p-3">
            <p className="atelier-label">Pre-reserva selecionada</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {serviceName ? <Badge tone="primary">Servico: {serviceName}</Badge> : null}
              {barberName ? <Badge tone="primary">Barbeiro: {barberName}</Badge> : null}
            </div>
          </Panel>
        ) : null}

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
              minLength={PASSWORD_MIN_LENGTH}
              required
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="atelier-label">Confirmar senha</span>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={PASSWORD_MIN_LENGTH}
              required
            />
          </label>
        </div>
        <p className="text-xs text-foreground-muted">{PASSWORD_POLICY_TEXT}</p>

        <Checkbox
          checked={acceptTerms}
          onChange={(event) => setAcceptTerms(event.target.checked)}
          label={
            <>
              Li e aceito os{" "}
              <Link href="/termos-de-uso" className="font-semibold text-primary hover:underline">
                termos de uso
              </Link>{" "}
              e a{" "}
              <Link href="/politica-privacidade" className="font-semibold text-primary hover:underline">
                politica de privacidade
              </Link>
              .
            </>
          }
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
