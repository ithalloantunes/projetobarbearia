param(
  [string]$Database = "barbersaas",
  [string]$DbUser = "root",
  [string]$DbPassword = "",
  [string]$DbHost = "127.0.0.1",
  [int]$DbPort = 3306,
  [string]$OutputDir = "backups",
  [string]$MySqlBinDir = ""
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path (Join-Path $scriptDir "..")

if (-not [System.IO.Path]::IsPathRooted($OutputDir)) {
  $OutputDir = Join-Path $projectRoot $OutputDir
}

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = Join-Path $OutputDir "backup_${Database}_${timestamp}.sql"
$stderrFile = Join-Path $OutputDir "backup_${Database}_${timestamp}.err.log"

function Resolve-MySqlTool {
  param(
    [string]$ToolName,
    [string]$BinDir
  )

  if ($BinDir) {
    $candidate = Join-Path $BinDir "$ToolName.exe"
    if (Test-Path $candidate) {
      return $candidate
    }
  }

  $xamppDefault = "C:\xampp\mysql\bin\$ToolName.exe"
  if (Test-Path $xamppDefault) {
    return $xamppDefault
  }

  $command = Get-Command $ToolName -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }

  throw "Nao foi possivel localizar $ToolName. Informe -MySqlBinDir (ex.: C:\xampp\mysql\bin) ou adicione no PATH."
}

$mysqldumpPath = Resolve-MySqlTool -ToolName "mysqldump" -BinDir $MySqlBinDir
$authArgs = @("-h", $DbHost, "-P", "$DbPort", "-u", $DbUser)
if ($DbPassword) {
  $authArgs += "--password=$DbPassword"
}

$process = Start-Process `
  -FilePath $mysqldumpPath `
  -ArgumentList @(
    $authArgs +
    @(
      "--single-transaction",
      "--quick",
      "--routines",
      "--triggers",
      "--events",
      $Database
    )
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
