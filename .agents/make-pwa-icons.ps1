# Generates PWA icons: icon-192.png, icon-512.png, icon-maskable-512.png
Add-Type -AssemblyName System.Drawing
$dir = 'C:\Users\ravi4\website'
$glyph = [string][char]0x0C24  # Telugu letter "ta"

function New-PwaIcon([int]$size,[float]$glyphPt,[string]$outPath) {
  $b = New-Object System.Drawing.Bitmap($size,$size)
  $gr = [System.Drawing.Graphics]::FromImage($b)
  $gr.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $gr.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
  $r = New-Object System.Drawing.Rectangle(0,0,$size,$size)
  $c1 = [System.Drawing.ColorTranslator]::FromHtml('#534AB7')
  $c2 = [System.Drawing.ColorTranslator]::FromHtml('#3D3490')
  $br = New-Object System.Drawing.Drawing2D.LinearGradientBrush($r,$c1,$c2,[System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
  $gr.FillRectangle($br,$r)
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $f = New-Object System.Drawing.Font('Nirmala UI',$glyphPt,[System.Drawing.FontStyle]::Bold)
  $rf = New-Object System.Drawing.RectangleF(0,0,$size,$size)
  $gr.DrawString($glyph,$f,[System.Drawing.Brushes]::White,$rf,$sf)
  $b.Save($outPath,[System.Drawing.Imaging.ImageFormat]::Png)
  $gr.Dispose(); $b.Dispose()
}

New-PwaIcon 192 84  "$dir\icon-192.png"
New-PwaIcon 512 224 "$dir\icon-512.png"
# maskable: smaller glyph so it survives circular/rounded masks (80% safe zone)
New-PwaIcon 512 160 "$dir\icon-maskable-512.png"
Write-Output 'PWA icons generated'
