<#
Installs the owner's original UI assets, optional universal portraits and the
commercially permitted font families. Reads ONLY the user-supplied ZIP.
No account, saved character, database or quest state is changed.

Usage from The-Pall\platform:
  powershell -ExecutionPolicy Bypass -File .\scripts\install-owner-ui-kit.ps1 -KitZip "$env:USERPROFILE\Downloads\The-Pall-UI-Kit-v1.zip" -SidebarImage "$env:USERPROFILE\Downloads\the_pall_sidebar_illustration_transparent.png"

New Standard can be installed directly with -NewStandardWoff2 when the owner
supplies a TrueType-outline WOFF2. No Python or pip required; no fonts are
published through GitHub or chat. See install-owner-fonts.ps1.
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$KitZip,
  [string]$SidebarImage,
  [string]$AvatarDirectory,
  [string]$NewStandardWoff2
)
$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $KitZip -PathType Leaf)) {
  throw "Owner UI kit ZIP not found: $KitZip"
}
$platformRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$target = Join-Path $platformRoot 'apps\web\static\ui-kit'
$temp = Join-Path ([IO.Path]::GetTempPath()) ('pall-owner-ui-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $temp -Force | Out-Null

try {
  Expand-Archive -LiteralPath $KitZip -DestinationPath $temp -Force
  $source = Join-Path $temp 'The-Pall-UI-Kit-v1'
  if (-not (Test-Path -LiteralPath $source -PathType Container)) {
    throw 'The original ZIP must contain a The-Pall-UI-Kit-v1 directory.'
  }

  foreach ($relative in @(
    'branding\logo-full.png', 'branding\logo-compact.png',
    'frames\dialogue-frame.png',
    'buttons\button-normal.png', 'buttons\button-hover.png',
    'buttons\button-pressed.png',
    'resources\bar-empty.png', 'resources\hp-fill.png',
    'resources\stamina-fill.png', 'resources\fatigue-fill.png',
    'resources\TheCityVista.png'
  )) {
    $inputFile = Join-Path $source $relative
    if (-not (Test-Path -LiteralPath $inputFile -PathType Leaf)) {
      throw "Required owner asset missing: $relative"
    }
    $outputFile = Join-Path $target $relative
    New-Item -ItemType Directory -Path (Split-Path $outputFile -Parent) -Force | Out-Null
    Copy-Item -LiteralPath $inputFile -Destination $outputFile -Force
  }

  # Generate the alpha-trimmed versions used for CSS nine-slice backgrounds.
  # The source files remain unchanged. Exact crop regions of owner's v1 kit.
  Add-Type -AssemblyName System.Drawing
  foreach ($spec in @(
    @{From='frames\dialogue-frame.png';To='frames\dialogue-frame-trim.png';Left=48;Top=99;Width=1936;Height=551},
    @{From='buttons\button-normal.png';To='buttons\button-normal-trim.png';Left=13;Top=13;Width=1261;Height=203},
    @{From='buttons\button-hover.png';To='buttons\button-hover-trim.png';Left=13;Top=11;Width=1261;Height=205},
    @{From='buttons\button-pressed.png';To='buttons\button-pressed-trim.png';Left=13;Top=11;Width=1261;Height=207}
  )) {
    $inputFile = Join-Path $target $spec.From
    $outputFile = Join-Path $target $spec.To
    $bitmap = [Drawing.Bitmap]::FromFile($inputFile)
    try {
      if ($bitmap.Width -lt ($spec.Left + $spec.Width) -or
          $bitmap.Height -lt ($spec.Top + $spec.Height)) {
        throw "Unexpected dimensions in owner's UI art: $($spec.From)"
      }
      $rectangle = [Drawing.Rectangle]::new(
        [int]$spec.Left,[int]$spec.Top,[int]$spec.Width,[int]$spec.Height
      )
      $cropped = $bitmap.Clone(
        $rectangle,[Drawing.Imaging.PixelFormat]::Format32bppArgb
      )
      try {
        $cropped.Save($outputFile,[Drawing.Imaging.ImageFormat]::Png)
      } finally {
        $cropped.Dispose()
      }
    } finally {
      $bitmap.Dispose()
    }
  }

  if ($SidebarImage) {
    if (-not (Test-Path -LiteralPath $SidebarImage -PathType Leaf)) {
      throw "Sidebar illustration missing: $SidebarImage"
    }
    Copy-Item -LiteralPath $SidebarImage -Destination (Join-Path $target 'sidebar-illustration.png') -Force
  } else {
    Write-Warning 'No sidebar illustration supplied; current artwork is left unchanged.'
  }

  if ($AvatarDirectory) {
    if (-not (Test-Path -LiteralPath $AvatarDirectory -PathType Container)) {
      throw "Avatar directory missing: $AvatarDirectory"
    }
    $portraits = @(Get-ChildItem -LiteralPath $AvatarDirectory -File |
      Where-Object { $_.Extension -in @('.png','.webp') })
    if ($portraits.Count -eq 0) {
      throw 'The avatar directory contains no PNG or WebP portraits.'
    }
    $avatarTarget = Join-Path $target 'avatars'
    New-Item -ItemType Directory -Path $avatarTarget -Force | Out-Null
    foreach ($portrait in $portraits) {
      if ($portrait.Name -cnotmatch '^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}\.(png|webp)$') {
        throw "Invalid portrait filename: $($portrait.Name)"
      }
      Copy-Item -LiteralPath $portrait.FullName -Destination (Join-Path $avatarTarget $portrait.Name) -Force
    }
    Write-Host "Installed $($portraits.Count) universal portrait files. No origin-specific mapping."
  }

  # This step also copies original license notices and excludes restricted fonts.
  & (Join-Path $PSScriptRoot 'install-owner-fonts.ps1') -KitZip $KitZip -NewStandardWoff2 $NewStandardWoff2
  Write-Host "The Pall owner UI kit installed at: $target"
} finally {
  if (Test-Path -LiteralPath $temp) {
    Remove-Item -LiteralPath $temp -Recurse -Force
  }
}
