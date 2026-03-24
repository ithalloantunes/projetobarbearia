"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin-shell";
import {
  Badge,
  Button,
  Checkbox,
  Input,
  Panel,
  Table,
  TBody,
  TD,
  TH,
  THead
} from "@/components/ui";

type ServiceOption = {
  id: number;
  name: string;
};

type Barber = {
  id: number;
  name: string;
  specialty?: string | null;
  email?: string | null;
  status: "ACTIVE" | "INACTIVE";
  services: Array<{ service: ServiceOption }>;
  user?: { id: number; email: string | null } | null;
};

export default function AdminEquipePage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("senha123");
  const [createLogin, setCreateLogin] = useState(true);
  const [serviceIds, setServiceIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [barbersRes, servicesRes] = await Promise.all([
        fetch("/api/admin/barbers"),
        fetch("/api/admin/services")
      ]);
      const barbersData = await barbersRes.json();
      const servicesData = await servicesRes.json();
      if (!barbersRes.ok) {
        throw new Error(barbersData.error || "Falha ao carregar equipe.");
      }
      if (!servicesRes.ok) {
        throw new Error(servicesData.error || "Falha ao carregar servicos.");
      }
      setBarbers(barbersData.barbers ?? []);
      setServices((servicesData.services ?? []).filter((item: { status: string }) => item.status === "ACTIVE"));
    } catch (loadError) {
      const messageText = loadError instanceof Error ? loadError.message : "Falha ao carregar equipe.";
      setError(messageText);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const active = barbers.filter((item) => item.status === "ACTIVE").length;
    const withLogin = barbers.filter((item) => item.user?.email).length;
    const withServices = barbers.filter((item) => item.services.length > 0).length;
    return { active, withLogin, withServices };
  }, [barbers]);

  function toggleService(serviceId: number) {
    setServiceIds((previous) =>
      previous.includes(serviceId) ? previous.filter((id) => id !== serviceId) : [...previous, serviceId]
    );
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/barbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          specialty: specialty || undefined,
          email: email || undefined,
          phone: phone || undefined,
          createLogin,
          password: createLogin ? password : undefined
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Falha ao criar barbeiro.");
      }

      if (serviceIds.length > 0) {
        await fetch(`/api/admin/barbers/${payload.barber.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serviceIds })
        });
      }

      setMessage("Barbeiro criado com sucesso.");
      setName("");
      setSpecialty("");
      setEmail("");
      setPhone("");
      setServiceIds([]);
      await load();
    } catch (createError) {
      const messageText = createError instanceof Error ? createError.message : "Falha ao criar barbeiro.";
      setError(messageText);
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(barber: Barber) {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/barbers/${barber.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: barber.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Falha ao atualizar status.");
      }
      setMessage("Status da equipe atualizado.");
      await load();
    } catch (toggleError) {
      const messageText = toggleError instanceof Error ? toggleError.message : "Falha ao atualizar status.";
      setError(messageText);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell title="Gestao da equipe" subtitle="Cadastro, acesso e vinculacao de servicos por barbeiro">
      <section className="grid gap-3 sm:grid-cols-3">
        <Panel>
          <p className="atelier-label">Ativos</p>
          <p className="text-2xl font-semibold">{stats.active}</p>
        </Panel>
        <Panel>
          <p className="atelier-label">Com login</p>
          <p className="text-2xl font-semibold">{stats.withLogin}</p>
        </Panel>
        <Panel>
          <p className="atelier-label">Com servicos</p>
          <p className="text-2xl font-semibold">{stats.withServices}</p>
        </Panel>
      </section>

      <Panel className="mt-4" title="Novo barbeiro">
        <form className="grid gap-3 md:grid-cols-2" onSubmit={handleCreate}>
          <Input placeholder="Nome" value={name} onChange={(event) => setName(event.target.value)} required />
          <Input placeholder="Especialidade" value={specialty} onChange={(event) => setSpecialty(event.target.value)} />
          <Input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input placeholder="Telefone" value={phone} onChange={(event) => setPhone(event.target.value)} />
          <div className="md:col-span-2">
            <Checkbox checked={createLogin} onChange={(event) => setCreateLogin(event.target.checked)} label="Criar login para este barbeiro" />
          </div>
          <Input
            type="text"
            placeholder="Senha inicial"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={!createLogin}
          />

          <div className="md:col-span-2">
            <p className="atelier-label">Servicos atendidos</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggleService(service.id)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    serviceIds.includes(service.id)
                      ? "border-primary/45 bg-primary/14 text-primary"
                      : "border-outline text-foreground-muted"
                  }`}
                >
                  {service.name}
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Cadastrar barbeiro"}
            </Button>
          </div>
        </form>
        {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}
        {message ? <p className="mt-3 text-sm text-success">{message}</p> : null}
      </Panel>

      <Panel className="mt-4">
        <Table>
          <THead>
            <tr>
              <TH>Nome</TH>
              <TH>Especialidade</TH>
              <TH>Contato</TH>
              <TH>Servicos</TH>
              <TH>Status</TH>
            </tr>
          </THead>
          <TBody>
            {loading ? (
              <tr>
                <TD colSpan={5} className="text-foreground-muted">
                  Carregando...
                </TD>
              </tr>
            ) : barbers.length === 0 ? (
              <tr>
                <TD colSpan={5} className="text-foreground-muted">
                  Nenhum barbeiro cadastrado.
                </TD>
              </tr>
            ) : (
              barbers.map((barber) => (
                <tr key={barber.id} className="hover:bg-surface-soft/55">
                  <TD className="font-semibold">{barber.name}</TD>
                  <TD>{barber.specialty || "-"}</TD>
                  <TD>
                    <p>{barber.email || "-"}</p>
                    <p className="text-xs text-foreground-muted">
                      {barber.user?.email ? "login ativo" : "sem login"}
                    </p>
                  </TD>
                  <TD>{barber.services.map((entry) => entry.service.name).join(", ") || "-"}</TD>
                  <TD>
                    <Button
                      intent={barber.status === "ACTIVE" ? "secondary" : "ghost"}
                      size="sm"
                      disabled={saving}
                      onClick={() => toggleStatus(barber)}
                    >
                      <Badge tone={barber.status === "ACTIVE" ? "success" : "muted"}>{barber.status}</Badge>
                    </Button>
                  </TD>
                </tr>
              ))
            )}
          </TBody>
        </Table>
      </Panel>
    </AdminShell>
  );
}
