# Runbook de Incidente (BarberSaaS)

Data: 2026-03-25
Objetivo: orientar resposta rapida a incidentes em producao/homologacao.

## Severidade

- `SEV-1`: indisponibilidade total, perda de dados ou falha de login em massa.
- `SEV-2`: funcionalidade critica degradada (agendamento, auth, notificacao).
- `SEV-3`: problema parcial com workaround.

## Fluxo de resposta

1. Abrir incidente e registrar horario de inicio.
2. Classificar severidade (`SEV-1/2/3`).
3. Nomear responsavel tecnico e comunicacao.
4. Coletar evidencias iniciais:
   - `GET /api/health`
   - logs com `x-request-id`
   - painel Sentry (issues novas/regressoes)
   - erro principal e impacto percebido
5. Aplicar mitigacao imediata (rollback, feature flag, bloqueio parcial, reinicio controlado).
6. Confirmar estabilizacao.
7. Comunicar status e proximo update.
8. Executar pos-mortem em ate 48h.

## Checklist de diagnostico rapido

1. Healthcheck:
   - status `ok` ou `degraded`
   - latencia e erro do banco
   - telemetria por rota
   - prontidao de observabilidade externa em `sentry.ready` e `sentry.missing`
2. Rotas de auth:
   - `/api/auth/login`
   - `/api/auth/session`
3. Rotas de negocio:
   - `/api/appointments`
   - `/api/client/appointments/[id]/reschedule`
4. Banco:
   - conexao MySQL
   - disponibilidade do container `db`

## Mitigacoes padrao

1. Falha de banco:
   - validar `docker compose ps`
   - reiniciar `db`
   - se necessario, restaurar backup recente em homologacao e validar integridade
2. Regressao de deploy:
   - rollback da versao anterior conhecida estavel
3. Erro de endpoint:
   - usar `x-request-id` para rastrear logs
   - aplicar hotfix e promover com `verify` + CI

## Comunicacao

1. Atualizacao inicial em ate 15 minutos.
2. Atualizacoes de progresso a cada 30 minutos em incidentes `SEV-1/2`.
3. Encerramento com impacto, causa raiz e acao preventiva.

## Pos-mortem minimo

1. Linha do tempo.
2. Causa raiz.
3. O que funcionou/nao funcionou.
4. Acoes corretivas com dono e prazo.
