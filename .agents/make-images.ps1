# Generates og-image.png, apple-touch-icon.png, favicon-32.png for Sri Telugu Classes
Add-Type -AssemblyName System.Drawing
$dir = 'C:\Users\ravi4\website'
$teluguWord = -join (0x0C24,0x0C46,0x0C32,0x0C41,0x0C17,0x0C41 | ForEach-Object {[char]$_})  # telugu script word
$teluguGlyph = [string][char]0x0C24  # single letter "ta"

# ---------- OG image 1200x630 ----------
$bmp = New-Object System.Drawing.Bitmap(1200,630)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$rect = New-Object System.Drawing.Rectangle(0,0,1200,630)
$c1 = [System.Drawing.ColorTranslator]::FromHtml('#1A1832')
$c2 = [System.Drawing.ColorTranslator]::FromHtml('#2D2660')
$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect,$c1,$c2,[System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal)
$g.FillRectangle($bg,$rect)

# soft glow blobs
$glow1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(26,127,119,221))
$g.FillEllipse($glow1,-180,-180,560,560)
$glow2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(20,29,158,117))
$g.FillEllipse($glow2,880,330,560,560)

$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center

$fTel = New-Object System.Drawing.Font('Nirmala UI',100,[System.Drawing.FontStyle]::Bold)
$bTel = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#7F77DD'))
$g.DrawString($teluguWord,$fTel,$bTel,600,55,$sf)

$fTitle = New-Object System.Drawing.Font('Segoe UI',62,[System.Drawing.FontStyle]::Bold)
$g.DrawString('Sri Telugu Classes',$fTitle,[System.Drawing.Brushes]::White,600,290,$sf)

# accent bar under title
$barRect = New-Object System.Drawing.Rectangle(520,430,160,8)
$cp = [System.Drawing.ColorTranslator]::FromHtml('#534AB7')
$ca = [System.Drawing.ColorTranslator]::FromHtml('#1D9E75')
$barBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($barRect,$cp,$ca,[System.Drawing.Drawing2D.LinearGradientMode]::Horizontal)
$g.FillRectangle($barBrush,$barRect)

$fSub = New-Object System.Drawing.Font('Segoe UI',26)
$bSub = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#B8B5D1'))
$g.DrawString('Live Online Telugu Classes for Kids and Adults',$fSub,$bSub,600,468,$sf)

$fUrl = New-Object System.Drawing.Font('Segoe UI',18)
$bUrl = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#7F77DD'))
$g.DrawString('sri-telugu-classes.netlify.app',$fUrl,$bUrl,600,560,$sf)

$bmp.Save("$dir\og-image.png",[System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()

# ---------- icon helper ----------
function New-Icon([int]$size,[float]$glyphPt,[string]$outPath) {
  $b = New-Object System.Drawing.Bitmap($size,$size)
  $gr = [System.Drawing.Graphics]::FromImage($b)
  $gr.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $gr.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
  $r = New-Object System.Drawing.Rectangle(0,0,$size,$size)
  $i1 = [System.Drawing.ColorTranslator]::FromHtml('#534AB7')
  $i2 = [System.Drawing.ColorTranslator]::FromHtml('#3D3490')
  $ib = New-Object System.Drawing.Drawing2D.LinearGradientBrush($r,$i1,$i2,[System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
  $gr.FillRectangle($ib,$r)
  $isf = New-Object System.Drawing.StringFormat
  $isf.Alignment = [System.Drawing.StringAlignment]::Center
  $isf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $if = New-Object System.Drawing.Font('Nirmala UI',$glyphPt,[System.Drawing.FontStyle]::Bold)
  $rf = New-Object System.Drawing.RectangleF(0,0,$size,$size)
  $gr.DrawString($teluguGlyph,$if,[System.Drawing.Brushes]::White,$rf,$isf)
  $b.Save($outPath,[System.Drawing.Imaging.ImageFormat]::Png)
  $gr.Dispose(); $b.Dispose()
}

New-Icon 180 78 "$dir\apple-touch-icon.png"
New-Icon 32 14 "$dir\favicon-32.png"
Write-Output 'Images generated OK'
