# Plano de Migracao Prisma 6 -> 7 (com Rollback)

Data: 2026-03-25  
Escopo: `web/`  
Versao atual validada: `prisma@6.12.0` e `@prisma/client@6.12.0`  
Versao alvo sugerida: `7.5.0`

## Objetivo

Realizar upgrade controlado para Prisma 7 mantendo:

- integridade de schema/migrations;
- previsibilidade de deploy;
- rollback rapido sem perda de operacao.

## Pre-checks obrigatorios

1. Banco homologacao com backup validado.
2. `npm run verify` verde no estado atual.
3. `npm run db:migrate:status` em verde no ambiente alvo.
4. Janela de manutencao definida para producao.

## Execucao em homologacao

1. Criar branch tecnica:
   - `git checkout -b chore/prisma7-upgrade`
2. Atualizar dependencias:
   - `npm.cmd install prisma@7.5.0 @prisma/client@7.5.0`
3. Regenerar cliente:
   - `npm.cmd run prisma:generate`
4. Validar compatibilidade:
   - `npm.cmd run verify`
5. Validar migracoes:
   - `npm.cmd run db:migrate:status`
   - `npm.cmd run db:migrate:deploy`
6. Validar operacao:
   - `npm.cmd run db:seed` (somente homolog/dev)
   - `npm.cmd run smoke:http`
   - `npm.cmd run smoke:e2e`
   - `npm.cmd run smoke:a11y`

## Criterio de aceite

Todos os itens abaixo devem passar:

1. `verify` sem regressao.
2. migracoes aplicadas sem drift.
3. smoke HTTP/E2E/a11y em verde.
4. healthcheck com banco `up`.
5. sem erro critico de runtime no fluxo de auth/agendamento.

## Rollback (homolog/producao)

Se houver regressao apos upgrade:

1. Reverter dependencias para versao estavel:
   - `npm.cmd install prisma@6.12.0 @prisma/client@6.12.0`
2. Regenerar cliente:
   - `npm.cmd run prisma:generate`
3. Revalidar:
   - `npm.cmd run verify`
   - `npm.cmd run db:migrate:status`
4. Se necessario, restaurar backup de banco conforme runbook:
   - `docs/operacao/backup_restore.md`

## Plano de rollout recomendado

1. Homologacao completa.
2. Deploy canario (1 ambiente/instancia).
3. Monitoramento intensivo por 24h:
   - erros 5xx,
   - latencia de API,
   - falhas de notificacao.
4. Rollout total somente apos estabilidade.
