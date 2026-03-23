"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminShell from "@/components/admin-shell";

type Service = {
  id: number;
  name: string;
  description?: string | null;
  price: number | string;
  durationMinutes: number;
  status: "ACTIVE" | "INACTIVE";
};

export default function AdminServicosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("65");
  const [durationMinutes, setDurationMinutes] = useState("45");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/services");
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Falha ao carregar servicos.");
      }
      setServices(payload.services ?? []);
    } catch (loadError) {
      const messageText = loadError instanceof Error ? loadError.message : "Falha ao carregar servicos.";
      setError(messageText);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          durationMinutes: Number(durationMinutes),
          status: "ACTIVE"
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Falha ao criar servico.");
      }
      setMessage("Servico criado com sucesso.");
      setName("");
      setDescription("");
      setPrice("65");
      setDurationMinutes("45");
      await load();
    } catch (createError) {
      const messageText = createError instanceof Error ? createError.message : "Falha ao criar servico.";
      setError(messageText);
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(service: Service) {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: service.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Falha ao alterar status.");
      }
      setMessage("Status atualizado.");
      await load();
    } catch (toggleError) {
      const messageText = toggleError instanceof Error ? toggleError.message : "Falha ao alterar status.";
      setError(messageText);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell title="Gestao de servicos" subtitle="Crie e mantenha o catalogo da barbearia">
      <section className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 p-5">
        <form className="grid md:grid-cols-4 gap-3" onSubmit={handleCreate}>
          <input
            className="rounded-xl border border-primary/20 bg-transparent px-3 py-2 text-sm"
            placeholder="Nome do servico"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <input
            className="rounded-xl border border-primary/20 bg-transparent px-3 py-2 text-sm"
            placeholder="Descricao"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <input
            type="number"
            step="0.01"
            min="1"
            className="rounded-xl border border-primary/20 bg-transparent px-3 py-2 text-sm"
            placeholder="Preco"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
          />
          <div className="flex gap-2">
            <input
              type="number"
              min="5"
              max="480"
              className="w-full rounded-xl border border-primary/20 bg-transparent px-3 py-2 text-sm"
              placeholder="Duracao (min)"
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
              required
            />
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-primary text-background-dark text-sm font-bold hover:brightness-110 disabled:opacity-60"
            >
              {saving ? "..." : "Criar"}
            </button>
          </div>
        </form>
        {error ? <p className="text-sm text-red-500 mt-3">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-500 mt-3">{message}</p> : null}
      </section>

      <section className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-primary/10">
              <tr>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Nome</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Descricao</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Preco</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Duracao</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-sm text-slate-500">
                    Carregando...
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-sm text-slate-500">
                    Nenhum servico cadastrado.
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{service.name}</td>
                    <td className="px-4 py-3 text-sm">{service.description || "-"}</td>
                    <td className="px-4 py-3 text-sm">R$ {Number(service.price).toFixed(2).replace(".", ",")}</td>
                    <td className="px-4 py-3 text-sm">{service.durationMinutes} min</td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => toggleStatus(service)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          service.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-600/20"
                            : "bg-slate-500/10 text-slate-600 border-slate-600/20"
                        }`}
                      >
                        {service.status}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
