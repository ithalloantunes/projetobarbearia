"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import AuthShell from "@/components/shells/auth-shell";
import { Button, Input } from "@/components/ui";

function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  return score;
}

export default function RedefinirSenhaPage() {
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("token") || "";
    setToken(value);
  }, []);

  const strength = useMemo(() => passwordStrength(password), [password]);

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
    <AuthShell
      title="Redefinir senha"
      description="Crie uma nova senha forte para proteger o acesso a sua conta."
      footer={
        <Link href="/entrar" className="font-semibold text-primary hover:underline">
          Ir para login
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-1 text-sm">
          <span className="atelier-label">Nova senha</span>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-foreground-muted"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </label>

        <div className="h-1.5 overflow-hidden rounded-full bg-surface-soft">
          <div
            className="h-full transition-all"
            style={{
              width: `${(strength / 4) * 100}%`,
              background:
                strength <= 1
                  ? "rgb(196,84,73)"
                  : strength === 2
                    ? "rgb(184,125,56)"
                    : "rgb(73,142,89)"
            }}
          />
        </div>

        <label className="block space-y-1 text-sm">
          <span className="atelier-label">Confirmar senha</span>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={6}
              required
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-foreground-muted"
              onClick={() => setShowConfirmPassword((value) => !value)}
            >
              {showConfirmPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </label>

        {error ? <p className="text-sm text-error">{error}</p> : null}
        {message ? <p className="text-sm text-success">{message}</p> : null}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Salvando..." : "Salvar nova senha"}
        </Button>
      </form>
    </AuthShell>
  );
}
