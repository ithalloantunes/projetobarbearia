"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin-shell";
import {
  Badge,
  Button,
  Drawer,
  Input,
  Modal,
  Panel,
  Table,
  TBody,
  TD,
  TH,
  THead,
  Textarea
} from "@/components/ui";

type Service = {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  price: number | string;
  durationMinutes: number;
  status: "ACTIVE" | "INACTIVE";
};

const initialForm = {
  name: "",
  description: "",
  imageUrl: "",
  price: "65",
  durationMinutes: "45"
};

export default function AdminServicosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const activeCount = useMemo(() => services.filter((item) => item.status === "ACTIVE").length, [services]);

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
          name: form.name,
          description: form.description || undefined,
          imageUrl: form.imageUrl || undefined,
          price: Number(form.price),
          durationMinutes: Number(form.durationMinutes),
          status: "ACTIVE"
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Falha ao criar servico.");
      }
      setMessage("Servico criado com sucesso.");
      setForm(initialForm);
      await load();
    } catch (createError) {
      const messageText = createError instanceof Error ? createError.message : "Falha ao criar servico.";
      setError(messageText);
    } finally {
      setSaving(false);
    }
  }

  async function saveEdition() {
    if (!selectedService) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/services/${selectedService.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedService.name,
          description: selectedService.description || null,
          imageUrl: selectedService.imageUrl || null,
          price: Number(selectedService.price),
          durationMinutes: Number(selectedService.durationMinutes),
          status: selectedService.status
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Falha ao atualizar servico.");
      }
      setMessage("Servico atualizado.");
      setDrawerOpen(false);
      await load();
    } catch (saveError) {
      const messageText = saveError instanceof Error ? saveError.message : "Falha ao atualizar servico.";
      setError(messageText);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedService) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/services/${selectedService.id}`, {
        method: "DELETE"
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Falha ao remover servico.");
      }
      setDeleteModalOpen(false);
      setDrawerOpen(false);
      setSelectedService(null);
      setMessage("Servico removido.");
      await load();
    } catch (deleteError) {
      const messageText = deleteError instanceof Error ? deleteError.message : "Falha ao remover servico.";
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
    <AdminShell title="Gestao de servicos" subtitle="Catalogo completo com configurador lateral e controle de status">
      <section className="grid gap-3 sm:grid-cols-3">
        <Panel>
          <p className="atelier-label">Total de servicos</p>
          <p className="text-2xl font-semibold">{services.length}</p>
        </Panel>
        <Panel>
          <p className="atelier-label">Ativos</p>
          <p className="text-2xl font-semibold">{activeCount}</p>
        </Panel>
        <Panel>
          <p className="atelier-label">Inativos</p>
          <p className="text-2xl font-semibold">{services.length - activeCount}</p>
        </Panel>
      </section>

      <Panel className="mt-4" title="Novo servico">
        <form className="grid gap-3 md:grid-cols-4" onSubmit={handleCreate}>
          <Input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Nome do servico"
            required
          />
          <Input
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
            type="number"
            step="0.01"
            min="1"
            placeholder="Preco"
            required
          />
          <Input
            value={form.durationMinutes}
            onChange={(event) => setForm((prev) => ({ ...prev, durationMinutes: event.target.value }))}
            type="number"
            min="5"
            max="480"
            placeholder="Duracao (min)"
            required
          />
          <Input
            value={form.imageUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
            placeholder="URL da imagem"
          />
          <Textarea
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Descricao"
            className="md:col-span-3"
          />
          <Button type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Criar servico"}
          </Button>
        </form>
        {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}
        {message ? <p className="mt-3 text-sm text-success">{message}</p> : null}
      </Panel>

      <Panel className="mt-4">
        <Table>
          <THead>
            <tr>
              <TH>Servico</TH>
              <TH>Descricao</TH>
              <TH>Preco</TH>
              <TH>Duracao</TH>
              <TH>Status</TH>
              <TH className="text-right">Acoes</TH>
            </tr>
          </THead>
          <TBody>
            {loading ? (
              <tr>
                <TD colSpan={6} className="text-foreground-muted">
                  Carregando...
                </TD>
              </tr>
            ) : services.length === 0 ? (
              <tr>
                <TD colSpan={6} className="text-foreground-muted">
                  Nenhum servico cadastrado.
                </TD>
              </tr>
            ) : (
              services.map((service) => (
                <tr key={service.id} className="hover:bg-surface-soft/55">
                  <TD className="font-semibold">{service.name}</TD>
                  <TD>{service.description || "-"}</TD>
                  <TD>R$ {Number(service.price).toFixed(2).replace(".", ",")}</TD>
                  <TD>{service.durationMinutes} min</TD>
                  <TD>
                    <Badge tone={service.status === "ACTIVE" ? "success" : "muted"}>{service.status}</Badge>
                  </TD>
                  <TD className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button intent="ghost" size="sm" onClick={() => toggleStatus(service)} disabled={saving}>
                        {service.status === "ACTIVE" ? "Inativar" : "Ativar"}
                      </Button>
                      <Button
                        intent="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedService(service);
                          setDrawerOpen(true);
                        }}
                      >
                        Configurar
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
        title={selectedService ? `Servico #${selectedService.id}` : "Servico"}
      >
        {selectedService ? (
          <div className="space-y-3">
            <Input
              value={selectedService.name}
              onChange={(event) =>
                setSelectedService((prev) => (prev ? { ...prev, name: event.target.value } : prev))
              }
              placeholder="Nome"
            />
            <Textarea
              value={selectedService.description ?? ""}
              onChange={(event) =>
                setSelectedService((prev) => (prev ? { ...prev, description: event.target.value } : prev))
              }
              placeholder="Descricao"
            />
            <Input
              value={String(selectedService.price)}
              onChange={(event) =>
                setSelectedService((prev) => (prev ? { ...prev, price: event.target.value } : prev))
              }
              type="number"
              step="0.01"
            />
            <Input
              value={String(selectedService.durationMinutes)}
              onChange={(event) =>
                setSelectedService((prev) => (prev ? { ...prev, durationMinutes: Number(event.target.value) } : prev))
              }
              type="number"
              min="5"
              max="480"
            />
            <Input
              value={selectedService.imageUrl ?? ""}
              onChange={(event) =>
                setSelectedService((prev) => (prev ? { ...prev, imageUrl: event.target.value } : prev))
              }
              placeholder="URL da imagem"
            />
            <div className="flex gap-2">
              <Button onClick={saveEdition} disabled={saving}>
                {saving ? "Salvando..." : "Salvar alteracoes"}
              </Button>
              <Button intent="danger" onClick={() => setDeleteModalOpen(true)} disabled={saving}>
                Excluir servico
              </Button>
            </div>
          </div>
        ) : null}
      </Drawer>

      <Modal
        open={deleteModalOpen}
        title="Excluir servico?"
        description="Esta acao remove o servico do catalogo e nao pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        busy={saving}
        danger
      />
    </AdminShell>
  );
}
