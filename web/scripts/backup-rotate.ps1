$ErrorActionPreference = "Stop"

param(
  [int]$KeepLast = 14,
  [string]$BackupDir = "backups"
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backupScript = Join-Path $scriptDir "backup-db.ps1"

powershell -ExecutionPolicy Bypass -File $backupScript

if (-not (Test-Path $BackupDir)) {
  Write-Output "Diretorio de backup nao encontrado: $BackupDir"
  exit 0
}

$backups = Get-ChildItem -Path $BackupDir -Filter "backup_*.sql" | Sort-Object LastWriteTime -Descending
$toRemove = $backups | Select-Object -Skip $KeepLast

foreach ($item in $toRemove) {
  Remove-Item -LiteralPath $item.FullName -Force
  Write-Output "Backup removido por rotacao: $($item.Name)"
}

Write-Output "Rotacao concluida. Mantidos os ultimos $KeepLast backup(s)."
