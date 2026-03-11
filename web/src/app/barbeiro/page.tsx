export default function BarbeiroPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <header className="flex items-center justify-between py-6 border-b border-primary/20 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl">
              <span className="material-symbols-outlined text-background-dark font-bold">content_cut</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Barber Agenda</h1>
              <p className="text-xs text-slate-500 dark:text-primary/70 font-medium">Professional Dashboard</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center justify-center rounded-xl h-10 w-10 bg-primary/10 hover:bg-primary/20 text-primary transition-colors">
              <span className="material-symbols-outlined">calendar_month</span>
            </button>
            <button className="flex items-center justify-center rounded-xl h-10 w-10 bg-primary/10 hover:bg-primary/20 text-primary transition-colors">
              <span className="material-symbols-outlined">person</span>
            </button>
          </div>
        </header>

        <div className="mb-8">
          <div className="flex border-b border-slate-200 dark:border-primary/10 overflow-x-auto no-scrollbar">
            <button className="flex-1 min-w-[100px] py-4 border-b-2 border-primary text-primary font-bold text-sm">
              Hoje
            </button>
            <button className="flex-1 min-w-[100px] py-4 border-b-2 border-transparent text-slate-500 dark:text-slate-400 font-medium text-sm hover:text-primary transition-colors">
              Amanhã
            </button>
            <button className="flex-1 min-w-[100px] py-4 border-b-2 border-transparent text-slate-500 dark:text-slate-400 font-medium text-sm hover:text-primary transition-colors">
              Esta Semana
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">Agendamentos</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Quinta-feira, 24 de Outubro</p>
          </div>
          <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-background-dark font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/10">
            <span className="material-symbols-outlined text-xl">block</span>
            <span>Bloquear Horário</span>
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full border-2 border-primary/30 flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-background-dark">
                <img
                  alt="Client portrait of a young man"
                  className="h-full w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCs1a5mYJgtcK8iQSIawtxSkq5JFzcN10-FUwKJFL46_xJNHQMgyxvgpDWVHHTy033MdsgNfTXEKjWTf-HyhA4YplFwxDM8C2DLS0V8hU7KDrVYe96kTi0ky5ZfQ_IviHWSRoKTINZmChxatklw79t7VE43YV8lDF10Dvsx3Hn1Iy7BrHhB6N9kJBIaPgu0pQtWqrRzA-w_L4UpQwyJG2pxb-IsMo1FQLoKP_c3gAeyrgADytZnlE0kkUt5JtNnZ6CeIgdp2QrS9Ota"
                />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">Lucas Silva</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-primary">09:00 AM</span>
                  <span>•</span>
                  <span>Corte &amp; Barba</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-[10px] font-bold uppercase tracking-wider text-slate-400">Pendente</span>
              <label className="relative flex h-7 w-12 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-white/10 p-1 has-[:checked]:bg-primary transition-all">
                <input className="sr-only peer" type="checkbox" />
                <div className="h-5 w-5 rounded-full bg-white shadow-md transition-all peer-checked:translate-x-5"></div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white dark:bg-primary/10 border-l-4 border-primary border-y border-r border-slate-200 dark:border-primary/10 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full border-2 border-primary flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-background-dark">
                <img
                  alt="Client portrait of a bearded man"
                  className="h-full w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRzXhMY6-UbyyzLi2G_sppKLyqFmyfaFboPIJYe6-8pKi9LZIpJdTQ0SMwlDEsKTNs78DR1ENc0-AYXSSTq8IXeOHFOlHwYNe-AaqS0bBUgkTGCbMvF31JeXwQj3JK_CkjuYbUU4OtIXPPS8DgLtUN_mdzRy4ojjZTPJOw1Hq5GrDSog6qRoo-7enIb6ghBC6oXTx4Skvs38DcWtoJKui1s4U_tYOX-V5BalN3Oxh3RRlx6uu8CmuRgDewtu3aMsI78pa4dg2i_nOf"
                />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900 dark:text-slate-100 leading-none mb-1 text-primary">André Santos</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-primary">10:15 AM</span>
                  <span>•</span>
                  <span>Degradê Navalhado</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-[10px] font-bold uppercase tracking-wider text-primary">Em Atendimento</span>
              <label className="relative flex h-7 w-12 cursor-pointer items-center rounded-full border-none bg-primary p-1 transition-all">
                <input defaultChecked className="sr-only peer" type="checkbox" />
                <div className="h-5 w-5 rounded-full bg-white shadow-md transition-all translate-x-5"></div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-primary/5 opacity-60 border border-slate-200 dark:border-primary/10 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-background-dark grayscale">
                <img
                  alt="Client portrait of a smiling man"
                  className="h-full w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2xD9m1J_p0lOmzCliW9SxAEEuTgv7AVSG8JjmEyJfdbvmZXkLGjqtku14qx4Wjl3gh4_j-urIqxYTxBrkb2d5lXjliggr0YSuCfCkrD0maAG6D7uq3MXdHB27su5OKZr__lAOz_YB0MCOPpZ9XKhyMpSAvoM78RsUQweisgfaNMp64W8eonphsLBhEcBF_WGKMObsvrPbJQDl_12U0CCrdZltxbBhJacbZKRZDopkORjd1ZLZuzoAbD5OLZN6nXU3_9OsBs34ne_L"
                />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900 dark:text-slate-100 leading-none mb-1 line-through">
                  Marcos Oliver
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">08:00 AM</span>
                  <span>•</span>
                  <span>Barboterapia</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
              <span className="hidden sm:block text-[10px] font-bold uppercase tracking-wider text-slate-400">Concluído</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-200/50 dark:bg-red-900/5 border border-dashed border-slate-300 dark:border-red-900/20 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full border-2 border-slate-300 dark:border-red-900/20 flex items-center justify-center bg-slate-100 dark:bg-red-900/10">
                <span className="material-symbols-outlined text-slate-400 dark:text-red-500/70">lock</span>
              </div>
              <div>
                <p className="text-base font-bold text-slate-500 dark:text-red-400/70 leading-none mb-1 italic">Horário Bloqueado</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">11:30 AM</span>
                  <span>•</span>
                  <span>Intervalo Almoço</span>
                </div>
              </div>
            </div>
            <button className="text-xs font-bold text-slate-500 dark:text-slate-400 underline decoration-primary/50 underline-offset-4 hover:text-primary transition-colors">
              Desbloquear
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full border-2 border-primary/30 flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-background-dark">
                <img
                  alt="Client portrait of a young professional"
                  className="h-full w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCA2IiSahZqqO1-CvcGODl6_pMRDuimr6O41h3U_StiUlIzhmckrF-3yDHg0-0iKjbYDNKLC_bZWb6YdSQZUDvGGvbHNScm7Gf482w-R6a6eg7f7dTKK-cFgTcKBpqtkf4QGxCpPyeSJCRcr-IZ01AX-VxRaSwvSFurI8sVVipbOPId5AXgd0r5P2Q4CObh2dzvZtLtqOOfnHaBV3Ex67798kBukB6CP0NCCBh2pn2xp-bs6vHu9pag9BclmoMNlro-LraAVkZ93AnF"
                />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">Ricardo Lima</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-primary">01:00 PM</span>
                  <span>•</span>
                  <span>Corte Social</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-[10px] font-bold uppercase tracking-wider text-slate-400">Pendente</span>
              <label className="relative flex h-7 w-12 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-white/10 p-1 has-[:checked]:bg-primary transition-all">
                <input className="sr-only peer" type="checkbox" />
                <div className="h-5 w-5 rounded-full bg-white shadow-md transition-all peer-checked:translate-x-5"></div>
              </label>
            </div>
          </div>
        </div>

        <button className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-background-dark shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-105 transition-transform">
          <span className="material-symbols-outlined text-2xl font-bold">add</span>
        </button>

        <div className="mt-10 grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-primary/5 p-4 rounded-xl border border-slate-200 dark:border-primary/10 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-tight">Total</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">12</p>
          </div>
          <div className="bg-white dark:bg-primary/5 p-4 rounded-xl border border-slate-200 dark:border-primary/10 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-tight">Feitos</p>
            <p className="text-2xl font-bold text-green-500">5</p>
          </div>
          <div className="bg-white dark:bg-primary/5 p-4 rounded-xl border border-slate-200 dark:border-primary/10 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-tight">Restam</p>
            <p className="text-2xl font-bold text-primary">7</p>
          </div>
        </div>
      </div>
    </div>
  );
}
