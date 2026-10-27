<#
Installs only owner-supplied UI art and commercially permitted fonts into this
local development checkout. Does not download files or modify the database.
Run from The-Pall\platform, e.g.
  powershell -ExecutionPolicy Bypass -File scripts/install-owner-ui-kit.ps1 -KitZip "$env:USERPROFILE\Downloads\The-Pall-UI-Kit-v1.zip" -SidebarImage "$env:USERPROFILE\Downloads\the_pall_sidebar_illustration_transparent.png"

The supplied font archives contain different licenses:
  Bebas Neue: SIL OFL
  New Standard: SIL OFL
  Beyond Wonderland: readme permits commercial use
  CF Industrial Fabrics: freeware non-commercial ONLY -- do not install
  Stranger Friz: personal use ONLY -- do not install
Never silently copy the last two to a commercial/distributable build.
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$KitZip,
  [string]$SidebarImage,
  [string]$AvatarDirectory
)
$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $KitZip -PathType Leaf)) { throw "UI kit ZIP not found: $KitZip" }
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$target = Join-Path $projectRoot 'apps\web\static\ui-kit'
$temp = Join-Path ([System.IO.Path]::GetTempPath()) ('the-pall-ui-kit-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $temp -Force | Out-Null
try {
  Expand-Archive -LiteralPath $KitZip -DestinationPath $temp -Force
  $source = Join-Path $temp 'The-Pall-UI-Kit-v1'
  if (-not (Test-Path -LiteralPath $source -PathType Container)) { throw 'Unexpected ZIP layout. Expected The-Pall-UI-Kit-v1 root directory.' }
  foreach ($relative in @(
    'branding\logo-full.png',
    'branding\logo-compact.png',
    'frames\dialogue-frame.png',
    'buttons\button-normal.png',
    'buttons\button-hover.png',
    'buttons\button-pressed.png',
    'resources\bar-empty.png',
    'resources\hp-fill.png',
    'resources\stamina-fill.png',
    'resources\fatigue-fill.png',
    'resources\TheCityVista.png'
  )) {
    $src = Join-Path $source $relative
    if (-not (Test-Path -LiteralPath $src -PathType Leaf)) { throw "Required asset not found: $relative" }
    $dest = Join-Path $target $relative
    New-Item -ItemType Directory -Path (Split-Path $dest -Parent) -Force | Out-Null
    Copy-Item -LiteralPath $src -Destination $dest -Force
  }
  # Source PNGs have large fully transparent gutters. Keep originals intact,
  # but generate tightly cropped versions for proper CSS nine-slice rendering.
  # Coordinates measured on the owner's exact v1 supplied PNGs. This uses the
  # Windows System.Drawing assembly; no third-party crop package is required.
  Add-Type -AssemblyName System.Drawing
  foreach ($spec in @(
    @{ From='frames\dialogue-frame.png'; To='frames\dialogue-frame-trim.png'; Left=48; Top=99; Width=1936; Height=551 },
    @{ From='buttons\button-normal.png'; To='buttons\button-normal-trim.png'; Left=13; Top=13; Width=1261; Height=203 },
    @{ From='buttons\button-hover.png'; To='buttons\button-hover-trim.png'; Left=13; Top=11; Width=1261; Height=205 },
    @{ From='buttons\button-pressed.png'; To='buttons\button-pressed-trim.png'; Left=13; Top=11; Width=1261; Height=207 }
  )) {
    $src = Join-Path $target $spec.From
    $dest = Join-Path $target $spec.To
    $bitmap = [System.Drawing.Bitmap]::FromFile($src)
    try {
      if ($bitmap.Width -lt ($spec.Left + $spec.Width) -or
          $bitmap.Height -lt ($spec.Top + $spec.Height)) {
        throw "Unexpected dimensions for owner's UI image: $($spec.From)"
      }
      $rect = New-Object System.Drawing.Rectangle(
        [int]$spec.Left, [int]$spec.Top, [int]$spec.Width, [int]$spec.Height
      )
      $cutout = $bitmap.Clone($rect,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
      try {
        $cutout.Save($dest,[System.Drawing.Imaging.ImageFormat]::Png)
      } finally { $cutout.Dispose() }
    } finally { $bitmap.Dispose() }
  }
  Write-Host 'Generated four alpha-trimmed dialogue/button PNGs for proportional nine-slice scaling.'
  $fonts = Join-Path $target 'fonts'
  New-Item -ItemType Directory -Path $fonts -Force | Out-Null
  $allowed = @(
    @{ Zip='new-standard.zip'; Source='NewStandard-Regular.otf'; Name='new-standard-regular.otf'; License='OFL.txt'; LicenseFile='NEW-STANDARD-OFL.txt' },
    @{ Zip='bebas-neue-2014-font.zip'; Source='BebasNeueRegular-X34j2.otf'; Name='bebas-neue-regular.otf'; License='misc/OFL-58d7.txt'; LicenseFile='BEBAS-NEUE-OFL.txt' },
    @{ Zip='bebas-neue-2014-font.zip'; Source='BebasNeueBold-w1w42.otf'; Name='bebas-neue-bold.otf'; License='misc/OFL-58d7.txt'; LicenseFile='BEBAS-NEUE-OFL.txt' },
    @{ Zip='beyond-wonderland.zip'; Source='Beyond Wonderland.ttf'; Name='beyond-wonderland.ttf'; License='readme.txt'; LicenseFile='BEYOND-WONDERLAND-LICENSE.txt' }
  )
  foreach ($font in $allowed) {
    $nestedZip = Join-Path (Join-Path $source 'fonts') $font.Zip
    $nestedDir = Join-Path $temp ([System.IO.Path]::GetFileNameWithoutExtension($font.Zip))
    if (-not (Test-Path -LiteralPath $nestedDir)) {
      Expand-Archive -LiteralPath $nestedZip -DestinationPath $nestedDir -Force
    }
    $f = Join-Path $nestedDir $font.Source
    if (-not (Test-Path -LiteralPath $f)) { throw "Font not found inside $($font.Zip): $($font.Source)" }
    Copy-Item -LiteralPath $f -Destination (Join-Path $fonts $font.Name) -Force
    $license = Join-Path $nestedDir $font.License
    if (Test-Path -LiteralPath $license) {
      $licenseDir = Join-Path $target 'licenses'
      New-Item -ItemType Directory -Path $licenseDir -Force | Out-Null
      Copy-Item -LiteralPath $license -Destination (Join-Path $licenseDir $font.LicenseFile) -Force
    }
  }
  if ($SidebarImage) {
    if (-not (Test-Path -LiteralPath $SidebarImage -PathType Leaf)) { throw "Sidebar illustration not found: $SidebarImage" }
    Copy-Item -LiteralPath $SidebarImage -Destination (Join-Path $target 'sidebar-illustration.png') -Force
  } else {
    Write-Warning "Sidebar illustration not specified: rail footer will use its original fallback until you install it."
  }
  if ($AvatarDirectory) {
    if (-not (Test-Path -LiteralPath $AvatarDirectory -PathType Container)) {
      throw "Avatar directory not found: $AvatarDirectory"
    }
    $portraits = @(Get-ChildItem -LiteralPath $AvatarDirectory -File |
      Where-Object { $_.Extension -in @('.png','.webp') })
    if ($portraits.Count -eq 0) { throw 'The avatar directory contains no PNG or WebP files.' }
    $avatarTarget = Join-Path $target 'avatars'
    New-Item -ItemType Directory -Path $avatarTarget -Force | Out-Null
    foreach ($portrait in $portraits) {
      if ($portrait.Name -cnotmatch '^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}\.(png|webp)
  Write-Host "Location: $target"
  Write-Host 'Restart the web development server and run npm run check:web.'
} finally {
  if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp -Recurse -Force }
}
) {
        throw "Invalid portrait filename: $($portrait.Name). Use one simple shared avatar ID per filename."
      }
      Copy-Item -LiteralPath $portrait.FullName -Destination (Join-Path $avatarTarget $portrait.Name) -Force
    }
    Write-Host "Installed $($portraits.Count) universal avatar portraits. None are tied to any origin."
  }
  Write-Host "The Pall UI kit installed. Licensed fonts only; no non-commercial fonts copied."
  Write-Host "Location: $target"
  Write-Host 'Restart the web development server and run npm run check:web.'
} finally {
  if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp -Recurse -Force }
}
