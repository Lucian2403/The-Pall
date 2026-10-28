<#
Install the permitted typefaces from the ORIGINAL owner-supplied UI kit ZIP.
Never redistribute or select the non-commercial CF Industrial Fabrics or
personal-use Stranger Friz files.

New Standard's original CFF OTF is rejected by Chromium. This script converts
that local original into browser-safe WOFF2 using scripts/convert-owner-new-standard.py.
The conversion is performed on the owner's device; no font binaries are placed
in GitHub or shared in chat.
Usage from platform:
  powershell -ExecutionPolicy Bypass -File .\scripts\install-owner-fonts.ps1 -KitZip "$env:USERPROFILE\Downloads\The-Pall-UI-Kit-v1.zip"
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$KitZip
)
$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $KitZip -PathType Leaf)) {
  throw "Owner UI kit not found: $KitZip"
}

$platformRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$target = Join-Path $platformRoot 'apps\web\static\ui-kit'
$fontTarget = Join-Path $target 'fonts'
$licenseTarget = Join-Path $target 'licenses'
New-Item -ItemType Directory -Path $fontTarget, $licenseTarget -Force | Out-Null
$temp = Join-Path ([IO.Path]::GetTempPath()) ('pall-owner-fonts-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $temp -Force | Out-Null

try {
  Expand-Archive -LiteralPath $KitZip -DestinationPath $temp -Force
  $root = Join-Path $temp 'The-Pall-UI-Kit-v1\fonts'
  if (-not (Test-Path -LiteralPath $root -PathType Container)) {
    throw 'Expected The-Pall-UI-Kit-v1/fonts inside the supplied ZIP.'
  }
  $fontSources = @(
    @{ Archive='new-standard.zip'; Name='NewStandard-Regular.otf'; Output='new-standard-regular.otf'; License='OFL.txt'; LicenseOutput='NEW-STANDARD-OFL.txt' },
    @{ Archive='bebas-neue-2014-font.zip'; Name='BebasNeueRegular-gxj83.ttf'; Output='bebas-neue-regular.ttf'; License='misc/OFL-58d7.txt'; LicenseOutput='BEBAS-NEUE-OFL.txt' },
    @{ Archive='bebas-neue-2014-font.zip'; Name='BebasNeueBold-7B9LE.ttf'; Output='bebas-neue-bold.ttf'; License='misc/OFL-58d7.txt'; LicenseOutput='BEBAS-NEUE-OFL.txt' },
    @{ Archive='beyond-wonderland.zip'; Name='Beyond Wonderland.ttf'; Output='beyond-wonderland.ttf'; License='readme.txt'; LicenseOutput='BEYOND-WONDERLAND-LICENSE.txt' }
  )
  foreach ($font in $fontSources) {
    $archivePath = Join-Path $root $font.Archive
    $unpacked = Join-Path $temp ('expanded-' + $font.Archive.Replace('.zip',''))
    if (-not (Test-Path -LiteralPath $unpacked)) {
      Expand-Archive -LiteralPath $archivePath -DestinationPath $unpacked -Force
    }
    $source = Join-Path $unpacked $font.Name
    $license = Join-Path $unpacked $font.License
    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) {
      throw "Expected font missing from original archive: $($font.Name)"
    }
    if (-not (Test-Path -LiteralPath $license -PathType Leaf)) {
      throw "Font license missing from original archive: $($font.License)"
    }
    Copy-Item -LiteralPath $source -Destination (Join-Path $fontTarget $font.Output) -Force
    Copy-Item -LiteralPath $license -Destination (Join-Path $licenseTarget $font.LicenseOutput) -Force
  }

  # Convert malformed Chromium CFF to quadratic TrueType outlines.
  $python = Get-Command 'py' -ErrorAction SilentlyContinue
  $arguments = @()
  if ($python) {
    $pythonExe = $python.Source
    $arguments = @('-3')
  } else {
    $python = Get-Command 'python' -ErrorAction SilentlyContinue
    if (-not $python) {
      throw 'Python 3 is required to repair the supplied New Standard CFF font. Install Python 3 and rerun this script.'
    }
    $pythonExe = $python.Source
  }

  & $pythonExe @arguments -c 'import fontTools, brotli' 2>$null
  if ($LASTEXITCODE -ne 0) {
    Write-Host 'Installing Python fonttools and brotli for the one-time local New Standard conversion…'
    & $pythonExe @arguments -m pip install --user fonttools brotli --disable-pip-version-check
    if ($LASTEXITCODE -ne 0) {
      throw 'Python dependency setup failed. The original New Standard OTF will not work in Chromium.'
    }
  }

  $converter = Join-Path $PSScriptRoot 'convert-owner-new-standard.py'
  $original = Join-Path $fontTarget 'new-standard-regular.otf'
  $converted = Join-Path $fontTarget 'new-standard-regular.woff2'
  & $pythonExe @arguments $converter $original $converted
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $converted -PathType Leaf)) {
    throw 'The local New Standard WOFF2 conversion did not succeed.'
  }
  Write-Host 'Installed owner New Standard (repaired WOFF2), Bebas Neue and Beyond Wonderland.'
  Write-Host 'Restricted fonts were not installed. Included license texts were preserved.'
  Write-Host "Font directory: $fontTarget"
} finally {
  if (Test-Path -LiteralPath $temp) {
    Remove-Item -LiteralPath $temp -Recurse -Force
  }
}
