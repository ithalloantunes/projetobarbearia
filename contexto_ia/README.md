# Contexto IA - BarberSaaS

Este diretorio centraliza o contexto para qualquer IA que trabalhar neste projeto.
Data da consolidacao: 2026-03-25.
Ultima atualizacao: 2026-03-31.

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
- Telemetria basica ativa (taxa de erro e latencia media por rota em memoria).
- Smoke de homologacao ativo (`smoke:http` + workflow `smoke.yml`).
- Operacao inicial formalizada (backup/restore + runbook + monitor de health agendado + restore homologado com evidencia de RTO).
- SEO tecnico basico ativo (`robots`, `sitemap`, `manifest` e `icon`).
- Dependencias no lock atual sem vulnerabilidades reportadas por `npm audit`.
- Piloto Prisma 7 concluido em homologacao local (upgrade + rollback tecnico validado).
- Observabilidade externa integrada (Sentry SDK), pendente configuracao de DSN/alertas.
- Revisao de performance concluida com Lighthouse (home 96, entrar 99, cadastrar 99, termos 99, privacidade 99).
- LGPD iniciado com documento de processo interno (pendente validacao juridica).
- Pendencias principais: configurar DSN/alertas do Sentry e fechar governanca final de go-live.
