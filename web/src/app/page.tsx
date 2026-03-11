import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">
              content_cut
            </span>
            <h2 className="text-xl font-bold tracking-tight">BarberSaaS</h2>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a
              className="text-sm font-medium hover:text-primary transition-colors"
              href="#servicos"
            >
              Serviços
            </a>
            <a
              className="text-sm font-medium hover:text-primary transition-colors"
              href="#barbeiros"
            >
              Barbeiros
            </a>
            <a
              className="text-sm font-medium hover:text-primary transition-colors"
              href="#depoimentos"
            >
              Depoimentos
            </a>
            <a
              className="text-sm font-medium hover:text-primary transition-colors"
              href="#localizacao"
            >
              Localização
            </a>
          </nav>
          <Link
            className="bg-primary text-background-dark px-5 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-all"
            href="/agendar"
          >
            Agendar Agora
          </Link>
        </div>
      </header>

      <main className="flex-grow">
        <section className="relative px-6 py-16 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div
              className="relative overflow-hidden rounded-xl bg-slate-900 aspect-[16/9] md:aspect-[21/9] flex flex-col items-center justify-center text-center p-8 border border-primary/10 bg-cover bg-center"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(26, 24, 20, 0.8), rgba(26, 24, 20, 0.8)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuAQr7Tor0pG4DNvsuHBVuXQLVj6s_seqvQHE7PcvLq5s6s24sScAbVsUqggro2l5TzYlBcXN_Q1D8NlyU4pnnOpkFGmDVeBBZCH-OqVgoB_OVHIlXNZfKg-nmiTlKJ6CqOPG0UEWr51S_LUehuiYQUH97Al5Ur5_GapXhC5c0ResW9wXqK1JDFJo8BGT3WQ1MLLUcaddqW7Lf86wnaloh6Da-uXSVzuqPGJFfUUn7V0FhPxzkUOsfsQh5lZcPBc0e8c1IXM7_tjApHH')"
              }}
            >
              <div className="max-w-3xl space-y-6">
                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
                  Elevando sua imagem com <span className="text-primary">precisão</span>
                </h1>
                <p className="text-lg text-slate-300 max-w-xl mx-auto">
                  Onde a tradição encontra o estilo moderno. Reserve seu horário na
                  barbearia mais premium da cidade e transforme seu visual.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    className="bg-primary text-background-dark px-8 py-4 rounded-lg text-lg font-bold hover:scale-105 transition-transform"
                    href="/agendar"
                  >
                    Agendar Agora
                  </Link>
                  <a
                    className="border border-primary text-primary px-8 py-4 rounded-lg text-lg font-bold hover:bg-primary/10 transition-colors"
                    href="#barbeiros"
                  >
                    Ver Portfólio
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-20 bg-primary/5" id="servicos">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Nossos Serviços</h2>
              <div className="h-1 w-20 bg-primary mt-2"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-background-light dark:bg-[#25221b] border border-primary/20 p-8 rounded-xl hover:border-primary transition-colors group">
                <span className="material-symbols-outlined text-4xl text-primary mb-4 block group-hover:scale-110 transition-transform">
                  content_cut
                </span>
                <h3 className="text-xl font-bold mb-2">Cabelo</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                  Corte moderno, clássico ou degradê com acabamento impecável.
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-primary/10">
                  <span className="text-primary font-bold">R$ 60</span>
                  <span className="text-xs opacity-60">45 min</span>
                </div>
              </div>
              <div className="bg-background-light dark:bg-[#25221b] border border-primary/20 p-8 rounded-xl hover:border-primary transition-colors group">
                <span className="material-symbols-outlined text-4xl text-primary mb-4 block group-hover:scale-110 transition-transform">
                  face
                </span>
                <h3 className="text-xl font-bold mb-2">Barba</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                  Modelagem completa com toalha quente e produtos premium.
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-primary/10">
                  <span className="text-primary font-bold">R$ 45</span>
                  <span className="text-xs opacity-60">30 min</span>
                </div>
              </div>
              <div className="bg-background-light dark:bg-[#25221b] border border-primary/20 p-8 rounded-xl hover:border-primary transition-colors group">
                <span className="material-symbols-outlined text-4xl text-primary mb-4 block group-hover:scale-110 transition-transform">
                  architecture
                </span>
                <h3 className="text-xl font-bold mb-2">Sobrancelha</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                  Limpeza e alinhamento para valorizar seu olhar.
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-primary/10">
                  <span className="text-primary font-bold">R$ 25</span>
                  <span className="text-xs opacity-60">15 min</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-20" id="barbeiros">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight">Nossos Barbeiros</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                Mestres na arte da tesoura e navalha
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-4 text-center group">
                <div className="aspect-square rounded-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all border-2 border-transparent group-hover:border-primary">
                  <img
                    className="w-full h-full object-cover"
                    alt="Retrato de um barbeiro profissional sorridente"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAREegdVaXsBUUQmoQDvTxd9KXaJAT07fJYl8i19O2v1RZ0jUtYcO_6DlxvwjuTNfgCnol7KdBOESlHBmqIHafNGg1mzbXkC5bNMRAD_sFhLk07jae67AuxGUBbjy18a8eiPA_Y3vuOA_QaQLDhFE8ZBDMV1GxlIpU-_KZbv32-jNmLQyl-jPwvXS0pDpQa8X4V2cValWyYzPUXCsh9mdfed1NnBb8WFBhgMnwflJDv1w-3tElW8ZTqfrwe6s61j0-UvlRR_5DJgIE6"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Ricardo Silva</h4>
                  <p className="text-sm text-primary">Master Barber</p>
                </div>
              </div>
              <div className="space-y-4 text-center group">
                <div className="aspect-square rounded-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all border-2 border-transparent group-hover:border-primary">
                  <img
                    className="w-full h-full object-cover"
                    alt="Barbeiro especialista em barbas com visual moderno"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2TRsZAJVBGwwgMH7l7GNYm5V2pm_x-INuF0K-MUFwJGPKl23yU3igonxYr--OWRTydh35btSzXmumKltqKpOeH8nlQWmFc4-WyabY9IkjKj76N5JMpYMMJvgh1MKKVItbO0xL2zmL_d34Ro6zQRNicphJXYhjhFVPp88SnOTY53rav5L92XqdFy6werwTup8RBCQnIyg8Zy-5GUd8BvM1J9yuxDx_mDH44xKhWir33s19G1Km7xQXIjZe4o13711kUnjzzG6yLNP8"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Bruno Santos</h4>
                  <p className="text-sm text-primary">Especialista em Barba</p>
                </div>
              </div>
              <div className="space-y-4 text-center group">
                <div className="aspect-square rounded-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all border-2 border-transparent group-hover:border-primary">
                  <img
                    className="w-full h-full object-cover"
                    alt="Barbeiro jovem especialista em cortes degradê"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDorueTl6dH1IvBf0PRyesRFr-4mMUt_xLYBBYk3T8O9BowxOJvtrAszXEF-HftOXVZ7qLhcMFMxrOklw0Y_xxUUYGTSH4YcVTy-OWt8904gR6X6JvnUTsKUnF_bHLZ5mypBQaljX3oLg0T7T1txFdASA4dwQCLvD2PvFm-aCV1nSWTudkWGpF3p4QZs-4vasExAfU_-5k7x3FKQumojMt3XiUVVi5xH9gHyLH07YxZZ85OAnph35LW_skbjbsZrAU_xuTDL_u_Rgpb"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Lucas Mendes</h4>
                  <p className="text-sm text-primary">Cortes Modernos</p>
                </div>
              </div>
              <div className="space-y-4 text-center group">
                <div className="aspect-square rounded-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all border-2 border-transparent group-hover:border-primary">
                  <img
                    className="w-full h-full object-cover"
                    alt="Barbeiro veterano com experiência em cortes clássicos"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsAIU_owK3kSBOfz7pT83bmvhuU4JS0xmtaO8iPlT2Icesvf343yAOHKOHfb8PVuAy6BEtwrDmZsm7oQh_AuZxT3u7gnb0-RY_1P1FjNxJOJgwd8m-dJ2L3JkmPVJC3vV2-NqenbiynTOrW2RpWCXNhzrqnJdLzmbUVt1_LEakgoHLzMeNkXAW1CLtsOEh61Ex-r6eOj4djVWa4Cj92vCNku9hmTV1hQRmmezjNJIg7twfdoO3_XZ1hWKdkretvQgKvAPPEh7kRv6F"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-lg">André Costa</h4>
                  <p className="text-sm text-primary">Clássicos &amp; Visagismo</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-20 bg-primary/5" id="depoimentos">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12">
              <h2 className="text-3xl font-bold tracking-tight">
                O que dizem nossos clientes
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-background-light dark:bg-[#25221b] p-8 rounded-xl border border-primary/10 italic relative">
                <span className="material-symbols-outlined text-primary/20 text-6xl absolute top-4 right-4">
                  format_quote
                </span>
                <p className="text-lg relative z-10">
                  "Melhor experiência de barbearia que já tive. O atendimento é
                  impecável e o ambiente é muito sofisticado. O Ricardo realmente
                  entende de visagismo."
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">
                      person
                    </span>
                  </div>
                  <div>
                    <p className="font-bold">Marcos Oliveira</p>
                    <p className="text-xs opacity-60 text-primary">
                      Cliente há 2 anos
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-background-light dark:bg-[#25221b] p-8 rounded-xl border border-primary/10 italic relative">
                <span className="material-symbols-outlined text-primary/20 text-6xl absolute top-4 right-4">
                  format_quote
                </span>
                <p className="text-lg relative z-10">
                  "Agendar pelo site é extremamente fácil. O serviço de toalha
                  quente na barba é relaxante demais. Recomendo para quem busca
                  qualidade de verdade."
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">
                      person
                    </span>
                  </div>
                  <div>
                    <p className="font-bold">Felipe Souza</p>
                    <p className="text-xs opacity-60 text-primary">Cliente Mensal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-20" id="localizacao">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Onde estamos</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
                    Localizados no coração do bairro Jardins, oferecemos um
                    ambiente exclusivo com estacionamento privativo e lounge de
                    espera com bar completo.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary">
                      location_on
                    </span>
                    <div>
                      <p className="font-bold">Endereço</p>
                      <p className="text-sm opacity-70">
                        Av. Paulista, 1000 - Bela Vista, São Paulo - SP
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary">
                      schedule
                    </span>
                    <div>
                      <p className="font-bold">Horário de Funcionamento</p>
                      <p className="text-sm opacity-70">
                        Segunda a Sábado: 09h às 21h
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary">
                      call
                    </span>
                    <div>
                      <p className="font-bold">Contato</p>
                      <p className="text-sm opacity-70">
                        (11) 99999-9999 / contato@barbersaas.com
                      </p>
                    </div>
                  </div>
                </div>
                <button className="w-full sm:w-auto bg-primary text-background-dark px-8 py-3 rounded-lg font-bold hover:brightness-110">
                  Como Chegar
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden h-96 border border-primary/20">
                <div
                  className="w-full h-full bg-slate-800 flex items-center justify-center relative bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBvAMpECEJvM0X14IeC0GUcH89ru-dPN5Pt5iI-Z9Fg0vIwCvthL_XbTTn4VQlXCQP33hPMx_KWvkUbqotAPNe3lQwEBOOZnXfAiQYzbGH16x66Jsrx5Yi2PSv4oK5wRqX1vV2-cQlSOkXhv-dLFQlbeGxIE_3qfW1L9GEspsc4sLOgi4Pr6o7D4Xwg87eZ5Gy0sg_yZxKu9dhlw9sK-6iKhUcHaISjfJwr-HVRmIAf_QYHjTNUDtTLTQsUkha6AjvjMcc1Mu3LRpat')"
                  }}
                >
                  <div className="absolute inset-0 bg-primary/10"></div>
                  <span className="material-symbols-outlined text-primary text-5xl">
                    location_on
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#11100d] text-slate-400 py-12 px-6 border-t border-primary/10">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 text-white">
            <span className="material-symbols-outlined text-primary">content_cut</span>
            <span className="text-xl font-bold">BarberSaaS</span>
          </div>
          <div className="flex gap-6 text-sm">
            <a className="hover:text-primary" href="#">
              Privacidade
            </a>
            <a className="hover:text-primary" href="#">
              Termos
            </a>
            <a className="hover:text-primary" href="#">
              FAQ
            </a>
          </div>
          <div className="flex gap-4">
            <a
              className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center hover:border-primary hover:text-primary transition-all"
              href="#"
            >
              <span className="material-symbols-outlined text-lg">public</span>
            </a>
            <a
              className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center hover:border-primary hover:text-primary transition-all"
              href="#"
            >
              <span className="material-symbols-outlined text-lg">camera</span>
            </a>
          </div>
        </div>
        <div className="mx-auto max-w-7xl mt-8 pt-8 border-t border-slate-800 text-center text-xs opacity-50">
          <p>© 2024 BarberSaaS. Todos os direitos reservados. Design para profissionais exigentes.</p>
        </div>
      </footer>
    </div>
  );
}
