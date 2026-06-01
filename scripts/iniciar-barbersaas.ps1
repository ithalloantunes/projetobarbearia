$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Fail {
  param([string]$Message)
  Write-Host ""
  Write-Host "ERRO: $Message" -ForegroundColor Red
  exit 1
}

function Test-LocalPort {
  param([int]$Port)
  try {
    $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop | Select-Object -First 1
    return $null -ne $listener
  } catch {
    return $false
  }
}

function Wait-LocalPort {
  param(
    [int]$Port,
    [int]$TimeoutSec = 60
  )
  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  while ((Get-Date) -lt $deadline) {
    if (Test-LocalPort -Port $Port) {
      return $true
    }
    Start-Sleep -Seconds 1
  }
  return $false
}

function Resolve-NodeToolchain {
  $candidateDirs = @()

  $nodeFromPath = Get-Command node.exe -ErrorAction SilentlyContinue
  if ($nodeFromPath) {
    $candidateDirs += (Split-Path -Parent $nodeFromPath.Source)
  }

  $npmFromPath = Get-Command npm.cmd -ErrorAction SilentlyContinue
  if ($npmFromPath) {
    $candidateDirs += (Split-Path -Parent $npmFromPath.Source)
  }

  $runningNode = Get-Process -Name node -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($runningNode -and $runningNode.Path) {
    $candidateDirs += (Split-Path -Parent $runningNode.Path)
  }

  if ($env:ProgramFiles) {
    $candidateDirs += (Join-Path $env:ProgramFiles "nodejs")
  }
  if ($env:ProgramFiles -and (Test-Path "${env:ProgramFiles(x86)}")) {
    $candidateDirs += (Join-Path ${env:ProgramFiles(x86)} "nodejs")
  }

  $wingetPackagesRoot = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Packages"
  if (Test-Path $wingetPackagesRoot) {
    $wingetInstalls = Get-ChildItem -Path $wingetPackagesRoot -Directory -Filter "OpenJS.NodeJS.LTS_*" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
    foreach ($installDir in $wingetInstalls) {
      $nodeFolder = Get-ChildItem -Path $installDir.FullName -Directory -Filter "node-v*-win-x64" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
      if ($nodeFolder) {
        $candidateDirs += $nodeFolder.FullName
      }
    }
  }

  foreach ($candidate in ($candidateDirs | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique)) {
    $nodeExe = Join-Path $candidate "node.exe"
    $npmCmd = Join-Path $candidate "npm.cmd"
    if ((Test-Path $nodeExe) -and (Test-Path $npmCmd)) {
      return @{
        NodeExe = $nodeExe
        NpmCmd = $npmCmd
        BinDir = $candidate
      }
    }
  }

  Fail "Node.js/npm nao encontrados. Instale Node.js LTS: https://nodejs.org/"
}

function Update-EnvValue {
  param(
    [string]$Content,
    [string]$Key,
    [string]$Value
  )

  $escapedKey = [regex]::Escape($Key)
  $replacement = "$Key=""$Value"""
  if ($Content -match "(?m)^$escapedKey\s*=") {
    return [regex]::Replace($Content, "(?m)^$escapedKey\s*=.*$", $replacement)
  }

  $normalized = $Content.TrimEnd()
  if ($normalized.Length -eq 0) {
    return "$replacement`r`n"
  }
  return "$normalized`r`n$replacement`r`n"
}

function Read-EnvValue {
  param(
    [string]$Content,
    [string]$Key
  )
  $escapedKey = [regex]::Escape($Key)
  $match = [regex]::Match($Content, "(?m)^$escapedKey\s*=\s*""?([^""`r`n]*)""?\s*$")
  if ($match.Success) {
    return $match.Groups[1].Value
  }
  return ""
}

function Ensure-EnvReady {
  param([string]$WebDir)

  $envPath = Join-Path $WebDir ".env"
  $envExamplePath = Join-Path $WebDir ".env.example"

  if (-not (Test-Path $envPath)) {
    if (-not (Test-Path $envExamplePath)) {
      Fail "Nao encontrei '$envPath' nem '$envExamplePath'."
    }
    Write-Step "Criando .env a partir do .env.example..."
    Copy-Item -Path $envExamplePath -Destination $envPath -Force
  }

  $content = Get-Content $envPath -Raw
  $changed = $false

  $sessionSecret = Read-EnvValue -Content $content -Key "SESSION_SECRET"
  if ([string]::IsNullOrWhiteSpace($sessionSecret) -or $sessionSecret -eq "GERAR_UMA_CHAVE_FORTE_DE_32+_CARACTERES") {
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $bytes = New-Object byte[] 48
    $rng.GetBytes($bytes)
    $rng.Dispose()
    $sessionSecret = [Convert]::ToBase64String($bytes)
    $content = Update-EnvValue -Content $content -Key "SESSION_SECRET" -Value $sessionSecret
    $changed = $true
  }

  $seedPassword = Read-EnvValue -Content $content -Key "SEED_DEFAULT_PASSWORD"
  if ([string]::IsNullOrWhiteSpace($seedPassword)) {
    $seedPassword = "Demo@123456"
    $content = Update-EnvValue -Content $content -Key "SEED_DEFAULT_PASSWORD" -Value $seedPassword
    $changed = $true
  }

  if ($changed) {
    Set-Content -Path $envPath -Value $content -Encoding UTF8
  }

  return @{
    EnvPath = $envPath
    SeedPassword = $seedPassword
  }
}

function Parse-DatabaseConfig {
  param([string]$EnvContent)

  $match = [regex]::Match($EnvContent, '(?m)^DATABASE_URL\s*=\s*"?([^"\r\n]+)"?\s*$')
  if (-not $match.Success) {
    Fail "DATABASE_URL nao encontrada no arquivo .env."
  }

  $databaseUrl = $match.Groups[1].Value.Trim()
  try {
    $builder = [System.UriBuilder]$databaseUrl
  } catch {
    Fail "DATABASE_URL invalida: $databaseUrl"
  }

  $dbName = $builder.Path.Trim("/")
  if ([string]::IsNullOrWhiteSpace($dbName)) {
    Fail "DATABASE_URL sem nome de banco."
  }

  $dbHost = if ([string]::IsNullOrWhiteSpace($builder.Host)) { "localhost" } else { $builder.Host }
  $dbPort = if ($builder.Port -gt 0) { $builder.Port } else { 3306 }
  $dbUser = if ([string]::IsNullOrWhiteSpace($builder.UserName)) { "root" } else { $builder.UserName }
  $dbPass = $builder.Password

  return @{
    DatabaseUrl = $databaseUrl
    Host = $dbHost
    Port = $dbPort
    User = $dbUser
    Password = $dbPass
    Database = $dbName
  }
}

function Find-XamppRoot {
  $candidates = @(
    $env:XAMPP_HOME,
    "C:\xampp",
    "D:\xampp",
    "C:\Program Files\xampp"
  ) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }

  foreach ($candidate in $candidates) {
    $mysqlExePath = Join-Path $candidate "mysql\bin\mysql.exe"
    if (Test-Path $mysqlExePath) {
      return $candidate
    }
  }
  return $null
}

function Start-XamppMySqlIfNeeded {
  param([string]$XamppRoot)

  if (Test-LocalPort -Port 3306) {
    return
  }

  $starter = Join-Path $XamppRoot "mysql_start.bat"
  if (-not (Test-Path $starter)) {
    Fail "MySQL nao esta ativo na porta 3306 e nao encontrei '$starter'."
  }

  Write-Step "Iniciando MySQL do XAMPP..."
  Start-Process -FilePath $starter -WindowStyle Hidden | Out-Null

  if (-not (Wait-LocalPort -Port 3306 -TimeoutSec 45)) {
    Fail "Nao consegui iniciar o MySQL na porta 3306."
  }
}

function Resolve-MySqlCli {
  param([string]$XamppRoot)

  $fromPath = Get-Command mysql.exe -ErrorAction SilentlyContinue
  if ($fromPath) {
    return $fromPath.Source
  }

  $xamppCli = Join-Path $XamppRoot "mysql\bin\mysql.exe"
  if (Test-Path $xamppCli) {
    return $xamppCli
  }

  Fail "Nao encontrei mysql.exe. Instale o XAMPP ou adicione o MySQL ao PATH."
}

function Ensure-DatabaseExists {
  param(
    [hashtable]$DbConfig,
    [string]$MySqlCli
  )

  $sql = "CREATE DATABASE IF NOT EXISTS ``$($DbConfig.Database)`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  $args = @(
    "--protocol=TCP",
    "-h", $DbConfig.Host,
    "-P", "$($DbConfig.Port)",
    "-u", $DbConfig.User,
    "-e", $sql
  )

  if (-not [string]::IsNullOrWhiteSpace($DbConfig.Password)) {
    $env:MYSQL_PWD = $DbConfig.Password
  }

  try {
    & $MySqlCli @args
    if ($LASTEXITCODE -ne 0) {
      Fail "Falha ao criar/verificar o banco '$($DbConfig.Database)'."
    }
  } finally {
    Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue
  }
}

function Run-NpmScript {
  param(
    [string]$ScriptName,
    [string]$WebDir,
    [string]$NpmCmd
  )
  Write-Step "Executando npm run $ScriptName..."
  Push-Location $WebDir
  try {
    & $NpmCmd run $ScriptName
    if ($LASTEXITCODE -ne 0) {
      Fail "Script 'npm run $ScriptName' falhou."
    }
  } finally {
    Pop-Location
  }
}

function Ensure-Dependencies {
  param(
    [string]$WebDir,
    [string]$NpmCmd
  )

  $nodeModulesPath = Join-Path $WebDir "node_modules"
  if (Test-Path $nodeModulesPath) {
    Write-Step "Dependencias ja instaladas. Pulando npm install."
    return
  }

  Write-Step "Instalando dependencias (npm install)..."
  Push-Location $WebDir
  try {
    & $NpmCmd install --no-fund --no-audit
    if ($LASTEXITCODE -ne 0) {
      Fail "Falha ao instalar dependencias."
    }
  } finally {
    Pop-Location
  }
}

function Start-DevServer {
  param(
    [string]$WebDir,
    [string]$NpmCmd
  )

  if (Test-LocalPort -Port 3000) {
    Write-Step "Servidor ja estava ativo na porta 3000."
    return
  }

  Write-Step "Iniciando aplicacao (npm run dev)..."
  $stdoutPath = Join-Path $WebDir "dev-server.log"
  $stderrPath = Join-Path $WebDir "dev-server.err.log"

  if (Test-Path $stdoutPath) { Remove-Item $stdoutPath -Force -ErrorAction SilentlyContinue }
  if (Test-Path $stderrPath) { Remove-Item $stderrPath -Force -ErrorAction SilentlyContinue }

  Start-Process -FilePath $NpmCmd `
    -ArgumentList @("run", "dev") `
    -WorkingDirectory $WebDir `
    -WindowStyle Hidden `
    -RedirectStandardOutput $stdoutPath `
    -RedirectStandardError $stderrPath | Out-Null

  if (-not (Wait-LocalPort -Port 3000 -TimeoutSec 90)) {
    $errorTail = ""
    if (Test-Path $stderrPath) {
      $errorTail = (Get-Content $stderrPath -Tail 30 -ErrorAction SilentlyContinue) -join "`n"
    }
    Fail "Servidor nao subiu na porta 3000.`n$errorTail"
  }
}

try {
  $projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
  $webDir = Join-Path $projectRoot "web"
  if (-not (Test-Path $webDir)) {
    Fail "Diretorio 'web' nao encontrado em $projectRoot."
  }

  Write-Host "BarberSaaS - Inicializacao com 1 clique" -ForegroundColor Yellow
  $nodeToolchain = Resolve-NodeToolchain
  $env:Path = "$($nodeToolchain.BinDir);$env:Path"

  $envSetup = Ensure-EnvReady -WebDir $webDir
  $envContent = Get-Content $envSetup.EnvPath -Raw
  $dbConfig = Parse-DatabaseConfig -EnvContent $envContent
  $env:DATABASE_URL = $dbConfig.DatabaseUrl
  $env:SEED_DEFAULT_PASSWORD = $envSetup.SeedPassword

  $xamppRoot = Find-XamppRoot
  if ($null -eq $xamppRoot) {
    Fail "XAMPP nao encontrado. Instale em C:\\xampp ou defina XAMPP_HOME."
  }

  Start-XamppMySqlIfNeeded -XamppRoot $xamppRoot
  $mysqlCli = Resolve-MySqlCli -XamppRoot $xamppRoot
  Ensure-DatabaseExists -DbConfig $dbConfig -MySqlCli $mysqlCli

  Ensure-Dependencies -WebDir $webDir -NpmCmd $nodeToolchain.NpmCmd
  Run-NpmScript -ScriptName "prisma:generate" -WebDir $webDir -NpmCmd $nodeToolchain.NpmCmd
  Run-NpmScript -ScriptName "db:push" -WebDir $webDir -NpmCmd $nodeToolchain.NpmCmd
  Run-NpmScript -ScriptName "db:seed" -WebDir $webDir -NpmCmd $nodeToolchain.NpmCmd
  Start-DevServer -WebDir $webDir -NpmCmd $nodeToolchain.NpmCmd

  Start-Process "http://localhost:3000" | Out-Null

  Write-Host ""
  Write-Host "Sistema pronto em: http://localhost:3000" -ForegroundColor Green
  Write-Host "Logins de demonstracao:" -ForegroundColor Green
  Write-Host "  admin@barbersaas.com"
  Write-Host "  cliente@barbersaas.com"
  Write-Host "  ricardo@barbersaas.com / bruno@barbersaas.com / lucas@barbersaas.com"
  Write-Host "Senha para todos: $($envSetup.SeedPassword)" -ForegroundColor Green
} catch {
  Fail $_.Exception.Message
}
