# Junta fotos em uma folha. Uso: folha.ps1 saida.jpg colunas largura altura foto1 foto2 ...
param([string]$Saida, [int]$Col, [int]$W, [int]$H, [Parameter(ValueFromRemainingArguments = $true)][string[]]$Fotos)
Add-Type -AssemblyName System.Drawing
$lin = [math]::Ceiling($Fotos.Count / $Col)
$b = New-Object System.Drawing.Bitmap ($Col * $W), ($lin * $H)
$g = [System.Drawing.Graphics]::FromImage($b)
$g.InterpolationMode = 'HighQualityBicubic'
$i = 0
foreach ($f in $Fotos) {
  $img = [System.Drawing.Image]::FromFile((Resolve-Path $f))
  $g.DrawImage($img, ($i % $Col) * $W, [math]::Floor($i / $Col) * $H, $W, $H)
  $img.Dispose(); $i++
}
$b.Save($Saida, [System.Drawing.Imaging.ImageFormat]::Jpeg)
