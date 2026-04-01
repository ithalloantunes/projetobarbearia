# Plano Mestre - Caminho para 100% Uso Publico

Data: 2026-03-25
Status inicial: sistema com bloqueios P0
Meta: liberar producao publica com seguranca, estabilidade e governanca.

## Objetivos estrategicos

1. Garantir deploy previsivel (build verde + testes minimos + pipeline).
2. Eliminar riscos criticos de seguranca e credenciais.
3. Fechar lacunas operacionais para sustentacao publica.
4. Tornar produto confiavel para cliente final e equipe interna.

## Modelo de execucao (prioridade)

- P0 = bloqueia uso publico
- P1 = necessario para confiabilidade operacional
- P2 = escala, governanca e excelencia

## Fase 1 - P0 (Bloqueios de publicacao)

Prazo sugerido: 1 a 2 semanas

## 1. Estabilizar compilacao e tipagem

Entregaveis:

- `npm run build` passando
- `tsc --noEmit` sem erros
- alinhamento de tipos com versao real de `@prisma/client`

Criterio de aceite:

- 0 erro em build
- 0 erro em typecheck

## 2. Consertar esteira local minima

Entregaveis:

- script de lint funcional
- script de `typecheck` no `package.json`
- script unico de validacao local (ex.: `npm run verify`)

Criterio de aceite:

- qualquer dev consegue validar projeto em 1 comando

## 3. Corrigir baseline de seguranca urgente

Entregaveis:

- remover fallback de segredo padrao de sessao
- remover senha inicial padrao em seed e UI
- bloquear deploy sem `SESSION_SECRET` forte
- atualizar `.env.example` para setup coerente e seguro

Criterio de aceite:

- nenhuma credencial padrao perigosa no codigo
- ambiente novo sobe sem inconsistencias de porta/senha

## 4. Corrigir vulnerabilidades de dependencias reportadas

Entregaveis:

- atualizar versoes com fix disponivel
- registrar compatibilidade apos update

Criterio de aceite:

- `npm audit` sem vulnerabilidades altas conhecidas (ou com justificativa formal de risco residual)

## Fase 2 - P1 (Confiabilidade para producao)

Prazo sugerido: 2 a 4 semanas apos P0

## 1. Hardening de autenticacao

Entregaveis:

- rate limit em `login`, `register`, `forgot-password`
- lockout progressivo por tentativas falhas
- verificacao de email no cadastro (fluxo de ativacao)
- politica de senha formalizada

Criterio de aceite:

- testes cobrindo fluxos de auth e cenarios de abuso

## 2. Integridade de fluxo de negocio

Entregaveis:

- remover fallback com dados ficticios no front
- fluxo admin de agendamento sem cliente demo fixo
- mensagens de erro/estado reais e consistentes

Criterio de aceite:

- operacao admin e cliente sem dependencia de mock em producao

## 3. Testes automatizados minimos

Entregaveis:

- testes unitarios para auth/sessao/disponibilidade
- testes de API para agendamento/cancelamento/remarcacao
- smoke e2e de caminhos criticos

Criterio de aceite:

- cobertura minima acordada para fluxos criticos
- pipeline bloqueia merge quando testes falham

## 4. CI/CD e release controlado

Entregaveis:

- workflow de CI no repositorio
- gates: lint + typecheck + build + testes
- estrategia de release (staging -> producao)

Criterio de aceite:

- nenhum deploy manual sem validacoes obrigatorias

## Fase 3 - P2 (Operacao publica madura)

Prazo sugerido: 3 a 6 semanas apos P1

## 1. Observabilidade e operacao

Entregaveis:

- logs estruturados
- monitoramento de erro e performance
- endpoint de healthcheck
- alertas operacionais

Criterio de aceite:

- deteccao proativa de falhas em producao

## 2. Banco de dados e resiliencia

Entregaveis:

- migracoes versionadas
- politica de backup e restore testada
- runbook de incidente

Criterio de aceite:

- tempo de restauracao definido e testado

## 3. Camada publica (SEO, UX e legal)

Entregaveis:

- `robots`, `sitemap`, `manifest`, metadados completos
- revisao de acessibilidade basica
- politicas LGPD, privacidade e termos

Criterio de aceite:

- checklist juridico e tecnico de go-live completo

## Backlog consolidado (P0/P1/P2)

## P0

1. Corrigir erros TS/Prisma e fechar build.
2. Ajustar `lint` e criar `verify`.
3. Corrigir `.env.example` x `docker-compose`.
4. Remover defaults inseguros de segredo/senha.
5. Atualizar dependencias vulneraveis.

## P1

1. Rate limit + lockout + verificacao de email.
2. Remover fallback ficticio em telas criticas.
3. Fluxo admin sem cliente demo fixo.
4. Testes unitarios/API/e2e dos fluxos criticos.
5. Pipeline CI obrigatoria.

## P2

1. Observabilidade completa.
2. Governanca de banco (backup/restore/runbook).
3. SEO/manifest/robots/sitemap.
4. Pacote legal e compliance.

## Cronograma sugerido (macro)

1. Semana 1-2: P0 completo.
2. Semana 3-6: P1 completo.
3. Semana 7-10: P2 completo e go-live controlado.

## Indicadores de sucesso (KPIs)

1. Build success rate: 100% na branch principal.
2. Incidentes criticos em auth: 0 apos hardening.
3. Tempo medio de deteccao de falha (MTTD): monitorado.
4. Tempo medio de recuperacao (MTTR): monitorado.
5. Taxa de falha em agendamento: abaixo do limite acordado.

## Ritos de governanca recomendados

1. Daily tecnico curta com foco em bloqueios.
2. Revisao semanal de risco e andamento P0/P1/P2.
3. Gate de release quinzenal com checklist de go-live.
4. Post-mortem obrigatorio para incidente critico.

## Status de execucao atualizado (2026-04-01)

## Concluido ate o momento

1. P0 - compilacao e tipagem estabilizadas (`build`, `typecheck`, `lint` em verde).
2. P0 - esteira local minima ativa com comando unico `npm run verify`.
3. P0 - baseline de seguranca de credenciais aplicada (segredo de sessao sem fallback inseguro, senha padrao removida de seed/UI, `.env.example` alinhado).
4. P1 - hardening de auth iniciado e implementado:
   - rate limit em `login`, `register`, `forgot-password`, `reset-password`;
   - lockout progressivo no `login`;
   - fluxo de verificacao de email concluido (`register` inativo + `verify-email` + `resend-verification` + pagina `verificar-email`).
   - politica de senha formalizada (minimo 8 + complexidade) aplicada em APIs e telas de senha.
5. P1 - integridade de fluxo de negocio iniciada:
   - remocao de fallback/mock na pagina de agendamento;
   - fluxo admin de agendamento sem cliente demo fixo (agora exige email real do cliente).
6. P1 - qualidade inicial implementada:
   - testes unitarios de `auth-session`, `rate-limit`, `password-policy` e `availability`;
   - primeiro teste de rota API implementado para `POST /api/auth/verify-email`;
   - script `npm run test` criado e integrado no `npm run verify`;
   - workflow CI em `.github/workflows/ci.yml` com gates de `lint`, `typecheck`, `test` e `build`.
7. P1 - testes de API de agendamento iniciados:
   - testes para `POST /api/appointments` (validacao admin/cliente);
   - testes para `PATCH /api/appointments/[id]` (regras de permissao/cancelamento);
   - testes para `POST /api/client/appointments/[id]/reschedule`.
8. P1 - revisao de sessao/cookies aplicada:
   - opcoes de cookie centralizadas em helper (`getSessionCookieOptions`);
   - login/logout atualizados para padrao unico de cookie seguro.
9. P2 - observabilidade inicial iniciada:
   - endpoint de healthcheck implementado em `GET /api/health`.
   - logger estruturado com correlacao por `x-request-id` em rotas criticas de agendamento e health.
   - telemetria em memoria por rota (latencia media, total de requests e taxa de erro) exposta no healthcheck.
10. Operacao e continuidade:
   - scripts de backup/restore/rotacao adicionados em `web/scripts`.
   - runbook de incidente publicado em `docs/operacao/runbook_incidente.md`.
   - monitor de health agendado via workflow `health-monitor.yml` com webhook opcional.
11. Qualidade expandida:
   - smoke HTTP automatizado (`npm run smoke:http`) + workflow dedicado (`smoke.yml`);
   - cobertura minima configurada no Vitest e validada com `npm run test:coverage`.
   - CI passou a executar cobertura como gate.
12. Ambiente de boot:
   - validacao de variaveis obrigatorias em producao aplicada via `assertProductionEnv` no `proxy`.
13. SEO tecnico inicial:
   - metadata global fortalecida no `layout`;
   - `robots.txt`, `sitemap.xml`, `manifest.webmanifest` e `icon.svg` adicionados.
14. Smoke E2E browser iniciado:
   - Playwright adicionado como dependencia de teste;
   - suite inicial em `web/e2e/smoke/public-smoke.spec.ts` para rotas publicas;
   - job `smoke-e2e` adicionado no workflow `smoke.yml`.
15. Migracoes versionadas Prisma iniciadas:
   - baseline `web/prisma/migrations/20260325183000_init/migration.sql` gerada a partir do schema atual;
   - `migration_lock.toml` adicionado com provider `mysql`;
   - scripts `db:migrate:deploy` e `db:migrate:status` adicionados ao `package.json`.
16. Camada publica SEO/legal evoluida:
   - metadata dedicada aplicada por segmentos principais (`home`, auth e areas protegidas);
   - paginas publicas `termos-de-uso` e `politica-privacidade` publicadas;
   - sitemap ajustado para priorizar rotas indexaveis.
17. Qualidade de acessibilidade iniciada:
   - suite `smoke:a11y` com `axe + Playwright` para paginas publicas chave;
   - job de smoke atualizado para executar validacao de acessibilidade em CI.
18. Migracoes versionadas aplicadas em ambiente local tipo homologacao:
   - `db:migrate:deploy` executado com sucesso em MySQL Docker limpo;
   - `db:migrate:status` validado como `Database schema is up to date`.
19. Smoke de homologacao com banco real validado:
   - `db:seed` executado com sucesso;
   - `smoke:http` com health `200` e APIs basicas `200`;
   - `smoke:e2e` verde com 9 testes.
20. Telemetria de notificacoes implementada:
   - metricas de envio por canal (`email` e `whatsapp`) com estados `sent/failed/skipped/mocked`;
   - snapshot de notificacoes exposto no `GET /api/health`.
21. Estrategia Prisma 7 com rollback documentada:
   - runbook criado em `docs/operacao/prisma7_upgrade_rollback.md`.
22. Fluxo cliente autenticado ponta a ponta validado em homolog local:
   - teste E2E `smoke:e2e:auth` cobre login, criacao, remarcacao e cancelamento de agendamento;
   - validacao final de status do agendamento via API apos cancelamento.
23. Restore em homologacao validado com evidencia de continuidade:
   - scripts `backup-db.ps1`, `restore-db.ps1` e `backup-rotate.ps1` corrigidos para execucao robusta no PowerShell;
   - ciclo backup -> mutacao -> restore executado com sucesso em MySQL Docker local;
   - prova objetiva: dado criado apos backup foi removido no restore e baseline foi preservado;
   - RTO observado no teste: `3.51s`.
24. Piloto Prisma 7 concluido em homologacao local:
   - dependencias atualizadas para `prisma@7.6.0`, `@prisma/client@7.6.0` e `@prisma/adapter-mariadb@7.6.0`;
   - `prisma.config.ts` atualizado para `datasource.url` e `schema.prisma` adaptado ao novo formato;
   - `src/lib/prisma.ts` e `prisma/seed.js` atualizados para inicializar `PrismaClient` com driver adapter;
   - workflows de CI/smoke ajustados para injetar `DATABASE_URL` no `prisma generate` da major 7;
   - validacao completa em verde (`verify`, migrate status/deploy, seed, smoke HTTP/E2E/a11y e E2E autenticado);
   - lock final sem vulnerabilidades abertas em `npm audit`.
25. Observabilidade externa iniciada:
   - SDK `@sentry/nextjs` integrado (client/server/edge) com `SENTRY_DSN` opcional;
   - `next.config.mjs` ajustado para `withSentryConfig`;
   - `.env.example` atualizado com variaveis de observabilidade;
   - `verify` permaneceu verde apos integracao.
26. P2 - revisao de performance em paginas chave concluida (Lighthouse):
   - scores: home 96, entrar 99, cadastrar 99, termos 99, privacidade 99;
   - relatorios JSON em `web/perf-reports`.
27. Legal/compliance iniciado:
   - documento de processo LGPD criado em `docs/compliance/lgpd_solicitacoes_titular.md` (pendente validacao juridica).
28. Observabilidade externa evoluida para prontidao operacional:
   - `GET /api/health` agora inclui status de prontidao Sentry (`required`, `ready`, `missing`);
   - monitor agendado (`health-monitor`) atualizado para avaliar prontidao Sentry via `HEALTH_REQUIRE_SENTRY_READY`;
   - runbook de configuracao on-call publicado em `docs/operacao/sentry_alertas_oncall.md`.
29. Planejamento final das pendencias consolidado:
   - plano tatico com datas, evidencias e gate GO/NO-GO publicado em `contexto_ia/06_plano_fechamento_go_live_2026_04.md`.
30. Execucao inicial do Bloco A concluida em homolog local:
   - smoke dedicado `npm run smoke:sentry` implementado e validado;
   - healthcheck retornando `sentry.required=true` e `sentry.ready=true` em ambiente local com DSN de teste;
   - monitor `health-alert` validado com `HEALTH_REQUIRE_SENTRY_READY=true`.
31. Artefatos de governanca e LGPD publicados para fechamento final:
   - go-live plan e comunicacao: `docs/operacao/go_live_plan.md`, `docs/operacao/comunicacao_go_live.md`;
   - monitoramento e revisao pos go-live: `docs/operacao/monitoramento_pos_go_live_7_dias.md`, `docs/operacao/revisao_pos_go_live.md`;
   - aprovacao de rollback: `docs/operacao/rollback_aprovacao.md`;
   - LGPD operacional: `docs/compliance/lgpd_sla_canais.md`, `docs/compliance/lgpd_checklist_execucao.md`,
     `docs/compliance/lgpd_modelo_resposta.md`, `docs/compliance/lgpd_registro_solicitacoes.md`.
32. Templates preenchidos e aprovados com responsaveis:
   - LGPD com simulacao registrada em `docs/compliance/lgpd_simulacao_registro.md`;
   - go-live com janela definida e comunicacao pronta;
   - monitoramento 7 dias e revisao pos go-live agendados;
   - rollback aprovado por Ithallo, Orlando e Vinicius.
33. Camada publica de UX evoluida para jornada interativa:
   - home refeita com selecao de servico/barbeiro, etapas visuais e resumo dinamico;
   - microinteracoes de hover aplicadas em cards, imagens, indicadores e navegacao.
34. Continuidade de funil implementada entre paginas:
   - pre-reserva da home conectada com `cadastrar`/`entrar` e pre-selecao automatica em `agendar`.
35. Validacao completa da frente UX executada em ambiente local:
   - `lint`, `test`, `typecheck`, `build` e `smoke:e2e` em verde (9/9 no ciclo final).

## Em andamento

1. P2 - observabilidade avancada externa (Sentry/APM + alertas com on-call) em fase final:
   - prontidao tecnica concluida em codigo e monitor;
   - validacao local do Bloco A concluida com smoke dedicado;
   - pendente ativacao de DSN real e validacao de alertas no canal on-call de producao.
2. Legal/compliance - processo LGPD formalizado e simulado; pendente validacao juridica final.
3. Release/governanca - plano preenchido e aprovado; pendente somente confirmacao de execucao da janela definida.
4. UX/camada publica - refinamento final de hierarquia de CTA para reduzir redundancia na primeira dobra, mantendo fluxo guiado simples e intuitivo.

## Plano tatico de fechamento (2026-04-01 a 2026-04-14)

1. Bloco A (2026-04-01 a 2026-04-03): ativacao real de Sentry/APM e validacao de alerta on-call.
2. Bloco B (2026-04-04 a 2026-04-08): formalizacao LGPD operacional com aprovacao juridica e simulacao.
3. Bloco C (2026-04-09 a 2026-04-14): aprovacao de rollback, definicao de janela, plano de comunicacao e monitoramento 7 dias.
4. Referencia completa: `contexto_ia/06_plano_fechamento_go_live_2026_04.md`.

## Proxima frente sugerida (ordem)

1. Executar Bloco A do plano tatico e coletar evidencias de alerta on-call.
2. Executar Bloco B com validacao juridica LGPD e simulacao de atendimento.
3. Executar Bloco C para fechamento de governanca final de release/go-live.

## Nota tecnica sobre dependencias (2026-03-31)

O piloto de upgrade para Prisma 7 foi concluido com `prisma` e `@prisma/client` em `7.6.0`,
mantendo a esteira tecnica e de smoke em verde no ambiente de homologacao local.
