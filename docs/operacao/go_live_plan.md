# Plano de Go-Live - BarberSaaS

Data: 2026-04-01
Objetivo: executar o go-live com controle, janela definida e criterios de GO/NO-GO.

Registro operacional:

- Trello (quadro "Go-Live BarberSaaS")

## Pre-requisitos

1. `04_checklist_go_live.md` com itens 6, 8 e 9 prontos ou aprovados.
2. `docs/operacao/prisma7_upgrade_rollback.md` aprovado e assinado.
3. `docs/operacao/sentry_alertas_oncall.md` validado com alerta entregue no canal on-call.
4. Plano de comunicacao publicado (ver `docs/operacao/comunicacao_go_live.md`).
5. Plano de monitoramento 7 dias publicado (ver `docs/operacao/monitoramento_pos_go_live_7_dias.md`).

## Janela de go-live

- Data: 2026-04-12
- Inicio: 21:00 (America/Sao_Paulo)
- Fim: 23:30 (America/Sao_Paulo)
- Congelamento de mudancas:
  - Inicio: 2026-04-12 18:00 (America/Sao_Paulo)
  - Fim: 2026-04-12 23:59 (America/Sao_Paulo)

## Responsaveis

- Tech Lead: Ithallo
- Operacao/DevOps: Orlando
- Suporte/CS: Vinicius
- Comunicacao/Produto: Ithallo

## Checklist pre-go-live (executar T-24h)

1. `npm run verify` em estado verde.
2. `npm run smoke:http` em verde.
3. `npm run smoke:sentry` em verde.
4. `GET /api/health` com `status=ok` e `sentry.ready=true`.
5. Backup recente executado e validado.
6. Plano de rollback revisado e responsaveis cientes.

## Execucao (T-0)

1. Confirmar janela e congelamento ativo.
2. Deploy da versao aprovada.
3. Validar health e principais rotas:
   - `/api/health`
   - `/api/auth/session`
   - `/api/appointments`
4. Monitorar Sentry por 30 min apos deploy.
5. Comunicar conclusao do go-live.

## Criterios de GO/NO-GO

GO somente se:

1. Health `ok` por 15 minutos consecutivos.
2. Taxa de erro abaixo do limite acordado.
3. Alertas Sentry sem incidentes criticos abertos.

NO-GO se:

1. Health degradado por mais de 10 minutos.
2. Falhas de auth ou agendamento.
3. Alertas criticos ativos sem mitigacao.

## Monitoramento pos go-live

Executar o plano `docs/operacao/monitoramento_pos_go_live_7_dias.md`.
