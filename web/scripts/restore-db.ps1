param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFile,
  [string]$ComposeFile = "docker-compose.yml",
  [string]$ServiceName = "db",
  [string]$Database = "barbersaas",
  [string]$DbUser = "root",
  [string]$DbPassword = "barbersaas"
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path (Join-Path $scriptDir "..")

if (-not [System.IO.Path]::IsPathRooted($ComposeFile)) {
  $ComposeFile = Join-Path $projectRoot $ComposeFile
}

if (-not [System.IO.Path]::IsPathRooted($BackupFile)) {
  $BackupFile = Join-Path $projectRoot $BackupFile
}

if (-not (Test-Path $BackupFile)) {
  throw "Arquivo de backup nao encontrado: $BackupFile"
}

$content = Get-Content -LiteralPath $BackupFile -Raw
if ([string]::IsNullOrWhiteSpace($content)) {
  throw "Backup vazio: $BackupFile"
}

$tempFile = [System.IO.Path]::GetTempFileName()
try {
  Set-Content -LiteralPath $tempFile -Value $content -NoNewline

  $process = Start-Process `
    -FilePath "docker" `
    -ArgumentList @(
      "compose", "-f", $ComposeFile, "exec", "-T", $ServiceName,
      "mysql", "-u$DbUser", "-p$DbPassword", $Database
    ) `
    -NoNewWindow `
    -RedirectStandardInput $tempFile `
    -PassThru `
    -Wait

  if ($process.ExitCode -ne 0) {
    throw "Falha no restore do backup: $BackupFile"
  }
} finally {
  if (Test-Path $tempFile) {
    Remove-Item $tempFile -Force
  }
}

Write-Output "Restore concluido a partir de: $BackupFile"
