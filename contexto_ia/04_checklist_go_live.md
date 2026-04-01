# Checklist de Go-Live Publico

Status: execucao em andamento com itens P0 e P1 ja iniciados.
Data de criacao: 2026-03-25
Ultima atualizacao: 2026-04-01

## 1. Gate tecnico obrigatorio

- [x] `npm run build` sem erros
- [x] `npx tsc --noEmit` sem erros
- [x] `npm run lint` funcional e sem erro bloqueante
- [x] `npm audit` sem risco alto nao tratado
- [x] scripts de validacao documentados no `README`

## 2. Banco e ambiente

- [x] `.env.example` coerente com `docker-compose` e docs
- [x] variaveis obrigatorias validadas no boot
- [x] migracoes versionadas aplicadas com sucesso (validado em ambiente local tipo homologacao via Docker)
- [x] backup automatico configurado
- [x] restore testado em ambiente de homologacao (ciclo backup -> mutacao -> restore validado; RTO observado: `3.51s` em 2026-03-31)

## 3. Seguranca e autenticacao

- [x] sem fallback de segredo inseguro
- [x] sem senha padrao no codigo/UI/seed
- [x] rate limit em rotas de auth
- [x] lockout/protecao anti brute force
- [x] fluxo de verificacao de email no cadastro
- [x] politica de senha formalizada nas rotas e telas de senha
- [x] revisao de sessao/cookies finalizada

## 4. Funcionalidade critica de negocio

- [x] agendamento cliente funcionando ponta a ponta (validado por fluxo autenticado em Playwright homolog local)
- [x] remarcacao/cancelamento com regras corretas (validado por fluxo autenticado em Playwright homolog local)
- [x] fluxo admin sem dado demo fixo
- [x] notificacao email/WhatsApp com telemetria de entrega (snapshot por canal exposto no `/api/health`)
- [x] mensagens de erro reais (sem fallback ficticio em producao)

## 5. Qualidade e testes

- [x] testes unitarios de auth/sessao/disponibilidade
- [x] testes de API para fluxos criticos
- [x] smoke e2e em ambiente de homologacao (validado em ambiente local tipo homologacao com banco real no Docker)
- [x] cobertura minima definida e atingida
- [x] pipeline CI bloqueando merge em falha

## 6. Operacao e observabilidade

- [x] logs estruturados com correlacao por request
- [x] monitoramento de erros em runtime
- [x] monitoramento de latencia e taxa de erro
- [x] endpoint de healthcheck
- [x] alertas configurados (erro, indisponibilidade, fila)
- [x] runbook de incidente publicado
- [ ] Sentry/APM externo configurado com DSN e alertas on-call (smoke local concluido em 2026-04-01 com `smoke:sentry`; pendente ativacao real no projeto Sentry e validacao no canal on-call)

## 7. Publico, SEO e UX

- [x] metadata completa por pagina principal (layouts de metadados por segmento principal)
- [x] robots e sitemap configurados
- [x] manifest e icones finalizados
- [x] validacao de acessibilidade minima (smoke automatizado com axe + Playwright)
- [x] revisao de performance em paginas chave (Lighthouse: home 96, entrar 99, cadastrar 99, termos 99, privacidade 99)

## 8. Legal e compliance

- [x] politica de privacidade publicada (versao inicial, pendente validacao juridica)
- [x] termos de uso publicados (versao inicial, pendente validacao juridica)
- [x] tratamento de dados pessoais mapeado (LGPD) - docs preenchidos, responsaveis definidos e simulacao registrada no Trello
- [x] processo de solicitacao/exclusao de dados definido (templates preenchidos + simulacao registrada)

## 9. Release e acompanhamento

- [x] plano de rollback aprovado (aprovacao registrada em `docs/operacao/rollback_aprovacao.md`)
- [x] piloto tecnico Prisma 7 executado em homologacao local (upgrade + migrate + seed + smoke validados em 2026-03-31)
- [x] janela de go-live definida (registrada em `docs/operacao/go_live_plan.md`)
- [x] plano de comunicacao com usuarios (registrado em `docs/operacao/comunicacao_go_live.md`)
- [x] monitoramento intensivo por 7 dias apos lancamento (registrado em `docs/operacao/monitoramento_pos_go_live_7_dias.md`)
- [x] reuniao de revisao pos go-live agendada (registrada em `docs/operacao/revisao_pos_go_live.md`)

## Plano de fechamento dos itens abertos (referencia de execucao)

Base: `contexto_ia/06_plano_fechamento_go_live_2026_04.md`

1. Bloco A (2026-04-01 a 2026-04-03):
   - 6.7 Sentry/APM externo configurado com DSN e alertas on-call.
2. Bloco B (2026-04-04 a 2026-04-08):
   - 8.3 tratamento de dados pessoais mapeado (LGPD).
   - 8.4 processo de solicitacao/exclusao de dados definido.
3. Bloco C (2026-04-09 a 2026-04-14):
   - 9.1 plano de rollback aprovado.
   - 9.3 janela de go-live definida.
   - 9.4 plano de comunicacao com usuarios.
   - 9.5 monitoramento intensivo por 7 dias apos lancamento.
   - 9.6 reuniao de revisao pos go-live agendada.
