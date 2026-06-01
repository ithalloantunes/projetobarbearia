"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin-shell";
import {
  Badge,
  Button,
  Drawer,
  EmptyState,
  Input,
  Panel,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  Textarea
} from "@/components/ui";

type Client = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  appointments: Array<{ id: number; status: string; date: string }>;
  stats: {
    totalAppointments: number;
    completedAppointments: number;
    totalSpent: number;
    lastAppointmentAt: string | null;
    tier: "CLASSIC" | "SILVER" | "GOLD" | "BLACK";
  };
};

type ClientDetails = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  appointments: Array<{
    id: number;
    date: string;
    status: string;
    price: string | number;
    service: { name: string };
    barber: { name: string };
  }>;
  stats: {
    totalAppointments: number;
    completedAppointments: number;
    totalSpent: number;
    tier: string;
    lastAppointmentAt: string | null;
  };
  note: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function buildClientCsv(clients: Client[]) {
  const headers = ["id", "nome", "email", "telefone", "tier", "status", "investimento_total"];
  const rows = clients.map((client) =>
    [
      client.id,
      client.name,
      client.email ?? "",
      client.phone ?? "",
      client.stats.tier,
      client.status,
      client.stats.totalSpent.toFixed(2)
    ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

export default function AdminClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<"ALL" | "CLASSIC" | "SILVER" | "GOLD" | "BLACK">("ALL");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientDetails | null>(null);
  const [clientNote, setClientNote] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (tier !== "ALL") params.set("tier", tier);
      const response = await fetch(`/api/admin/clients?${params.toString()}`);
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

  async function openDrawer(clientId: number) {
    setDrawerOpen(true);
    setSelectedClient(null);
    try {
      const response = await fetch(`/api/admin/clients/${clientId}`);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Falha ao carregar detalhes do cliente.");
      }
      setSelectedClient(payload.client);
      setClientNote(payload.client.note || "");
    } catch (drawerError) {
      const messageText = drawerError instanceof Error ? drawerError.message : "Falha ao carregar detalhes.";
      setError(messageText);
      setDrawerOpen(false);
    }
  }

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
      if (selectedClient?.id === client.id) {
        await openDrawer(client.id);
      }
    } catch (toggleError) {
      const messageText = toggleError instanceof Error ? toggleError.message : "Falha ao atualizar cliente.";
      setError(messageText);
    } finally {
      setSavingId(null);
    }
  }

  async function saveNote() {
    if (!selectedClient) return;
    setSavingId(selectedClient.id);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/clients/${selectedClient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: clientNote })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Falha ao salvar nota.");
      }
      setMessage("Nota interna atualizada.");
      await openDrawer(selectedClient.id);
      await load();
    } catch (saveError) {
      const messageText = saveError instanceof Error ? saveError.message : "Falha ao salvar nota.";
      setError(messageText);
    } finally {
      setSavingId(null);
    }
  }

  const csvHref = useMemo(() => {
    if (!clients.length) return "";
    const blob = new Blob([buildClientCsv(clients)], { type: "text/csv;charset=utf-8;" });
    return URL.createObjectURL(blob);
  }, [clients]);

  return (
    <AdminShell
      title="Gestao de clientes"
      subtitle="Busca inteligente, tiers de fidelidade e historico com drawer lateral."
      actions={
        csvHref ? (
          <a href={csvHref} download="clientes.csv">
            <Button intent="secondary" size="sm">
              Exportar CSV
            </Button>
          </a>
        ) : null
      }
    >
      <Panel>
        <div className="grid gap-2 md:grid-cols-[1fr,170px,130px]">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome, email ou telefone"
          />
          <Select value={tier} onChange={(event) => setTier(event.target.value as typeof tier)}>
            <option value="ALL">Todos os tiers</option>
            <option value="CLASSIC">Classic</option>
            <option value="SILVER">Silver</option>
            <option value="GOLD">Gold</option>
            <option value="BLACK">Black</option>
          </Select>
          <Button onClick={load} size="sm">
            Buscar
          </Button>
        </div>
        {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}
        {message ? <p className="mt-3 text-sm text-success">{message}</p> : null}
      </Panel>

      <Panel className="mt-4">
        <Table>
          <THead>
            <tr>
              <TH>Cliente</TH>
              <TH>Contato</TH>
              <TH>Tier</TH>
              <TH>Ultimo atendimento</TH>
              <TH>Investimento</TH>
              <TH>Status</TH>
              <TH className="text-right">Acoes</TH>
            </tr>
          </THead>
          <TBody>
            {loading ? (
              <tr>
                <TD colSpan={7} className="text-foreground-muted">
                  Carregando...
                </TD>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <TD colSpan={7}>
                  <EmptyState
                    icon="search_off"
                    title="Nenhum cliente encontrado"
                    description="Refine filtros ou limpe a busca para ver todos os perfis."
                  />
                </TD>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} className="hover:bg-surface-soft/50">
                  <TD className="font-semibold">{client.name}</TD>
                  <TD>
                    <p>{client.email || "-"}</p>
                    <p className="text-xs text-foreground-muted">{client.phone || "-"}</p>
                  </TD>
                  <TD>
                    <Badge tone={client.stats.tier === "BLACK" ? "primary" : "muted"}>
                      {client.stats.tier}
                    </Badge>
                  </TD>
                  <TD>
                    {client.stats.lastAppointmentAt ? formatDate(client.stats.lastAppointmentAt) : "-"}
                  </TD>
                  <TD>{formatBRL(client.stats.totalSpent)}</TD>
                  <TD>
                    <Badge tone={client.status === "ACTIVE" ? "success" : "muted"}>
                      {client.status}
                    </Badge>
                  </TD>
                  <TD className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button intent="ghost" size="sm" onClick={() => openDrawer(client.id)}>
                        Ver perfil
                      </Button>
                      <Button
                        intent="secondary"
                        size="sm"
                        disabled={savingId === client.id}
                        onClick={() => toggleStatus(client)}
                      >
                        {savingId === client.id ? "..." : client.status === "ACTIVE" ? "Inativar" : "Ativar"}
                      </Button>
                    </div>
                  </TD>
                </tr>
              ))
            )}
          </TBody>
        </Table>
      </Panel>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedClient ? `Cliente #${selectedClient.id}` : "Detalhes"}
      >
        {selectedClient ? (
          <div className="space-y-4">
            <Panel>
              <p className="text-lg font-semibold">{selectedClient.name}</p>
              <p className="text-sm text-foreground-muted">{selectedClient.email || "-"}</p>
              <p className="text-sm text-foreground-muted">{selectedClient.phone || "-"}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="atelier-surface p-2 text-center">
                  <p className="atelier-label">Tier</p>
                  <p className="font-semibold">{selectedClient.stats.tier}</p>
                </div>
                <div className="atelier-surface p-2 text-center">
                  <p className="atelier-label">Investimento</p>
                  <p className="font-semibold">{formatBRL(selectedClient.stats.totalSpent)}</p>
                </div>
              </div>
            </Panel>

            <Panel title="Nota interna">
              <Textarea value={clientNote} onChange={(event) => setClientNote(event.target.value)} />
              <Button className="mt-3" size="sm" onClick={saveNote} disabled={savingId === selectedClient.id}>
                {savingId === selectedClient.id ? "Salvando..." : "Salvar nota"}
              </Button>
            </Panel>

            <Panel title="Historico recente">
              <div className="space-y-2">
                {selectedClient.appointments.length === 0 ? (
                  <p className="text-sm text-foreground-muted">Sem historico recente.</p>
                ) : (
                  selectedClient.appointments.map((item) => (
                    <div key={item.id} className="atelier-surface p-3 text-sm">
                      <p className="font-semibold">{item.service.name}</p>
                      <p className="text-xs text-foreground-muted">
                        {formatDate(item.date)} • {item.barber.name}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {item.status} • R$ {Number(item.price).toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </div>
        ) : (
          <p className="text-sm text-foreground-muted">Carregando perfil...</p>
        )}
      </Drawer>
    </AdminShell>
  );
}
