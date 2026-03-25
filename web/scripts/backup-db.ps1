$ErrorActionPreference = "Stop"

param(
  [string]$ComposeFile = "docker-compose.yml",
  [string]$ServiceName = "db",
  [string]$Database = "barbersaas",
  [string]$DbUser = "root",
  [string]$DbPassword = "barbersaas",
  [string]$OutputDir = "backups"
)

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = Join-Path $OutputDir "backup_${Database}_${timestamp}.sql"
$stderrFile = Join-Path $OutputDir "backup_${Database}_${timestamp}.err.log"

$process = Start-Process `
  -FilePath "docker" `
  -ArgumentList @(
    "compose", "-f", $ComposeFile, "exec", "-T", $ServiceName,
    "sh", "-lc", "mysqldump -u$DbUser -p$DbPassword $Database"
  ) `
  -NoNewWindow `
  -RedirectStandardOutput $backupFile `
  -RedirectStandardError $stderrFile `
  -PassThru `
  -Wait

if ($process.ExitCode -ne 0) {
  throw "Falha no backup. Consulte: $stderrFile"
}

Write-Output "Backup concluido: $backupFile"
