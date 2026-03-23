"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin-shell";

type Client = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  appointments: Array<{ id: number; status: string; date: string }>;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function AdminClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const q = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
      const response = await fetch(`/api/admin/clients${q}`);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Falha ao carregar clientes.");
      }
      setClients(payload.clients ?? []);
    } catch (loadError) {
      const messageText = loadError instanceof Error ? loadError.message : "Falha ao carregar clientes.";
      setError(messageText);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleStatus(client: Client) {
    setSavingId(client.id);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: client.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Falha ao atualizar cliente.");
      }
      setMessage("Cliente atualizado.");
      await load();
    } catch (toggleError) {
      const messageText = toggleError instanceof Error ? toggleError.message : "Falha ao atualizar cliente.";
      setError(messageText);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <AdminShell title="Gestao de clientes" subtitle="Busca, historico e controle de status">
      <section className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 p-4">
        <div className="flex flex-wrap gap-2">
          <input
            className="flex-1 min-w-[220px] rounded-xl border border-primary/20 bg-transparent px-3 py-2 text-sm"
            placeholder="Buscar por nome, email ou telefone"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button
            type="button"
            onClick={load}
            className="px-4 py-2 rounded-xl bg-primary text-background-dark text-sm font-bold hover:brightness-110"
          >
            Buscar
          </button>
        </div>
        {error ? <p className="text-sm text-red-500 mt-3">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-500 mt-3">{message}</p> : null}
      </section>

      <section className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-primary/10">
              <tr>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Cliente</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Contato</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Cadastro</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Atendimentos</th>
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
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-sm text-slate-500">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{client.name}</td>
                    <td className="px-4 py-3 text-sm">
                      <p>{client.email || "-"}</p>
                      <p className="text-xs text-slate-500">{client.phone || "-"}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{formatDate(client.createdAt)}</td>
                    <td className="px-4 py-3 text-sm">{client.appointments.length}</td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        type="button"
                        disabled={savingId === client.id}
                        onClick={() => toggleStatus(client)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          client.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-600/20"
                            : "bg-slate-500/10 text-slate-600 border-slate-600/20"
                        }`}
                      >
                        {savingId === client.id ? "..." : client.status}
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
