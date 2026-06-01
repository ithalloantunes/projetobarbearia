# Monitoramento Intensivo - 7 Dias Pos Go-Live

Data: 2026-04-01
Objetivo: garantir estabilidade e resposta rapida nas primeiras 168 horas.

Registro operacional:

- Trello (quadro "Go-Live BarberSaaS")

## Escala e responsaveis

- Lider tecnico: Ithallo
- Operacao/DevOps: Orlando
- Suporte/CS: Vinicius

## Checklist diario (repetir a cada turno)

1. `GET /api/health` com `status=ok`.
2. `sentry.ready=true` e nenhuma issue critica aberta.
3. Taxa de erro abaixo do limite acordado.
4. Latencia media dentro do SLO.
5. Confirmar que fluxos criticos estao operando:
   - login
   - agendamento
   - remarcacao/cancelamento

## Escalacao

Escalar imediatamente se:

1. Health degradado por mais de 10 minutos.
2. Erro rate acima do limite por 15 minutos.
3. Aumento repentino de falhas em auth ou agendamento.

## Agenda sugerida (ajustar horarios)

Dia 1:
- 09:00 - checkpoint tecnico (Ithallo)
- 12:00 - checkpoint produto/suporte (Vinicius)
- 18:00 - checkpoint final do dia (Orlando)

Dias 2-7:
- 10:00 - checkpoint unico (Ithallo)

## Evidencias

- registrar cada checkpoint com horario, responsavel e status geral.
- anexar capturas de `api/health` e painel Sentry quando houver alerta.
