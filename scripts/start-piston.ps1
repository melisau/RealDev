$ErrorActionPreference = 'Stop'
$compose = Join-Path (Split-Path $PSScriptRoot -Parent) 'docker-compose.piston.yml'
docker compose -f $compose up -d
if ($LASTEXITCODE -ne 0) { throw 'Docker Compose could not start Piston. Confirm Docker Desktop is running with the Linux container engine.' }

$base = 'http://127.0.0.1:2000/api/v2'
$ready = $false
for ($i = 0; $i -lt 60; $i++) {
  try { Invoke-RestMethod "$base/runtimes" -TimeoutSec 3 | Out-Null; $ready = $true; break } catch { Start-Sleep -Seconds 2 }
}
if (-not $ready) { throw 'Piston API did not become ready on localhost:2000.' }

$available = Invoke-RestMethod "$base/runtimes"
$packages = Invoke-RestMethod "$base/packages"
$wanted = @(
  @{ id = 'Python'; names = @('python'); packages = @('python'); version = '3.12.0' },
  @{ id = 'C#'; names = @('csharp'); packages = @('mono'); version = '6.12.0' },
  @{ id = 'Java'; names = @('java'); packages = @('java'); version = '15.0.2' }
)
foreach ($language in $wanted) {
  $installed = @($available | Where-Object { ($language.names -contains $_.language -or @($_.aliases | Where-Object { $language.names -contains $_ }).Count -gt 0) -and $_.version -eq $language.version }).Count -gt 0
  if ($installed) { Write-Host "$($language.id) $($language.version) runtime is already installed."; continue }
  $package = $packages | Where-Object { $language.packages -contains $_.language -and $_.language_version -eq $language.version } | Select-Object -First 1
  if (-not $package) { $package = $packages | Where-Object { $language.packages -contains $_.language } | Select-Object -First 1 }
  if (-not $package) { Write-Warning "Piston does not list a package for $($language.id); skipping."; continue }
  Write-Host "Installing $($package.language) $($package.language_version)..."
  $body = @{ language = $package.language; version = $package.language_version } | ConvertTo-Json
  Invoke-RestMethod -Method Post -Uri "$base/packages" -ContentType 'application/json' -Body $body | Out-Null
}

Write-Host 'Piston setup complete. API is bound to 127.0.0.1:2000; it is not exposed to the network.'
