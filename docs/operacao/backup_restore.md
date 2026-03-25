# Backup e Restore (MySQL Docker)

Data: 2026-03-25
Escopo: ambiente local/homologacao com `docker-compose.yml` do projeto.

## Scripts disponiveis

- `web/scripts/backup-db.ps1`
- `web/scripts/restore-db.ps1`
- `web/scripts/backup-rotate.ps1`

## Pre-requisitos

1. Docker em execucao.
2. Servico `db` ativo (`docker compose up -d db` em `web/`).
3. Banco configurado com as credenciais do `docker-compose.yml`.

## Gerar backup manual

No diretorio `web/`:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\backup-db.ps1
```

Arquivo gerado em `web/backups/` no formato:

- `backup_barbersaas_YYYYMMDD_HHMMSS.sql`

## Restore manual

No diretorio `web/`:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\restore-db.ps1 -BackupFile .\backups\backup_barbersaas_YYYYMMDD_HHMMSS.sql
```

## Rotacao de backups

Mantendo os 14 ultimos arquivos:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\backup-rotate.ps1 -KeepLast 14
```

## Agendamento automatico (Windows Task Scheduler)

1. Criar tarefa com periodicidade diaria.
2. Acao:
   - Programa: `powershell`
   - Argumentos:
     - `-ExecutionPolicy Bypass -File C:\caminho\projetobarbearia-main\web\scripts\backup-rotate.ps1 -KeepLast 14`
   - Iniciar em:
     - `C:\caminho\projetobarbearia-main\web`

## Validacao recomendada

1. Backup concluido sem erro.
2. Restore em ambiente de homologacao separado.
3. Conferencia de tabelas criticas apos restore (`User`, `Barber`, `Service`, `Appointment`).
