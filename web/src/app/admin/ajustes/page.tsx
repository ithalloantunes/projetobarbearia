"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin-shell";
import {
  Button,
  Input,
  Panel,
  Switch,
  Textarea
} from "@/components/ui";

type DayHours = {
  enabled: boolean;
  open: string;
  close: string;
};

type ShopSettings = {
  businessName: string;
  phone: string;
  email: string;
  address: string;
  openingHours: string;
  businessHours: Record<string, DayHours>;
  cancellationPolicyMinutes: number;
  cancellationPolicyText: string;
  notificationChannels: {
    email: boolean;
    whatsapp: boolean;
    sms: boolean;
  };
  socialLinks: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
  storefrontHeroImage: string;
  brandPreviewImage: string;
};

const initialSettings: ShopSettings = {
  businessName: "",
  phone: "",
  email: "",
  address: "",
  openingHours: "",
  businessHours: {
    monday: { enabled: true, open: "09:00", close: "20:00" },
    tuesday: { enabled: true, open: "09:00", close: "20:00" },
    wednesday: { enabled: true, open: "09:00", close: "20:00" },
    thursday: { enabled: true, open: "09:00", close: "20:00" },
    friday: { enabled: true, open: "09:00", close: "20:00" },
    saturday: { enabled: true, open: "08:00", close: "18:00" },
    sunday: { enabled: false, open: "09:00", close: "13:00" }
  },
  cancellationPolicyMinutes: 120,
  cancellationPolicyText: "",
  notificationChannels: {
    email: true,
    whatsapp: true,
    sms: false
  },
  socialLinks: {
    instagram: "",
    facebook: "",
    tiktok: ""
  },
  storefrontHeroImage: "",
  brandPreviewImage: ""
};

const dayLabels: Record<string, string> = {
  monday: "Segunda",
  tuesday: "Terca",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sabado",
  sunday: "Domingo"
};

function normalizeSettings(settings: ShopSettings) {
  return JSON.stringify(settings);
}

export default function AdminAjustesPage() {
  const [settings, setSettings] = useState<ShopSettings>(initialSettings);
  const [snapshot, setSnapshot] = useState<string>(normalizeSettings(initialSettings));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const isDirty = useMemo(() => normalizeSettings(settings) !== snapshot, [settings, snapshot]);

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
        setSnapshot(normalizeSettings(payload.settings));
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
      setSnapshot(normalizeSettings(payload.settings));
      setMessage("Ajustes salvos com sucesso.");
    } catch (saveError) {
      const messageText = saveError instanceof Error ? saveError.message : "Falha ao salvar ajustes.";
      setError(messageText);
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    if (!isDirty) return;
    const parsed = JSON.parse(snapshot) as ShopSettings;
    setSettings(parsed);
    setMessage("Alteracoes descartadas.");
    setError(null);
  }

  return (
    <AdminShell title="Ajustes da barbearia" subtitle="Canal de contato, horarios, notificacoes e identidade visual">
      {loading ? (
        <Panel>
          <p className="text-sm text-foreground-muted">Carregando ajustes...</p>
        </Panel>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <section className="grid gap-4 lg:grid-cols-[1fr,320px]">
            <Panel title="Informacoes basicas">
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  value={settings.businessName}
                  onChange={(event) => setSettings((prev) => ({ ...prev, businessName: event.target.value }))}
                  placeholder="Nome da unidade"
                  required
                />
                <Input
                  value={settings.phone}
                  onChange={(event) => setSettings((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="Telefone"
                  required
                />
                <Input
                  type="email"
                  value={settings.email}
                  onChange={(event) => setSettings((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Email"
                  required
                />
                <Input
                  value={settings.openingHours}
                  onChange={(event) => setSettings((prev) => ({ ...prev, openingHours: event.target.value }))}
                  placeholder="Horario resumo"
                  required
                />
                <Input
                  className="md:col-span-2"
                  value={settings.address}
                  onChange={(event) => setSettings((prev) => ({ ...prev, address: event.target.value }))}
                  placeholder="Endereco"
                  required
                />
              </div>
            </Panel>

            <Panel title="Preview storefront">
              <div className="space-y-3">
                <div className="overflow-hidden rounded-md border border-outline-variant">
                  {settings.brandPreviewImage ? (
                    <img src={settings.brandPreviewImage} alt="Preview" className="h-36 w-full object-cover" />
                  ) : (
                    <div className="flex h-36 items-center justify-center bg-surface-soft text-sm text-foreground-muted">
                      Sem preview
                    </div>
                  )}
                </div>
                <Input
                  value={settings.brandPreviewImage}
                  onChange={(event) =>
                    setSettings((prev) => ({ ...prev, brandPreviewImage: event.target.value }))
                  }
                  placeholder="URL preview"
                />
                <Input
                  value={settings.storefrontHeroImage}
                  onChange={(event) =>
                    setSettings((prev) => ({ ...prev, storefrontHeroImage: event.target.value }))
                  }
                  placeholder="URL hero"
                />
              </div>
            </Panel>
          </section>

          <Panel title="Horario estruturado por dia">
            <div className="space-y-3">
              {Object.entries(settings.businessHours).map(([key, value]) => (
                <div key={key} className="grid items-center gap-3 rounded-md border border-outline-variant p-3 md:grid-cols-[130px,auto,1fr,1fr]">
                  <p className="text-sm font-semibold">{dayLabels[key] ?? key}</p>
                  <Switch
                    checked={value.enabled}
                    onChange={(enabled) =>
                      setSettings((prev) => ({
                        ...prev,
                        businessHours: {
                          ...prev.businessHours,
                          [key]: { ...prev.businessHours[key], enabled }
                        }
                      }))
                    }
                  />
                  <Input
                    type="time"
                    value={value.open}
                    disabled={!value.enabled}
                    onChange={(event) =>
                      setSettings((prev) => ({
                        ...prev,
                        businessHours: {
                          ...prev.businessHours,
                          [key]: { ...prev.businessHours[key], open: event.target.value }
                        }
                      }))
                    }
                  />
                  <Input
                    type="time"
                    value={value.close}
                    disabled={!value.enabled}
                    onChange={(event) =>
                      setSettings((prev) => ({
                        ...prev,
                        businessHours: {
                          ...prev.businessHours,
                          [key]: { ...prev.businessHours[key], close: event.target.value }
                        }
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </Panel>

          <section className="grid gap-4 lg:grid-cols-2">
            <Panel title="Politica de cancelamento">
              <div className="space-y-3">
                <Input
                  type="number"
                  min={0}
                  max={1440}
                  value={String(settings.cancellationPolicyMinutes)}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      cancellationPolicyMinutes: Number(event.target.value)
                    }))
                  }
                />
                <Textarea
                  value={settings.cancellationPolicyText}
                  onChange={(event) =>
                    setSettings((prev) => ({ ...prev, cancellationPolicyText: event.target.value }))
                  }
                  placeholder="Detalhe regras de cancelamento e remarcacao."
                />
              </div>
            </Panel>

            <Panel title="Canais e redes">
              <div className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={settings.notificationChannels.email}
                      onChange={(next) =>
                        setSettings((prev) => ({
                          ...prev,
                          notificationChannels: { ...prev.notificationChannels, email: next }
                        }))
                      }
                    />
                    Email
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={settings.notificationChannels.whatsapp}
                      onChange={(next) =>
                        setSettings((prev) => ({
                          ...prev,
                          notificationChannels: { ...prev.notificationChannels, whatsapp: next }
                        }))
                      }
                    />
                    WhatsApp
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={settings.notificationChannels.sms}
                      onChange={(next) =>
                        setSettings((prev) => ({
                          ...prev,
                          notificationChannels: { ...prev.notificationChannels, sms: next }
                        }))
                      }
                    />
                    SMS
                  </label>
                </div>
                <Input
                  value={settings.socialLinks.instagram}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, instagram: event.target.value }
                    }))
                  }
                  placeholder="Instagram"
                />
                <Input
                  value={settings.socialLinks.facebook}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, facebook: event.target.value }
                    }))
                  }
                  placeholder="Facebook"
                />
                <Input
                  value={settings.socialLinks.tiktok}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, tiktok: event.target.value }
                    }))
                  }
                  placeholder="TikTok"
                />
              </div>
            </Panel>
          </section>

          <div className="sticky bottom-2 z-20 rounded-lg border border-outline bg-background-elevated/95 p-3 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-foreground-muted">
                {isDirty ? "Alteracoes pendentes para salvar." : "Sem alteracoes pendentes."}
              </p>
              <div className="flex items-center gap-2">
                <Button intent="ghost" type="button" onClick={handleDiscard} disabled={!isDirty || saving}>
                  Descartar
                </Button>
                <Button type="submit" disabled={!isDirty || saving}>
                  {saving ? "Salvando..." : "Salvar ajustes"}
                </Button>
              </div>
            </div>
            {error ? <p className="mt-2 text-sm text-error">{error}</p> : null}
            {message ? <p className="mt-2 text-sm text-success">{message}</p> : null}
          </div>
        </form>
      )}
    </AdminShell>
  );
}
