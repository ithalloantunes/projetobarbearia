"use client";

import { FormEvent, useEffect, useState } from "react";
import ClientShell from "@/components/shells/client-shell";
import { Badge, Button, Input, Panel, SectionHeader } from "@/components/ui";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_POLICY_TEXT,
  validatePasswordPolicy
} from "@/lib/password-policy";

type ProfileUser = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: "CLIENT";
  status: "ACTIVE" | "INACTIVE";
};

export default function ClientePerfilPage() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/client/profile");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Falha ao carregar perfil.");
        }
        if (!mounted) return;
        setUser(data.user);
        setName(data.user.name ?? "");
        setEmail(data.user.email ?? "");
        setPhone(data.user.phone ?? "");
      } catch (loadError) {
        if (!mounted) return;
        const messageText = loadError instanceof Error ? loadError.message : "Falha ao carregar perfil.";
        setError(messageText);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword) {
      const passwordPolicy = validatePasswordPolicy(newPassword);
      if (!passwordPolicy.valid) {
        setError(passwordPolicy.message);
        return;
      }
    }

    setSaving(true);

    try {
      const response = await fetch("/api/client/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          ...(newPassword ? { currentPassword, newPassword } : {})
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Falha ao atualizar perfil.");
      }
      setMessage("Perfil atualizado com sucesso.");
      setUser(data.user);
      setCurrentPassword("");
      setNewPassword("");
    } catch (saveError) {
      const messageText = saveError instanceof Error ? saveError.message : "Falha ao atualizar perfil.";
      setError(messageText);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ClientShell>
      <SectionHeader
        eyebrow="Perfil"
        title="Minha conta"
        description="Atualize seus dados pessoais e credenciais de acesso."
      />

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr,280px]">
        <Panel>
          {loading ? (
            <p className="text-sm text-foreground-muted">Carregando...</p>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="block space-y-1 text-sm">
                <span className="atelier-label">Nome</span>
                <Input value={name} onChange={(event) => setName(event.target.value)} required />
              </label>

              <label className="block space-y-1 text-sm">
                <span className="atelier-label">Email</span>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>

              <label className="block space-y-1 text-sm">
                <span className="atelier-label">Telefone</span>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </label>

              <div className="atelier-surface space-y-3 p-4">
                <p className="text-sm font-semibold">Alteracao de senha (opcional)</p>
                <label className="block space-y-1 text-sm">
                  <span className="atelier-label">Senha atual</span>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                  />
                </label>
                <label className="block space-y-1 text-sm">
                  <span className="atelier-label">Nova senha</span>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    minLength={PASSWORD_MIN_LENGTH}
                  />
                </label>
                <p className="text-xs text-foreground-muted">{PASSWORD_POLICY_TEXT}</p>
              </div>

              {error ? <p className="text-sm text-error">{error}</p> : null}
              {message ? <p className="text-sm text-success">{message}</p> : null}

              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar alteracoes"}
              </Button>
            </form>
          )}
        </Panel>

        <Panel title="Status da conta">
          <div className="space-y-3 text-sm">
            <div className="atelier-surface p-3">
              <p className="atelier-label">Perfil</p>
              <p className="font-semibold">Cliente</p>
            </div>
            <div className="atelier-surface p-3">
              <p className="atelier-label">Situacao</p>
              <Badge tone={user?.status === "ACTIVE" ? "success" : "muted"}>
                {user?.status === "ACTIVE" ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <div className="atelier-surface p-3">
              <p className="atelier-label">ID</p>
              <p className="font-semibold">#{user?.id ?? "-"}</p>
            </div>
          </div>
        </Panel>
      </section>
    </ClientShell>
  );
}
