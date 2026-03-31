# Projeto Barbearia (BarberSaaS)

## Estrutura principal

- `web/`: aplicacao Next.js + Prisma.
- `contexto_ia/`: planejamento, diagnostico, checklist e diario de execucao.

## Setup rapido (desenvolvimento local)

1. Entre na aplicacao:
   - `cd web`
2. Configure ambiente:
   - copie `.env.example` para `.env`
   - preencha ao menos `DATABASE_URL` e `SESSION_SECRET`
3. Instale dependencias:
   - `npm.cmd install`
4. Gere o cliente Prisma:
   - `npm.cmd run prisma:generate`
5. Suba a app:
   - `npm.cmd run dev`

## Comandos de validacao

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test`
- `npm.cmd run test:coverage`
- `npm.cmd run build`
- `npm.cmd run verify` (executa lint + typecheck + test + build)
- `npm.cmd run smoke:http`
- `npm.cmd run smoke:e2e` (requer browser Chromium do Playwright: `npx.cmd playwright install chromium`)
- `npm.cmd run smoke:e2e:auth` (homolog local com banco+seed; valida login/criar/remarcar/cancelar)
- `npm.cmd run smoke:a11y` (axe + Playwright para violacoes criticas de acessibilidade)

## Comandos de banco

- `npm.cmd run db:push`
- `npm.cmd run db:migrate`
- `npm.cmd run db:migrate:deploy`
- `npm.cmd run db:migrate:status`
- `npm.cmd run db:seed`

Obs.: comandos de banco exigem `DATABASE_URL` configurada no `.env`.
Obs. 2: a CLI do Prisma usa `web/prisma.config.ts`.
Obs. 3: migracao baseline versionada em `web/prisma/migrations/20260325183000_init/migration.sql`.

## Operacao

- Healthcheck: `GET /api/health`
- Pipeline CI: `.github/workflows/ci.yml`
- Pipeline Smoke: `.github/workflows/smoke.yml`
- Monitor de saude agendado: `.github/workflows/health-monitor.yml`
- Correlacao de requests: header `x-request-id` propagado no `proxy` e usado em logs estruturados.
- Telemetria basica: `/api/health` inclui taxa de erro e latencia media por rota (memoria local).
- Telemetria de notificacoes: `/api/health` inclui metricas de entrega por canal (`email`/`whatsapp`).
- Backup/restore e runbook: `docs/operacao/backup_restore.md` e `docs/operacao/runbook_incidente.md`
- Plano de upgrade Prisma 7 com rollback: `docs/operacao/prisma7_upgrade_rollback.md`
- SEO tecnico: `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`
- Paginas legais publicas: `/termos-de-uso` e `/politica-privacidade`
