# Backup e Restore (MySQL local / XAMPP)

Data: 2026-03-25
Escopo: ambiente local/homologacao com MySQL do XAMPP (sem Docker).

## Scripts disponiveis

- `web/scripts/backup-db.ps1`
- `web/scripts/restore-db.ps1`
- `web/scripts/backup-rotate.ps1`

## Pre-requisitos

1. XAMPP com MySQL ativo.
2. Banco `barbersaas` existente.
3. Cliente MySQL disponivel:
   - caminho padrao detectado automaticamente: `C:\xampp\mysql\bin`
   - ou disponivel no `PATH`
   - ou informado via parametro `-MySqlBinDir`

## Gerar backup manual

No diretorio `web/`:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\backup-db.ps1 -DbUser root -DbPassword ""
```

Arquivo gerado em `web/backups/` no formato:

- `backup_barbersaas_YYYYMMDD_HHMMSS.sql`

## Restore manual

No diretorio `web/`:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\restore-db.ps1 -BackupFile .\backups\backup_barbersaas_YYYYMMDD_HHMMSS.sql -DbUser root -DbPassword ""
```

## Rotacao de backups

Mantendo os 14 ultimos arquivos:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\backup-rotate.ps1 -KeepLast 14
```

## Parametros uteis

- `-DbHost` (padrao `127.0.0.1`)
- `-DbPort` (padrao `3306`)
- `-DbUser` (padrao `root`)
- `-DbPassword` (padrao vazio)
- `-MySqlBinDir` (ex.: `C:\xampp\mysql\bin`)

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
