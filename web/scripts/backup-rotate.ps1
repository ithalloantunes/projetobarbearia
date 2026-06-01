param(
  [int]$KeepLast = 14,
  [string]$BackupDir = "backups"
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path (Join-Path $scriptDir "..")
$backupScript = Join-Path $scriptDir "backup-db.ps1"

if (-not [System.IO.Path]::IsPathRooted($BackupDir)) {
  $BackupDir = Join-Path $projectRoot $BackupDir
}

powershell -ExecutionPolicy Bypass -File $backupScript -OutputDir $BackupDir

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
