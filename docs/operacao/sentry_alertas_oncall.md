# Setup Sentry e Alertas On-Call

Data: 2026-04-01  
Objetivo: fechar a operacao de observabilidade externa do BarberSaaS para go-live.

Responsaveis:

- Ithallo
- Orlando
- Vinicius

Registro operacional:

- Trello (quadro "Go-Live BarberSaaS")

## 1. Variaveis obrigatorias no ambiente de execucao

Definir no provedor de deploy (homolog/producao):

- `SENTRY_DSN`: DSN do projeto Sentry.
- `NEXT_PUBLIC_SENTRY_DSN`: mesmo DSN para eventos no browser (ou DSN separado, se aplicavel).
- `SENTRY_ENVIRONMENT`: exemplo `homolog` ou `production`.
- `SENTRY_RELEASE`: identificador de release (ex.: hash do commit ou versao semantica).
- `SENTRY_TRACES_SAMPLE_RATE`: valor entre `0` e `1` (ex.: `0.2`).

Opcional:

- `SENTRY_REQUIRED=true` para exigir prontidao do Sentry no healthcheck mesmo fora de producao.

## 2. Verificacao de prontidao via healthcheck

O endpoint `GET /api/health` publica:

- `sentry.required`
- `sentry.ready`
- `sentry.missing`

Criterio para go-live:

- `sentry.required = true`
- `sentry.ready = true`
- `sentry.missing = []`

## 3. Configuracao do monitor agendado

No GitHub Actions (`health-monitor.yml`):

- `secrets.HEALTHCHECK_URL`
- `secrets.ALERT_WEBHOOK_URL` (Slack/Teams/Discord webhook)
- `vars.HEALTH_ERROR_RATE_THRESHOLD` (ex.: `0.2`)
- `vars.HEALTH_REQUIRE_SENTRY_READY=true` para falhar monitor quando Sentry estiver obrigatorio e nao pronto.

## 4. Regras minimas de alerta no Sentry

Criar no projeto Sentry:

1. `New Issue` (erro novo) com notificacao imediata para on-call.
2. `Regression` (erro reaberto) com prioridade alta.
3. `High Error Rate` para picos de falha em endpoint critico.
4. `Latency/Performance` para transacoes acima do SLO acordado.

Canal recomendado:

- Integracao com Slack (canal de incidentes) ou PagerDuty.

## 5. Validacao operacional

1. Deploy em homolog com variaveis `SENTRY_*` preenchidas.
2. Confirmar `GET /api/health` com `sentry.ready=true`.
3. Executar workflow `health-monitor` manualmente.
4. Disparar um evento de teste no Sentry e confirmar chegada no canal de alerta:
   - opcao A (via UI do Sentry)
   - opcao B (via CLI): `npm.cmd run sentry:test` com `SENTRY_DSN` configurado
5. Registrar evidencias (timestamp, print da issue e notificacao).

## 6. Criterio de fechamento desta frente

Esta pendencia de checklist so pode ser marcada como concluida quando:

1. DSN ativo no ambiente alvo;
2. alertas configurados e entregues ao canal on-call;
3. evidencias de teste salvas no historico operacional.
