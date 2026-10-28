<#
Install commercially usable fonts from the owner's UI kit, with NO Python.

Usual one-command install (the original ZIP already contains New Standard OTF):
  powershell -ExecutionPolicy Bypass -File .\scripts\install-owner-fonts.ps1 `
    -KitZip "$env:USERPROFILE\Downloads\The-Pall-UI-Kit-v1.zip"

Alternatively, use a separately saved owner New Standard OTF:
  powershell -ExecutionPolicy Bypass -File .\scripts\install-owner-fonts.ps1 `
    -NewStandardOtf "$env:USERPROFILE\Downloads\NewStandard-Regular.otf"

Or supply a genuinely TrueType-outline WOFF2 directly using -NewStandardWoff2.
Conversion uses installed Node.js, a temporary pinned MIT-licensed npm package,
and NO Python, pip, online font-upload service or repository lockfile edits.
Font binaries remain local and must never be published to GitHub.
#>
[CmdletBinding()]
param(
  [string]$KitZip,
  [string]$NewStandardWoff2,
  [string]$NewStandardOtf
)
$ErrorActionPreference = 'Stop'
if (-not $KitZip -and -not $NewStandardWoff2 -and -not $NewStandardOtf) {
  throw 'Specify the original -KitZip, a separate -NewStandardOtf, or -NewStandardWoff2.'
}

$platformRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$target = Join-Path $platformRoot 'apps\web\static\ui-kit'
$fontTarget = Join-Path $target 'fonts'
$licenseTarget = Join-Path $target 'licenses'
New-Item -ItemType Directory -Path $fontTarget,$licenseTarget -Force | Out-Null

$sourceOtf = $null
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
      @{Archive='new-standard.zip'; Files=@('NewStandard-Regular.otf'); Output='new-standard-regular.otf'; License='OFL.txt'; Notice='NEW-STANDARD-OFL.txt'},
      @{Archive='bebas-neue-2014-font.zip'; Files=@('BebasNeueRegular-gxj83.ttf','BebasNeueRegular-X34j2.otf'); Output=''; License='misc/OFL-58d7.txt'; Notice='BEBAS-NEUE-OFL.txt'},
      @{Archive='bebas-neue-2014-font.zip'; Files=@('BebasNeueBold-7B9LE.ttf','BebasNeueBold-w1w42.otf'); Output=''; License='misc/OFL-58d7.txt'; Notice='BEBAS-NEUE-OFL.txt'},
      @{Archive='beyond-wonderland.zip'; Files=@('Beyond Wonderland.ttf'); Output='beyond-wonderland.ttf'; License='readme.txt'; Notice='BEYOND-WONDERLAND-LICENSE.txt'}
    )
    foreach ($entry in $licensed) {
      $archive = Join-Path $sourceRoot $entry.Archive
      $dir = Join-Path $temp ('expanded-'+$entry.Archive.Replace('.zip',''))
      if (-not (Test-Path -LiteralPath $dir -PathType Container)) {
        Expand-Archive -LiteralPath $archive -DestinationPath $dir -Force
      }
      $license = Join-Path $dir $entry.License
      if (-not (Test-Path -LiteralPath $license -PathType Leaf)) {
        throw "Missing owner font license for: $($entry.Archive)"
      }
      Copy-Item -LiteralPath $license -Destination (Join-Path $licenseTarget $entry.Notice) -Force
      $chosen=$null
      foreach ($candidate in $entry.Files) {
        if (Test-Path -LiteralPath (Join-Path $dir $candidate) -PathType Leaf) {
          $chosen=$candidate
          break
        }
      }
      if (-not $chosen) {
        throw "No expected licensed font found in: $($entry.Archive)"
      }
      if ($entry.Output) {
        $outName=$entry.Output
      } elseif ($chosen -match 'Bold') {
        $outName='bebas-neue-bold'+[IO.Path]::GetExtension($chosen).ToLowerInvariant()
      } else {
        $outName='bebas-neue-regular'+[IO.Path]::GetExtension($chosen).ToLowerInvariant()
      }
      Copy-Item -LiteralPath (Join-Path $dir $chosen) -Destination (Join-Path $fontTarget $outName) -Force
    }
    $sourceOtf=Join-Path $fontTarget 'new-standard-regular.otf'
    Write-Host 'Restored original licensed font sources and license notices.'
  } finally {
    if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp -Recurse -Force }
  }
}

$destination=Join-Path $fontTarget 'new-standard-regular.woff2'
if ($NewStandardWoff2) {
  if (-not (Test-Path -LiteralPath $NewStandardWoff2 -PathType Leaf)) {
    throw "The supplied WOFF2 does not exist: $NewStandardWoff2"
  }
  $bytes=[IO.File]::ReadAllBytes((Resolve-Path -LiteralPath $NewStandardWoff2).Path)
  if ($bytes.Length -lt 4096 -or
      [Text.Encoding]::ASCII.GetString($bytes,0,4) -ne 'wOF2' -or
      $bytes[4] -ne 0 -or $bytes[5] -ne 1 -or
      $bytes[6] -ne 0 -or $bytes[7] -ne 0) {
    throw 'New Standard must be genuine TrueType-outline WOFF2, not repacked CFF.'
  }
  Copy-Item -LiteralPath $NewStandardWoff2 -Destination $destination -Force
  Write-Host "Installed owner New Standard WOFF2: $destination"
} else {
  if ($NewStandardOtf) {
    if (-not (Test-Path -LiteralPath $NewStandardOtf -PathType Leaf)) {
      throw "The original New Standard OTF is missing: $NewStandardOtf"
    }
    $sourceOtf=(Resolve-Path -LiteralPath $NewStandardOtf).Path
  }
  if (-not $sourceOtf) { throw 'No New Standard OTF was found in the supplied inputs.' }

  $node=Get-Command node.exe -ErrorAction SilentlyContinue
  $npm=Get-Command npm.cmd -ErrorAction SilentlyContinue
  if (-not $node -or -not $npm) {
    throw 'Node.js and npm are required; use your existing The Pall Node installation.'
  }
  # Tooling stays outside the workspace and never changes npm's package-lock.
  $cache=Join-Path ([IO.Path]::GetTempPath()) 'the-pall-font-converter-v2.6.3'
  $editor=Join-Path $cache 'node_modules\fonteditor-core\package.json'
  if (-not (Test-Path -LiteralPath $editor -PathType Leaf)) {
    Write-Host 'Installing the one-time Node font converter in the Windows temporary folder…'
    New-Item -ItemType Directory -Path $cache -Force | Out-Null
    & $npm.Source install --prefix $cache --no-save --no-package-lock --ignore-scripts --no-audit --no-fund fonteditor-core@2.6.3
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $editor -PathType Leaf)) {
      throw 'Could not install the Node font conversion tool. Check npm connectivity or supply a working TrueType-outline WOFF2.'
    }
  }
  & $node.Source (Join-Path $PSScriptRoot 'convert-owner-new-standard-node.mjs') $sourceOtf $destination $cache
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $destination -PathType Leaf)) {
    throw 'New Standard conversion failed. No broken OpenType/CFF file was enabled.'
  }
}
if (-not (Test-Path -LiteralPath (Join-Path $licenseTarget 'NEW-STANDARD-OFL.txt'))) {
  Write-Warning 'Keep the New Standard SIL OFL notice from the original archive with any distributed game.'
}
Write-Host 'Fonts installed locally. No Python, pip, or restricted-license font family was used.'
