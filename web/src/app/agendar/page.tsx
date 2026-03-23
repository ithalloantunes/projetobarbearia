"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toDateKey } from "@/lib/time";
import LogoutButton from "@/components/logout-button";

type Service = {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  price: number | string;
  durationMinutes: number;
};

type Barber = {
  id: number | "any";
  name: string;
  level?: string;
  image?: string;
};

type UserRole = "CLIENT" | "BARBER" | "ADMIN";

const DEFAULT_ADMIN_CLIENT_EMAIL =
  process.env.NEXT_PUBLIC_DEMO_CLIENT_EMAIL ?? "cliente@barbersaas.com";

const fallbackServices: Service[] = [
  {
    id: 1,
    name: "Corte de Cabelo",
    description: "Corte degradê, tesoura ou máquina",
    price: 65,
    durationMinutes: 45
  },
  {
    id: 2,
    name: "Barba Terapia",
    description: "Toalha quente e massagem facial",
    price: 45,
    durationMinutes: 30
  },
  {
    id: 3,
    name: "Combo Premium",
    description: "Cabelo + Barba + Sobrancelha",
    price: 100,
    durationMinutes: 90
  },
  {
    id: 4,
    name: "Sobrancelha",
    description: "Design com navalha ou pinça",
    price: 20,
    durationMinutes: 15
  }
];

const fallbackBarbers: Barber[] = [
  {
    id: 1,
    name: "Marcus",
    level: "Senior",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCLd_-qroSiPmiRvaCn8b-_VG_Lem3c_FlTYa2nqB1o6kkCAK_UU70OXYX3x5CffnpN-_lve8dQzR_yl43uZy1q_7GmpPLxUzjM_jA1t2ome6RFaeaDIjxect9GZsN-RD0liBp2nnlrkwVILIcgsy9JDtTzLWOBbNDZYmUG_5xf2nqcO7cAt1BRrGHNzNbVJ09g2I5PAsfgZ3NJYag8lb0brZU7bFh1wGbVgJPO0ccE2ZOwXVwf7UsexdOyAwYydjcVh--E5QQGT_uj"
  },
  {
    id: 2,
    name: "André",
    level: "Master",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBY2etbIODG_ASNjhf5N_ZuBhRHGPdafuDGuhf7wWrV6nDG5eHSMiTVyk1fxgSTtmWjG4dp-AGPbfdqpsfX2JGqITXqCv4vCVDHDFt5Vbj19TkHqrzvY0AD5DQ4-AEygoEzPWAkJgJ0eXKRxPkWcSQy7ruXAkzIa-Rfg57ETO7PFyDz-JV2J_KVlLVGorDuROdhzNU2apSO1-DePHyDxYnV4m0wnlX8jcpspnRniw2n3qR530TyzUye0zrNo197lCtSMx9FsUA-POpn"
  },
  {
    id: 3,
    name: "Ricardo",
    level: "Junior",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBkRjP6uSMoGUaFF1FFcw8I1uGfkMKX-RRMXqVY1tmGHHCGJpQ8Q1JyBXA4YQhheBXji2sCVkPOmguCy8QC5gdga5wivycE8UgB4HhzCYfG1VfEGjPThDctYystYTFzm0-abn1Pie-q03sprUVp-FXQqJ8IO3OYWtRCLEHEFWtIl0MR19Opl65uUZWKPAl7Zhe9fqs6RL17hmFYruhsz_68yEQriRx9nTb_WyjPR37JBnWdOQIsmU1nNfgtXIVHO-wgC9tv4IDkLG4u"
  },
  {
    id: "any",
    name: "Qualquer um",
    level: "Disponível"
  }
];

const fallbackTimes = ["09:00", "10:00", "11:00", "13:30", "14:00", "15:30", "16:45", "18:00"];

function formatPrice(value: number | string) {
  const numeric = typeof value === "string" ? Number(value) : value;
  return numeric.toFixed(2).replace(".", ",");
}

function formatDateLabel(date: Date) {
  const formatted = date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "short"
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1).replace(".", "");
}

export default function AgendarPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole>("CLIENT");
  const [services, setServices] = useState<Service[]>(fallbackServices);
  const [barbers, setBarbers] = useState<Barber[]>(fallbackBarbers);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(fallbackServices[0].id);
  const [selectedBarberId, setSelectedBarberId] = useState<Barber["id"]>(fallbackBarbers[0].id);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [availableTimes, setAvailableTimes] = useState<string[]>(fallbackTimes);
  const [selectedTime, setSelectedTime] = useState(fallbackTimes[2]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }, (_, index) => {
      const next = new Date(today);
      next.setDate(today.getDate() + index);
      return next;
    });
  }, []);

  const selectedDate = dates[selectedDateIndex];
  const selectedService = services.find((service) => service.id === selectedServiceId) || services[0];
  const selectedBarber = barbers.find((barber) => barber.id === selectedBarberId) || barbers[0];
  const effectiveBarber = selectedBarber.id === "any" ? barbers.find((barber) => barber.id !== "any") : selectedBarber;

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const [servicesRes, barbersRes, sessionRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/barbers"),
          fetch("/api/auth/session")
        ]);

        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          const role = sessionData?.user?.role;
          if (mounted && (role === "CLIENT" || role === "BARBER" || role === "ADMIN")) {
            setUserRole(role);
          }
        }

        if (servicesRes.ok) {
          const data = await servicesRes.json();
          if (mounted && data.services?.length) {
            setServices(data.services);
            setSelectedServiceId(data.services[0].id);
          }
        }
        if (barbersRes.ok) {
          const data = await barbersRes.json();
          if (mounted && data.barbers?.length) {
            const mapped = data.barbers.map((barber: { id: number; name: string; specialty?: string | null; photoUrl?: string | null }) => ({
              id: barber.id,
              name: barber.name,
              level: barber.specialty || "Barber",
              image: barber.photoUrl || undefined
            }));
            setBarbers([...mapped, { id: "any", name: "Qualquer um", level: "Disponível" }]);
            setSelectedBarberId(mapped[0].id);
          }
        }
      } catch (err) {
        console.warn("Falha ao carregar dados, usando fallback.", err);
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const loadAvailability = async () => {
      if (!selectedService || !effectiveBarber || typeof effectiveBarber.id !== "number") {
        return;
      }
      const date = toDateKey(selectedDate);
      try {
        const response = await fetch(
          `/api/availability?barberId=${effectiveBarber.id}&serviceId=${selectedService.id}&date=${date}`
        );
        if (!response.ok) {
          throw new Error("Disponibilidade indisponível");
        }
        const data = await response.json();
        if (Array.isArray(data.slots)) {
          setAvailableTimes(data.slots.length ? data.slots : []);
          setSelectedTime(data.slots[0] || "");
        }
      } catch (err) {
        console.warn("Falha ao carregar disponibilidade", err);
        setAvailableTimes(fallbackTimes);
        setSelectedTime(fallbackTimes[0]);
      }
    };

    loadAvailability();
  }, [selectedService, effectiveBarber, selectedDate]);

  const progress = useMemo(() => {
    let complete = 0;
    if (selectedService) complete += 1;
    if (selectedBarber) complete += 1;
    if (selectedDate) complete += 1;
    if (selectedTime) complete += 1;
    return {
      step: Math.min(complete, 4),
      percent: Math.round((complete / 4) * 100)
    };
  }, [selectedService, selectedBarber, selectedDate, selectedTime]);

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);

    if (!selectedService || !effectiveBarber || typeof effectiveBarber.id !== "number" || !selectedTime) {
      setError("Selecione serviço, barbeiro, data e horário.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          barberId: effectiveBarber.id,
          serviceId: selectedService.id,
          date: toDateKey(selectedDate),
          time: selectedTime,
          ...(userRole === "ADMIN" ? { clientEmail: DEFAULT_ADMIN_CLIENT_EMAIL } : {})
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar agendamento");
      }

      setMessage("Agendamento confirmado! Você receberá a confirmação por e-mail e WhatsApp.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const monthLabel = dates[0].toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-primary/10 px-4 md:px-10 py-4 sticky top-0 bg-background-light dark:bg-background-dark z-50">
          <div className="flex items-center gap-4">
            <div className="size-8 text-primary">
              <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z"></path>
              </svg>
            </div>
            <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-tight">
              Barbearia Premium
            </h2>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center justify-center rounded-xl h-10 w-10 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-primary transition-colors hover:bg-primary/20">
              <span className="material-symbols-outlined">calendar_month</span>
            </button>
            <LogoutButton className="rounded-xl bg-slate-100 dark:bg-white/5 px-4 h-10 text-sm font-bold text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors" />
          </div>
        </header>

        <main className="flex flex-1 justify-center py-6 md:py-10 px-4">
          <div className="max-w-[800px] flex-1 flex flex-col gap-8">
            <div className="flex flex-col gap-4 bg-slate-100 dark:bg-white/5 p-6 rounded-xl border border-slate-200 dark:border-primary/10">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-primary text-xs font-bold uppercase tracking-[0.2em]">
                    Passo {progress.step} de 4
                  </p>
                  <h3 className="text-slate-900 dark:text-slate-100 text-lg font-semibold">Seleção de Serviço</h3>
                </div>
                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  {progress.percent}% Completo
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full transition-all duration-700" style={{ width: `${progress.percent}%` }}></div>
              </div>
            </div>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-slate-900 dark:text-slate-100 text-2xl font-bold tracking-tight">
                  Escolha os serviços
                </h2>
                <span className="text-primary text-sm font-medium flex items-center gap-1 cursor-pointer hover:underline">
                  Ver detalhes <span className="material-symbols-outlined text-sm">info</span>
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => {
                  const selected = selectedService?.id === service.id;
                  const imageUrl =
                    service.imageUrl ||
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuCMQXoMJpEXYe-09-PViitmOc4UC0tIF920NNirOrT8fC2rOHsxAKU34Qm5U9REuWVqDTuTlEy6z6t01j4loZjshdCO34DRo8USrCz7jX0kYHGa6ACwP3Aw9GGgU96lHlxT4ZM2bOHcIPb8BlRVEiWFRWXdKhIl6N-y1utedqPZo4-UCqbPmUQm_MNsJFkB3o1fkNKsvTN9iiI6W8Folo7Mi5p-bSvxw_WxYisbEP05pvzQQ0TIGbPnfAGoUk1I8y8FmVyJFGX-gd7D";
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setSelectedServiceId(service.id)}
                      className={
                        selected
                          ? "group relative flex flex-col gap-4 p-4 rounded-xl border-2 border-primary bg-primary/5 cursor-pointer shadow-lg shadow-primary/5 text-left"
                          : "group relative flex flex-col gap-4 p-4 rounded-xl border border-slate-200 dark:border-primary/10 bg-white dark:bg-white/[0.03] hover:border-primary/40 hover:bg-white/[0.05] transition-all cursor-pointer text-left"
                      }
                    >
                      <div
                        className={
                          selected
                            ? "w-full h-40 bg-center bg-no-repeat bg-cover rounded-lg"
                            : "w-full h-40 bg-center bg-no-repeat bg-cover rounded-lg opacity-60 group-hover:opacity-100 transition-all"
                        }
                        style={{
                          backgroundImage: `url('${imageUrl}')`
                        }}
                      ></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-slate-900 dark:text-slate-100 text-lg font-bold">{service.name}</h4>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">{service.description}</p>
                        </div>
                        <div
                          className={
                            selected
                              ? "bg-primary text-background-dark px-2 py-1 rounded-md text-xs font-bold"
                              : "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md text-xs font-bold"
                          }
                        >
                          R$ {formatPrice(service.price)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {service.durationMinutes} min
                      </div>
                      {selected ? (
                        <div className="absolute top-2 right-2 bg-primary text-background-dark rounded-full p-1 shadow-md">
                          <span className="material-symbols-outlined text-sm leading-none font-bold">check</span>
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-slate-900 dark:text-slate-100 text-2xl font-bold tracking-tight mb-6">
                Escolha o Profissional
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar">
                {barbers.map((barber) => {
                  const selected = selectedBarber?.id === barber.id;
                  return (
                    <button
                      key={String(barber.id)}
                      type="button"
                      onClick={() => setSelectedBarberId(barber.id)}
                      className={
                        selected
                          ? "flex flex-col items-center gap-3 min-w-[140px] snap-center p-4 rounded-xl bg-primary/5 border-2 border-primary shadow-lg shadow-primary/5"
                          : "flex flex-col items-center gap-3 min-w-[140px] snap-center p-4 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-primary/10 hover:border-primary/40 transition-all cursor-pointer"
                      }
                    >
                      {barber.image ? (
                        <div className={selected ? "size-20 rounded-full border-2 border-primary p-1" : "size-20 rounded-full p-1 opacity-80"}>
                          <div
                            className="w-full h-full rounded-full bg-cover bg-center"
                            style={{ backgroundImage: `url('${barber.image}')` }}
                          ></div>
                        </div>
                      ) : (
                        <div className="size-20 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-3xl text-slate-500">group</span>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-slate-900 dark:text-slate-100 font-bold">{barber.name}</p>
                        <p
                          className={
                            selected
                              ? "text-primary text-xs font-bold uppercase tracking-wider"
                              : "text-slate-500 text-xs font-medium uppercase"
                          }
                        >
                          {barber.level}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-slate-900 dark:text-slate-100 text-2xl font-bold tracking-tight mb-6">
                Data e Horário
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4 bg-white dark:bg-white/[0.02] p-6 rounded-xl border border-slate-200 dark:border-primary/10">
                <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-primary/10 pb-6 md:pb-0 md:pr-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{monthLabel}</h4>
                    <div className="flex gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" type="button">
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" type="button">
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-tighter">
                    <div>Dom</div>
                    <div>Seg</div>
                    <div>Ter</div>
                    <div>Qua</div>
                    <div>Qui</div>
                    <div>Sex</div>
                    <div>Sab</div>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {dates.map((day, index) => {
                      const isSelected = selectedDateIndex === index;
                      return (
                        <button
                          key={day.toISOString()}
                          type="button"
                          onClick={() => setSelectedDateIndex(index)}
                          className={
                            isSelected
                              ? "py-2.5 bg-primary text-background-dark font-bold rounded-lg cursor-pointer text-sm shadow-md shadow-primary/20"
                              : "py-2.5 hover:bg-primary/10 rounded-lg cursor-pointer text-sm"
                          }
                        >
                          {day.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="md:col-span-3 md:pl-6">
                  <h4 className="font-bold mb-4 text-slate-900 dark:text-slate-100">Horários disponíveis</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {availableTimes.length ? (
                      availableTimes.map((time) => {
                        const isSelected = selectedTime === time;
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            className={
                              isSelected
                                ? "py-2 text-sm rounded-lg bg-primary text-background-dark font-bold shadow-md shadow-primary/20"
                                : "py-2 text-sm rounded-lg border border-slate-200 dark:border-primary/10 hover:border-primary/40 hover:bg-primary/5 transition-all"
                            }
                          >
                            {time}
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">Sem horários disponíveis.</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-slate-100 dark:bg-white/[0.04] rounded-xl border border-slate-200 dark:border-primary/10">
              <div className="flex flex-col">
                <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                  Resumo da Seleção
                </span>
                <p className="text-slate-900 dark:text-slate-100 font-bold text-lg">
                  {selectedService?.name} com {effectiveBarber?.name}
                </p>
                <p className="text-primary font-medium text-sm">
                  {formatDateLabel(selectedDate)} às {selectedTime} • R$ {formatPrice(selectedService?.price || 0)}
                </p>
                {message ? <p className="text-emerald-500 text-sm mt-2">{message}</p> : null}
                {error ? <p className="text-red-500 text-sm mt-2">{error}</p> : null}
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-slate-100 font-bold hover:bg-slate-300 dark:hover:bg-white/20 transition-colors"
                  type="button"
                  onClick={() => router.push("/")}
                >
                  Voltar
                </button>
                <button
                  className="flex-1 md:flex-none px-10 py-3 rounded-xl bg-primary text-background-dark font-bold hover:shadow-[0_0_25px_rgba(197,159,89,0.3)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !selectedTime}
                >
                  {isSubmitting ? "Confirmando..." : "Próximo Passo"}
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-auto px-4 md:px-10 py-10 border-t border-slate-200 dark:border-primary/10 bg-slate-50 dark:bg-background-dark/80">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-primary font-bold mb-4 uppercase text-xs tracking-widest">Localização</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Av. Central, 1234 - Centro</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">São Paulo - SP</p>
            </div>
            <div>
              <h3 className="text-primary font-bold mb-4 uppercase text-xs tracking-widest">Funcionamento</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Seg - Sex: 09h às 20h</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Sáb: 08h às 18h</p>
            </div>
            <div>
              <h3 className="text-primary font-bold mb-4 uppercase text-xs tracking-widest">Redes Sociais</h3>
              <div className="flex gap-4">
                <a className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" href="#">
                  <span className="material-symbols-outlined">brand_awareness</span>
                </a>
                <a className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" href="#">
                  <span className="material-symbols-outlined">share</span>
                </a>
                <a className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" href="#">
                  <span className="material-symbols-outlined">chat</span>
                </a>
              </div>
            </div>
          </div>
          <div className="text-center mt-12 text-slate-500 dark:text-slate-500 text-[10px] uppercase tracking-widest opacity-60">
            © 2024 Barbearia Premium. Todos os direitos reservados.
          </div>
        </footer>
      </div>
    </div>
  );
}
