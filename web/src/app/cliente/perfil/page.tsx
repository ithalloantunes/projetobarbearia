"use client";

import { FormEvent, useEffect, useState } from "react";
import ClientHeader from "@/components/client-header";

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
    setSaving(true);
    setError(null);
    setMessage(null);

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
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <ClientHeader />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <section className="rounded-2xl border border-primary/10 bg-white dark:bg-white/5 p-6 md:p-8">
          <h1 className="text-2xl font-black tracking-tight">Meu perfil</h1>
          <p className="text-sm text-slate-500 mt-1">Mantenha seus dados sempre atualizados.</p>

          {loading ? (
            <p className="text-sm text-slate-500 mt-6">Carregando...</p>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Nome</label>
                <input
                  className="mt-1 w-full rounded-xl border border-primary/20 bg-transparent px-3 py-2 text-sm"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Email</label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-xl border border-primary/20 bg-transparent px-3 py-2 text-sm"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Telefone</label>
                <input
                  type="tel"
                  className="mt-1 w-full rounded-xl border border-primary/20 bg-transparent px-3 py-2 text-sm"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="rounded-xl border border-primary/10 p-4 space-y-3">
                <p className="text-sm font-bold">Alterar senha (opcional)</p>
                <div>
                  <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Senha atual</label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded-xl border border-primary/20 bg-transparent px-3 py-2 text-sm"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Nova senha</label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded-xl border border-primary/20 bg-transparent px-3 py-2 text-sm"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                  />
                </div>
              </div>

              {error ? <p className="text-sm text-red-500">{error}</p> : null}
              {message ? <p className="text-sm text-emerald-500">{message}</p> : null}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-3 rounded-xl bg-primary text-background-dark font-bold text-sm hover:brightness-110 disabled:opacity-60"
                >
                  {saving ? "Salvando..." : "Salvar alteracoes"}
                </button>
                <span className="text-xs text-slate-500">Perfil: {user?.status === "ACTIVE" ? "Ativo" : "Inativo"}</span>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
