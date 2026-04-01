"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import AuthShell from "@/components/shells/auth-shell";
import { Badge, Button, Input, Panel } from "@/components/ui";

export default function VerificarEmailPage() {
  const hasTriggeredVerification = useRef(false);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
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
    const tokenFromQuery = params.get("token") || "";
    const emailFromQuery = params.get("email") || "";

    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }

    setNextPath(params.get("next") || "/agendar");
    setServiceName(params.get("serviceName") || "");
    setBarberName(params.get("barberName") || "");

    if (tokenFromQuery) {
      setToken(tokenFromQuery);
    }
  }, []);

  useEffect(() => {
    if (!token || hasTriggeredVerification.current) {
      return;
    }

    hasTriggeredVerification.current = true;
    void verifyEmail(token);
  }, [token]);

  async function verifyEmail(tokenValue: string) {
    setVerifying(true);
    setVerificationError(null);
    setVerificationMessage(null);
    setResendMessage(null);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenValue })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Falha ao verificar email.");
      }
      setVerificationMessage(data.message || "Email confirmado com sucesso.");
    } catch (verifyError) {
      const messageText = verifyError instanceof Error ? verifyError.message : "Falha ao verificar email.";
      setVerificationError(messageText);
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResending(true);
    setResendError(null);
    setResendMessage(null);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Falha ao reenviar email.");
      }
      setResendMessage(data.message || "Se a conta existir, enviaremos um novo link.");
    } catch (resendSubmitError) {
      const messageText = resendSubmitError instanceof Error ? resendSubmitError.message : "Falha ao reenviar email.";
      setResendError(messageText);
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthShell
      title="Verificar e-mail"
      description="Ative sua conta para liberar o login e agendamentos."
      footer={
        <Link href={loginPath} className="font-semibold text-primary hover:underline">
          Ir para login
        </Link>
      }
    >
      <div className="space-y-5">
        {serviceName || barberName ? (
          <Panel className="bg-primary/10 p-3">
            <p className="atelier-label">Selecao pronta para agendamento</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {serviceName ? <Badge tone="primary">Servico: {serviceName}</Badge> : null}
              {barberName ? <Badge tone="primary">Barbeiro: {barberName}</Badge> : null}
            </div>
          </Panel>
        ) : null}

        {verifying ? <p className="text-sm text-foreground-muted">Validando link de ativacao...</p> : null}
        {verificationMessage ? <p className="text-sm text-success">{verificationMessage}</p> : null}
        {verificationError ? <p className="text-sm text-error">{verificationError}</p> : null}

        <form className="space-y-4" onSubmit={handleResend}>
          <label className="block space-y-1 text-sm">
            <span className="atelier-label">Reenviar link de ativacao</span>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@exemplo.com"
              required
            />
          </label>

          {resendError ? <p className="text-sm text-error">{resendError}</p> : null}
          {resendMessage ? <p className="text-sm text-success">{resendMessage}</p> : null}

          <Button type="submit" className="w-full" size="lg" disabled={resending}>
            {resending ? "Reenviando..." : "Reenviar email de ativacao"}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
