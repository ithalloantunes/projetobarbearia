import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <aside className="w-64 border-r border-primary/20 bg-background-light dark:bg-background-dark flex flex-col hidden lg:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary size-10 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-background-dark font-bold">content_cut</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-none">BarberSaaS</h1>
            <p className="text-primary text-xs font-medium tracking-wider">PREMIUM ADMIN</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          <a className="flex items-center gap-3 px-3 py-2 rounded-xl bg-primary/10 text-primary" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm font-medium">Dashboard</span>
          </a>
          <a
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined">group</span>
            <span className="text-sm font-medium">Equipe</span>
          </a>
          <a
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined">content_cut</span>
            <span className="text-sm font-medium">Serviços</span>
          </a>
          <a
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined">bar_chart</span>
            <span className="text-sm font-medium">Relatórios</span>
          </a>
          <div className="pt-4 pb-2 px-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configurações</p>
          </div>
          <a
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Ajustes</span>
          </a>
        </nav>
        <div className="p-4 border-t border-primary/10">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-primary/5">
            <div
              className="size-10 rounded-full bg-cover bg-center border border-primary/20"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDvacpDiyTasbVF2ntxGL0YRPPdrZBURq4Hr57XjBzeEtCA-NFwqlDtLEJG1kJxmauRmsO2GatGQak_CzBaA0cNSD5ArihOSmlDsi0Q5MhwcJVMdIKA-YyueYRvY3o0FFf456vt0MzPo--OjsUCRajD5T2NeL117ktXnkPmxpUByJXDKbXO7LlOHf3qwli5bhMMuYnUlDX-TI73i6tq8uIK_4IctSxf2CPXkai0Fz6IWD_zJJAaAtcaNZVfCMse7rVtg9Gk3qxErO8Q')"
              }}
            ></div>
            <div className="flex flex-col overflow-hidden">
              <p className="text-sm font-semibold truncate">Ricardo Silva</p>
              <p className="text-xs text-slate-500 truncate">Proprietário</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-primary/10 px-8 flex items-center justify-between sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10">
          <h2 className="text-xl font-bold">Resumo Geral</h2>
          <div className="flex items-center gap-4">
            <div className="relative max-w-xs hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
              <input
                className="w-full bg-slate-100 dark:bg-primary/5 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary"
                placeholder="Buscar cliente..."
                type="text"
              />
            </div>
            <button className="relative p-2 rounded-full hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            <div className="h-8 w-[1px] bg-primary/20 mx-2"></div>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-background-dark font-bold text-sm rounded-xl hover:brightness-110 transition-all">
              <span className="material-symbols-outlined text-sm">add</span>
              Novo Agendamento
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-primary/5 border border-primary/10 p-6 rounded-xl hover:shadow-lg transition-shadow group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined text-primary group-hover:text-background-dark">payments</span>
                </div>
                <span className="text-emerald-500/80 text-sm font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">trending_up</span> +12.5%
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Faturamento Mensal</p>
              <h3 className="text-3xl font-bold mt-1">R$ 12.500,00</h3>
            </div>
            <div className="bg-white dark:bg-primary/5 border border-primary/10 p-6 rounded-xl hover:shadow-lg transition-shadow group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined text-primary group-hover:text-background-dark">person_add</span>
                </div>
                <span className="text-emerald-500/80 text-sm font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">trending_up</span> +5.2%
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Novos Clientes</p>
              <h3 className="text-3xl font-bold mt-1">48</h3>
            </div>
            <div className="bg-white dark:bg-primary/5 border border-primary/10 p-6 rounded-xl hover:shadow-lg transition-shadow group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined text-primary group-hover:text-background-dark">calendar_today</span>
                </div>
                <span className="text-primary text-sm font-bold">Hoje</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Agendamentos Hoje</p>
              <h3 className="text-3xl font-bold mt-1">14</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-primary/5 border border-primary/10 rounded-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-lg font-bold">Desempenho de Receita</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Evolução do faturamento nos últimos 6 meses
                </p>
              </div>
              <select className="bg-slate-100 dark:bg-primary/10 border-none rounded-xl text-sm font-medium px-4 py-2 focus:ring-1 focus:ring-primary">
                <option>Últimos 6 meses</option>
                <option>Este ano</option>
              </select>
            </div>
            <div className="relative h-64 w-full flex flex-col justify-end gap-4 py-4">
              <svg className="h-48 w-full" fill="none" preserveAspectRatio="none" viewBox="0 0 500 150" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M0 130 Q 50 120, 100 110 T 200 80 T 300 100 T 400 40 T 500 20"
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeLinecap="round"
                  strokeWidth="4"
                ></path>
                <path
                  d="M0 130 Q 50 120, 100 110 T 200 80 T 300 100 T 400 40 T 500 20 V 150 H 0 Z"
                  fill="url(#areaGradient)"
                  opacity="0.1"
                ></path>
                <defs>
                  <linearGradient id="lineGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#c59f59" stopOpacity="0.5"></stop>
                    <stop offset="100%" stopColor="#c59f59"></stop>
                  </linearGradient>
                  <linearGradient id="areaGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#c59f59"></stop>
                    <stop offset="100%" stopColor="#c59f59" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex justify-between px-2">
                <span className="text-[10px] font-bold text-slate-400">JAN</span>
                <span className="text-[10px] font-bold text-slate-400">FEV</span>
                <span className="text-[10px] font-bold text-slate-400">MAR</span>
                <span className="text-[10px] font-bold text-slate-400">ABR</span>
                <span className="text-[10px] font-bold text-slate-400">MAI</span>
                <span className="text-[10px] font-bold text-slate-400 text-primary">JUN</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-primary/5 border border-primary/10 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-primary/10 flex items-center justify-between">
              <h4 className="text-lg font-bold">Próximos Atendimentos</h4>
              <Link className="text-sm font-bold text-primary hover:underline" href="#">
                Ver todos
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-primary/10">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Barbeiro</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Horário</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  <tr className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-slate-200 dark:bg-primary/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-xs">person</span>
                        </div>
                        <span className="text-sm font-medium">Gustavo Oliveira</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">Cadu "The Scissors"</td>
                    <td className="px-6 py-4 text-sm font-semibold">14:30</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600/80 border border-amber-600/20 uppercase tracking-wide">
                        Pendente
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-primary">
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-slate-200 dark:bg-primary/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-xs">person</span>
                        </div>
                        <span className="text-sm font-medium">Marcos Henrique</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">Junior Barber</td>
                    <td className="px-6 py-4 text-sm font-semibold">15:15</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600/80 border border-emerald-600/20 uppercase tracking-wide">
                        Confirmado
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-primary">
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-slate-200 dark:bg-primary/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-xs">person</span>
                        </div>
                        <span className="text-sm font-medium">Thiago Santos</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">Cadu "The Scissors"</td>
                    <td className="px-6 py-4 text-sm font-semibold">16:00</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600/80 border border-blue-600/20 uppercase tracking-wide">
                        Em espera
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-primary">
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-slate-200 dark:bg-primary/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-xs">person</span>
                        </div>
                        <span className="text-sm font-medium">Rodrigo Faro</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">Matheus Sharp</td>
                    <td className="px-6 py-4 text-sm font-semibold">16:45</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600/80 border border-emerald-600/20 uppercase tracking-wide">
                        Confirmado
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-primary">
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
