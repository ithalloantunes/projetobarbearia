$ErrorActionPreference = "Stop"

$workingDir = "c:\Users\0220482422005\Desktop\projetobarbearia-main\web"
$port = 3011
$stdoutLog = Join-Path $workingDir "smoke-server.log"
$stderrLog = Join-Path $workingDir "smoke-server.err.log"
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
    "http://localhost:$port/",
    "http://localhost:$port/agendar",
    "http://localhost:$port/admin",
    "http://localhost:$port/barbeiro",
    "http://localhost:$port/api/services",
    "http://localhost:$port/api/barbers",
    "http://localhost:$port/api/appointments?dateFrom=2026-03-23&dateTo=2026-03-23",
    "http://localhost:$port/api/blocks?dateFrom=2026-03-23&dateTo=2026-03-23",
    "http://localhost:$port/api/admin/metrics"
  )

  foreach ($target in $targets) {
    try {
      $response = Invoke-WebRequest -Uri $target -UseBasicParsing -TimeoutSec 20
      Write-Output "OK $($response.StatusCode) $target"
    } catch {
      if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
        Write-Output "ERR $statusCode $target"
      } else {
        Write-Output "ERR NO_RESPONSE $target"
      }
    }
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
