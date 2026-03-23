"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminShell from "@/components/admin-shell";

type ShopSettings = {
  businessName: string;
  phone: string;
  email: string;
  address: string;
  openingHours: string;
  cancellationPolicyMinutes: number;
};

const initialSettings: ShopSettings = {
  businessName: "",
  phone: "",
  email: "",
  address: "",
  openingHours: "",
  cancellationPolicyMinutes: 120
};

export default function AdminAjustesPage() {
  const [settings, setSettings] = useState<ShopSettings>(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/admin/settings");
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Falha ao carregar ajustes.");
        }
        if (!mounted) return;
        setSettings(payload.settings);
      } catch (loadError) {
        if (!mounted) return;
        const messageText = loadError instanceof Error ? loadError.message : "Falha ao carregar ajustes.";
        setError(messageText);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
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
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Falha ao salvar ajustes.");
      }
      setSettings(payload.settings);
      setMessage("Ajustes salvos com sucesso.");
    } catch (saveError) {
      const messageText = saveError instanceof Error ? saveError.message : "Falha ao salvar ajustes.";
      setError(messageText);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell title="Ajustes da barbearia" subtitle="Informacoes de contato e regras de operacao">
      <section className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 p-5">
        {loading ? (
          <p className="text-sm text-slate-500">Carregando ajustes...</p>
        ) : (
          <form className="grid md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            <label className="text-sm">
              <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Nome da unidade</span>
              <input
                className="w-full rounded-xl border border-primary/20 bg-transparent px-3 py-2"
                value={settings.businessName}
                onChange={(event) => setSettings((prev) => ({ ...prev, businessName: event.target.value }))}
                required
              />
            </label>
            <label className="text-sm">
              <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Telefone</span>
              <input
                className="w-full rounded-xl border border-primary/20 bg-transparent px-3 py-2"
                value={settings.phone}
                onChange={(event) => setSettings((prev) => ({ ...prev, phone: event.target.value }))}
                required
              />
            </label>
            <label className="text-sm">
              <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Email</span>
              <input
                type="email"
                className="w-full rounded-xl border border-primary/20 bg-transparent px-3 py-2"
                value={settings.email}
                onChange={(event) => setSettings((prev) => ({ ...prev, email: event.target.value }))}
                required
              />
            </label>
            <label className="text-sm">
              <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Horario de funcionamento</span>
              <input
                className="w-full rounded-xl border border-primary/20 bg-transparent px-3 py-2"
                value={settings.openingHours}
                onChange={(event) => setSettings((prev) => ({ ...prev, openingHours: event.target.value }))}
                required
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Endereco</span>
              <input
                className="w-full rounded-xl border border-primary/20 bg-transparent px-3 py-2"
                value={settings.address}
                onChange={(event) => setSettings((prev) => ({ ...prev, address: event.target.value }))}
                required
              />
            </label>
            <label className="text-sm">
              <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Cancelamento sem multa (min)</span>
              <input
                type="number"
                min={0}
                max={1440}
                className="w-full rounded-xl border border-primary/20 bg-transparent px-3 py-2"
                value={settings.cancellationPolicyMinutes}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    cancellationPolicyMinutes: Number(event.target.value)
                  }))
                }
                required
              />
            </label>

            <div className="md:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-primary text-background-dark text-sm font-bold hover:brightness-110 disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Salvar ajustes"}
              </button>
              {error ? <span className="text-sm text-red-500">{error}</span> : null}
              {message ? <span className="text-sm text-emerald-500">{message}</span> : null}
            </div>
          </form>
        )}
      </section>
    </AdminShell>
  );
}
