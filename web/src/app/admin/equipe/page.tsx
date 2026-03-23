"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminShell from "@/components/admin-shell";

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
    <AdminShell title="Gestao da equipe" subtitle="Cadastro e controle de barbeiros">
      <section className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 p-5 space-y-4">
        <h2 className="text-lg font-bold">Novo barbeiro</h2>
        <form className="grid md:grid-cols-2 gap-3" onSubmit={handleCreate}>
          <input
            className="rounded-xl border border-primary/20 bg-transparent px-3 py-2 text-sm"
            placeholder="Nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <input
            className="rounded-xl border border-primary/20 bg-transparent px-3 py-2 text-sm"
            placeholder="Especialidade"
            value={specialty}
            onChange={(event) => setSpecialty(event.target.value)}
          />
          <input
            type="email"
            className="rounded-xl border border-primary/20 bg-transparent px-3 py-2 text-sm"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            className="rounded-xl border border-primary/20 bg-transparent px-3 py-2 text-sm"
            placeholder="Telefone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={createLogin}
              onChange={(event) => setCreateLogin(event.target.checked)}
            />
            Criar login para este barbeiro
          </label>
          <input
            type="text"
            className="rounded-xl border border-primary/20 bg-transparent px-3 py-2 text-sm"
            placeholder="Senha inicial"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={!createLogin}
          />
          <div className="md:col-span-2">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Servicos atendidos</p>
            <div className="flex flex-wrap gap-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggleService(service.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    serviceIds.includes(service.id)
                      ? "bg-primary/15 border-primary text-primary"
                      : "border-primary/20 text-slate-500"
                  }`}
                >
                  {service.name}
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-primary text-background-dark text-sm font-bold hover:brightness-110 disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Cadastrar barbeiro"}
            </button>
          </div>
        </form>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-500">{message}</p> : null}
      </section>

      <section className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-primary/10">
              <tr>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Nome</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Especialidade</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Contato</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Servicos</th>
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
              ) : barbers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-sm text-slate-500">
                    Nenhum barbeiro cadastrado.
                  </td>
                </tr>
              ) : (
                barbers.map((barber) => (
                  <tr key={barber.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{barber.name}</td>
                    <td className="px-4 py-3 text-sm">{barber.specialty || "-"}</td>
                    <td className="px-4 py-3 text-sm">
                      <p>{barber.email || "-"}</p>
                      <p className="text-xs text-slate-500">{barber.user?.email ? "login ativo" : "sem login"}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {barber.services.map((entry) => entry.service.name).join(", ") || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => toggleStatus(barber)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          barber.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-600/20"
                            : "bg-slate-500/10 text-slate-600 border-slate-600/20"
                        }`}
                      >
                        {barber.status}
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
