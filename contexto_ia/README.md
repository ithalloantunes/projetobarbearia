# Contexto IA - BarberSaaS

Este diretorio centraliza o contexto para qualquer IA que trabalhar neste projeto.
Data da consolidacao: 2026-03-25.
Ultima atualizacao: 2026-04-01.

## Arquivos

1. `01_contexto_conversa_e_historico.md`
Resumo da conversa com o usuario, pedidos realizados e decisoes tomadas.

2. `02_diagnostico_tecnico_prontidao_publica.md`
Diagnostico tecnico de prontidao para uso publico, com evidencias e riscos.

3. `03_plano_mestre_100_publico.md`
Planejamento profissional completo para levar o sistema a 100% para uso publico.

4. `04_checklist_go_live.md`
Checklist operacional, tecnico, legal e de seguranca para publicacao.

5. `05_diario_execucao.md`
Historico do que foi feito na sessao (passo a passo), incluindo validacoes executadas.

6. `06_plano_fechamento_go_live_2026_04.md`
Plano tatico final para fechamento das pendencias abertas de go-live (datas, aceite e evidencias).

## Regra de manutencao

- Toda nova sessao deve atualizar:
  - `01_contexto_conversa_e_historico.md`
  - `05_diario_execucao.md`
- Toda mudanca de prioridade/plano deve refletir em:
  - `03_plano_mestre_100_publico.md`
  - `04_checklist_go_live.md`

## Status atual resumido

- P0 tecnico concluido (build/typecheck/lint e seguranca de defaults).
- P1 concluido para baseline de confiabilidade (auth hardening + verificacao de email + politica de senha + E2E critico).
- Qualidade ativa (testes unitarios + API + smoke E2E publico/autenticado + CI + verify).
- Observabilidade inicial ativa (healthcheck + logs estruturados com `x-request-id`).
- Observabilidade externa integrada (Sentry SDK) pronta para DSN/alertas.
- Healthcheck e monitor operacional atualizados para validar prontidao de Sentry (`required`/`ready`/`missing`).
- Smoke dedicado de Sentry validado localmente (`npm run smoke:sentry`) em 2026-04-01.
- Telemetria basica ativa (taxa de erro e latencia media por rota em memoria).
- Smoke de homologacao ativo (`smoke:http` + workflow `smoke.yml`).
- Operacao inicial formalizada (backup/restore + runbook + monitor de health agendado + restore homologado com evidencia de RTO).
- SEO tecnico basico ativo (`robots`, `sitemap`, `manifest` e `icon`).
- Dependencias no lock atual sem vulnerabilidades reportadas por `npm audit`.
- Piloto Prisma 7 concluido em homologacao local (upgrade + rollback tecnico validado).
- Observabilidade externa integrada (Sentry SDK), pendente configuracao de DSN/alertas.
- Revisao de performance concluida com Lighthouse (home 96, entrar 99, cadastrar 99, termos 99, privacidade 99).
- LGPD iniciado com documento de processo interno (pendente validacao juridica).
- Pendencias principais:
  - fechar ativacao real de Sentry/APM com alerta on-call validado;
  - formalizar validacao juridica final de LGPD (templates e simulacao ja registrados).
  - executar a janela de go-live definida e registrar evidencias.
- Plano tatico de fechamento publicado em `06_plano_fechamento_go_live_2026_04.md` com janela de execucao 2026-04-01 a 2026-04-14.
- Templates de fechamento publicados em `docs/operacao/*.md` e `docs/compliance/*.md` (go-live, comunicacao, monitoramento, revisao e LGPD).
- Camada publica da home evoluida para jornada interativa (selecao de servico/barbeiro, passos visuais e CTA dinamico).
- Continuidade de contexto implementada no funil (`/` -> auth -> `/agendar`) com pre-selecao por query string.
- Validacao tecnica completa da frente UX executada com sucesso (`lint`, `test`, `typecheck`, `build` e `smoke:e2e` 9/9).
