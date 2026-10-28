<#
Install user-supplied web-ready New Standard without requiring Python.
Optional original UI kit import restores Bebas Neue, Beyond Wonderland, and
the original font license notices. Restricted-license font families are never
installed.

From The-Pall\platform, for an already-installed kit:
  powershell -ExecutionPolicy Bypass -File .\scripts\install-owner-fonts.ps1 `
    -NewStandardWoff2 "$env:USERPROFILE\Downloads\NewStandard-Regular.woff2"

Or to restore other fonts at the same time:
  powershell -ExecutionPolicy Bypass -File .\scripts\install-owner-fonts.ps1 `
    -KitZip "$env:USERPROFILE\Downloads\The-Pall-UI-Kit-v1.zip" `
    -NewStandardWoff2 "$env:USERPROFILE\Downloads\NewStandard-Regular.woff2"

New Standard MUST have genuine TrueType outlines (WOFF2 flavor 0x00010000).
A WOFF2 wrapper around the rejected OpenType/CFF source will not repair it.
The source is supplied by the owner, not distributed in the repository.
#>
[CmdletBinding()]
param(
  [string]$KitZip,
  [string]$NewStandardWoff2
)
$ErrorActionPreference = 'Stop'
if (-not $KitZip -and -not $NewStandardWoff2) {
  throw 'Specify -NewStandardWoff2 for the corrected web font, or -KitZip to restore the other owner fonts.'
}

$platformRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$target = Join-Path $platformRoot 'apps\web\static\ui-kit'
$fontTarget = Join-Path $target 'fonts'
$licenseTarget = Join-Path $target 'licenses'
New-Item -ItemType Directory -Path $fontTarget,$licenseTarget -Force | Out-Null

if ($KitZip) {
  if (-not (Test-Path -LiteralPath $KitZip -PathType Leaf)) {
    throw "Original UI ZIP not found: $KitZip"
  }
  $temp = Join-Path ([IO.Path]::GetTempPath()) ('pall-fonts-' + [guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Path $temp -Force | Out-Null
  try {
    Expand-Archive -LiteralPath $KitZip -DestinationPath $temp -Force
    $sourceRoot = Join-Path $temp 'The-Pall-UI-Kit-v1\fonts'
    if (-not (Test-Path -LiteralPath $sourceRoot -PathType Container)) {
      throw 'The font ZIP must contain The-Pall-UI-Kit-v1/fonts.'
    }

    $licensed = @(
      @{Archive='new-standard.zip'; Files=@(); Output=''; License='OFL.txt'; Notice='NEW-STANDARD-OFL.txt'},
      @{Archive='bebas-neue-2014-font.zip'; Files=@('BebasNeueRegular-gxj83.ttf','BebasNeueRegular-X34j2.otf'); License='misc/OFL-58d7.txt'; Notice='BEBAS-NEUE-OFL.txt'},
      @{Archive='bebas-neue-2014-font.zip'; Files=@('BebasNeueBold-7B9LE.ttf','BebasNeueBold-w1w42.otf'); License='misc/OFL-58d7.txt'; Notice='BEBAS-NEUE-OFL.txt'},
      @{Archive='beyond-wonderland.zip'; Files=@('Beyond Wonderland.ttf'); Output='beyond-wonderland.ttf'; License='readme.txt'; Notice='BEYOND-WONDERLAND-LICENSE.txt'}
    )
    foreach ($entry in $licensed) {
      $zip = Join-Path $sourceRoot $entry.Archive
      $dir = Join-Path $temp ('expanded-'+$entry.Archive.Replace('.zip',''))
      if (-not (Test-Path -LiteralPath $dir -PathType Container)) {
        Expand-Archive -LiteralPath $zip -DestinationPath $dir -Force
      }
      $license = Join-Path $dir $entry.License
      if (-not (Test-Path -LiteralPath $license -PathType Leaf)) {
        throw "Missing owner font license for: $($entry.Archive)"
      }
      Copy-Item -LiteralPath $license -Destination (Join-Path $licenseTarget $entry.Notice) -Force

      if ($entry.Files.Count -eq 0) { continue }
      $chosen = $null
      foreach ($candidate in $entry.Files) {
        if (Test-Path -LiteralPath (Join-Path $dir $candidate) -PathType Leaf) {
          $chosen = $candidate
          break
        }
      }
      if (-not $chosen) {
        throw "No compatible approved font found in $($entry.Archive)"
      }
      if ($entry.Output) {
        $outName = $entry.Output
      } elseif ($chosen -match 'Bold') {
        $outName = 'bebas-neue-bold'+[IO.Path]::GetExtension($chosen).ToLowerInvariant()
      } else {
        $outName = 'bebas-neue-regular'+[IO.Path]::GetExtension($chosen).ToLowerInvariant()
      }
      Copy-Item -LiteralPath (Join-Path $dir $chosen) -Destination (Join-Path $fontTarget $outName) -Force
    }
    Write-Host 'Restored licensed Bebas Neue and Beyond Wonderland, with original notices.'
  } finally {
    if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp -Recurse -Force }
  }
}

if ($NewStandardWoff2) {
  if (-not (Test-Path -LiteralPath $NewStandardWoff2 -PathType Leaf)) {
    throw "The supplied New Standard WOFF2 file does not exist: $NewStandardWoff2"
  }
  $bytes = [IO.File]::ReadAllBytes((Resolve-Path -LiteralPath $NewStandardWoff2).Path)
  if ($bytes.Length -lt 4096 -or
      [Text.Encoding]::ASCII.GetString($bytes,0,4) -ne 'wOF2' -or
      $bytes[4] -ne 0 -or $bytes[5] -ne 1 -or
      $bytes[6] -ne 0 -or $bytes[7] -ne 0) {
    throw 'New Standard must be a genuine TrueType-outline WOFF2 (wOF2 header, flavor 0x00010000); a repacked CFF/OTF is insufficient.'
  }
  $destination = Join-Path $fontTarget 'new-standard-regular.woff2'
  Copy-Item -LiteralPath $NewStandardWoff2 -Destination $destination -Force
  Write-Host "Installed New Standard WOFF2: $destination"
  if (-not (Test-Path -LiteralPath (Join-Path $licenseTarget 'NEW-STANDARD-OFL.txt'))) {
    Write-Warning 'Keep the original New Standard OFL license notice from your UI kit with any distributed version.'
  }
} elseif (-not (Test-Path -LiteralPath (Join-Path $fontTarget 'new-standard-regular.woff2'))) {
  Write-Warning 'New Standard is not yet installed. Dialogue safely uses Georgia until you supply a valid TrueType-outline WOFF2.'
}
Write-Host 'No Python, pip, or font conversion software required.'
