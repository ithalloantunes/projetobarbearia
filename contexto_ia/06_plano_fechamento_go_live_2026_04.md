# Plano de Fechamento Final para Go-Live

Data de criacao: 2026-04-01
Escopo: fechar apenas pendencias abertas no `contexto_ia` para habilitar decisao GO/NO-GO.
Janela planejada: 2026-04-01 a 2026-04-14.

## Status de execucao

1. 2026-04-01: validacao tecnica local do Bloco A concluida com `npm run smoke:sentry`.
2. 2026-04-01: pendencia remanescente do Bloco A restrita a ativacao de DSN/alertas reais no ambiente alvo.
3. 2026-04-01: templates de LGPD operacional publicados (SLA, checklist, modelos de resposta e registro).
4. 2026-04-01: templates de governanca de release publicados (go-live plan, comunicacao, monitoramento 7 dias, revisao pos go-live e aprovacao de rollback).
5. 2026-04-01: templates preenchidos com responsaveis e datas (Trello como registro oficial).
6. 2026-04-01: simulacao LGPD registrada em `docs/compliance/lgpd_simulacao_registro.md`.

## Objetivo

Transformar pendencias finais em execucao controlada com dono, data, evidencia e criterio de aceite.

Pendencias alvo:

1. Sentry/APM externo ativo com alerta on-call validado.
2. Processo LGPD formalizado (juridico + operacao + SLA + canais).
3. Governanca final de release (rollback aprovado, janela, comunicacao, monitoramento 7 dias e revisao pos go-live).

## Linha de execucao (datas absolutas)

### Bloco A - Observabilidade externa (2026-04-01 a 2026-04-03)

1. Configurar variaveis `SENTRY_*` em homolog e producao.
2. Habilitar `HEALTH_REQUIRE_SENTRY_READY=true` no monitor agendado.
3. Criar regras de alerta no Sentry:
   - new issue
   - regression
   - high error rate
   - latency/performance
4. Executar teste controlado de alerta e confirmar entrega em canal on-call.

Evidencias obrigatorias:

1. print/log de `GET /api/health` com `sentry.required=true` e `sentry.ready=true`.
2. execucao do workflow `health-monitor` sem erro.
3. evento de teste recebido no canal on-call.

Criterio de aceite:

- item 6.7 do checklist (`Sentry/APM externo`) pode ser marcado como concluido.

### Bloco B - LGPD operacional (2026-04-04 a 2026-04-08)

1. Validar juridicamente o documento `docs/compliance/lgpd_solicitacoes_titular.md`.
2. Definir canais oficiais (email e formulario) e SLA final por tipo de solicitacao.
3. Definir responsaveis operacionais por etapa:
   - recepcao
   - validacao de identidade
   - execucao tecnica
   - resposta ao titular
4. Formalizar trilha de auditoria minima (ticket, aprovacao, evidencia, encerramento).
5. Rodar simulacao de ponta a ponta:
   - solicitacao de acesso
   - solicitacao de exclusao/anonimizacao

Evidencias obrigatorias:

1. documento LGPD com aprovacao registrada.
2. simulacao executada com IDs de ticket e horario.
3. checklist de auditoria preenchido.

Criterio de aceite:

- itens 8.3 e 8.4 do checklist podem ser marcados como concluidos.

### Bloco C - Governanca de release/go-live (2026-04-09 a 2026-04-14)

1. Aprovar formalmente o plano de rollback final (baseado em `docs/operacao/prisma7_upgrade_rollback.md`).
2. Definir janela de go-live com data/hora e janela de congelamento de mudancas.
3. Publicar plano de comunicacao para usuarios:
   - aviso pre-go-live
   - mensagem de manutencao (se houver)
   - mensagem de encerramento
4. Definir monitoramento intensivo por 7 dias:
   - responsavel por turno
   - horarios de checkpoint
   - gatilhos de escalacao
5. Agendar reuniao de revisao pos go-live com pauta fechada.

Evidencias obrigatorias:

1. ata/aprovacao do rollback.
2. anuncio da janela de go-live.
3. plano de comunicacao publicado.
4. escala de monitoramento 7 dias publicada.
5. convite da reuniao pos go-live enviado.

Criterio de aceite:

- itens 9.1, 9.3, 9.4, 9.5 e 9.6 do checklist podem ser marcados como concluidos.

## Matriz de responsabilidade sugerida

1. Tech Lead:
   - owner dos blocos A e C (tecnico e release).
2. Produto/Operacao:
   - owner da comunicacao e do monitoramento pos go-live.
3. Juridico/Compliance:
   - owner de aprovacao LGPD (bloco B).
4. Suporte/CS:
   - owner do canal de solicitacao e registro de atendimento LGPD.

## Gate de decisao GO/NO-GO

### Gate 1 (2026-04-08)

Condicoes minimas:

1. Sentry/APM concluido e validado.
2. LGPD com processo operacional aprovado.

Resultado:

- GO para preparacao final de release ou NO-GO com plano corretivo.

### Gate 2 (2026-04-14)

Condicoes minimas:

1. rollback aprovado.
2. janela de go-live definida e comunicacao pronta.
3. monitoramento 7 dias com escala fechada.
4. reuniao pos go-live agendada.

Resultado:

- GO para execucao de lancamento controlado.

## Riscos residuais e mitigacao

1. Risco: DSN configurado, mas alerta nao entrega no canal.
   - Mitigacao: teste de alerta real + dupla validacao (Sentry e canal receptor).
2. Risco: processo LGPD aprovado, mas operacao nao treinada.
   - Mitigacao: simulacao obrigatoria com evidencias antes do go-live.
3. Risco: rollout sem alinhamento de comunicacao.
   - Mitigacao: plano pre-aprovado com mensagens padrao e responsavel unico por disparo.

## Definicao de pronto (DoD) desta fase

1. Todos os checkboxes pendentes dos blocos 6, 8 e 9 no `04_checklist_go_live.md` estao concluidos.
2. Evidencias estao anexadas/registradas no historico operacional.
3. GO/NO-GO registrado com data e responsavel.
