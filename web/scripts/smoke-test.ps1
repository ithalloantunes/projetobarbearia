$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$workingDir = Resolve-Path (Join-Path $scriptDir "..")
$port = 3011
$stdoutLog = Join-Path $workingDir "smoke-server.log"
$stderrLog = Join-Path $workingDir "smoke-server.err.log"

if (-not $env:DATABASE_URL) {
  $env:DATABASE_URL = "mysql://root:root@127.0.0.1:3306/barbersaas"
}
if (-not $env:SESSION_SECRET) {
  $env:SESSION_SECRET = "smoke-session-secret-0123456789abcdef"
}
if (-not $env:APP_BASE_URL) {
  $env:APP_BASE_URL = "http://localhost:$port"
}

if (Test-Path $stdoutLog) { Remove-Item $stdoutLog -Force }
if (Test-Path $stderrLog) { Remove-Item $stderrLog -Force }

$serverProcess = Start-Process `
  -FilePath "npm.cmd" `
  -ArgumentList "run", "start", "--", "-p", "$port" `
  -WorkingDirectory $workingDir `
  -PassThru `
  -RedirectStandardOutput $stdoutLog `
  -RedirectStandardError $stderrLog

try {
  Start-Sleep -Seconds 10

  $targets = @(
    @{ Url = "http://localhost:$port/"; AllowedStatus = @(200) },
    @{ Url = "http://localhost:$port/entrar"; AllowedStatus = @(200, 307, 308) },
    @{ Url = "http://localhost:$port/agendar"; AllowedStatus = @(307, 308) },
    @{ Url = "http://localhost:$port/api/health"; AllowedStatus = @(200, 503) },
    @{ Url = "http://localhost:$port/api/services"; AllowedStatus = @(200, 503) },
    @{ Url = "http://localhost:$port/api/barbers"; AllowedStatus = @(200, 503) },
    @{ Url = "http://localhost:$port/api/auth/session"; AllowedStatus = @(401) }
  )

  $failed = 0
  foreach ($target in $targets) {
    try {
      $response = Invoke-WebRequest -Uri $target.Url -UseBasicParsing -TimeoutSec 20
      $status = [int]$response.StatusCode
      if ($target.AllowedStatus -contains $status) {
        Write-Output "OK $status $($target.Url)"
      } else {
        $failed += 1
        Write-Output "ERR UNEXPECTED_$status $($target.Url)"
      }
    } catch {
      if ($_.Exception.Response) {
        $status = [int]$_.Exception.Response.StatusCode
        if ($target.AllowedStatus -contains $status) {
          Write-Output "OK $status $($target.Url)"
        } else {
          $failed += 1
          Write-Output "ERR UNEXPECTED_$status $($target.Url)"
        }
      } else {
        $failed += 1
        Write-Output "ERR NO_RESPONSE $($target.Url)"
      }
    }
  }

  if ($failed -gt 0) {
    throw "Smoke falhou em $failed endpoint(s)."
  }
} finally {
  if ($serverProcess -and -not $serverProcess.HasExited) {
    Stop-Process -Id $serverProcess.Id -Force
  }

  if (Test-Path $stdoutLog) {
    Write-Output "--- SERVER STDOUT ---"
    Get-Content $stdoutLog
  }
  if (Test-Path $stderrLog) {
    Write-Output "--- SERVER STDERR ---"
    Get-Content $stderrLog
  }
}
