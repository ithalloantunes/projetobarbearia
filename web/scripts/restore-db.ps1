param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFile,
  [string]$Database = "barbersaas",
  [string]$DbUser = "root",
  [string]$DbPassword = "",
  [string]$DbHost = "127.0.0.1",
  [int]$DbPort = 3306,
  [string]$MySqlBinDir = ""
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path (Join-Path $scriptDir "..")

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

$mysqlPath = Resolve-MySqlTool -ToolName "mysql" -BinDir $MySqlBinDir
$authArgs = @("-h", $DbHost, "-P", "$DbPort", "-u", $DbUser)
if ($DbPassword) {
  $authArgs += "--password=$DbPassword"
}

$tempFile = [System.IO.Path]::GetTempFileName()
try {
  Set-Content -LiteralPath $tempFile -Value $content -NoNewline

  $process = Start-Process `
    -FilePath $mysqlPath `
    -ArgumentList @(
      $authArgs + @($Database)
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
