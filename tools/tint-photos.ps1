# Tints the blog's own photos in the brand colours: shadows -> ink #19110B,
# mid-tones -> tan #9C7A54, highlights -> cream #FAF4EB.
# Reads the untouched black-and-white masters in tools\photo-masters\ and
# writes the tinted JPEGs to the same relative path under assets\img\.
# New photo: drop the B&W version into tools\photo-masters\ (e.g. posts\x.jpg) and run
#   & .\tools\tint-photos.ps1
param([string]$Only = "")

$root = Split-Path -Parent $PSScriptRoot
$masters = Join-Path $root "tools\photo-masters"

Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class FvTint {
  static readonly double[] Pos = { 0.0, 0.5, 1.0 };
  static readonly int[,] Col = { { 0x19, 0x11, 0x0B }, { 0x9C, 0x7A, 0x54 }, { 0xFA, 0xF4, 0xEB } };

  static byte[,] Lut() {
    byte[,] lut = new byte[256, 3];
    for (int i = 0; i < 256; i++) {
      double t = i / 255.0;
      int k = t <= Pos[1] ? 0 : 1;
      double f = (t - Pos[k]) / (Pos[k + 1] - Pos[k]);
      f = f * f * (3 - 2 * f) * 0.35 + f * 0.65; // soften the joins between stops
      for (int c = 0; c < 3; c++)
        lut[i, c] = (byte)Math.Round(Col[k, c] + (Col[k + 1, c] - Col[k, c]) * f);
    }
    return lut;
  }

  public static void Run(string src, string dst, long quality) {
    byte[,] lut = Lut();
    using (Bitmap input = new Bitmap(src))
    using (Bitmap bmp = new Bitmap(input.Width, input.Height, PixelFormat.Format24bppRgb)) {
      using (Graphics g = Graphics.FromImage(bmp)) g.DrawImage(input, 0, 0, input.Width, input.Height);
      Rectangle r = new Rectangle(0, 0, bmp.Width, bmp.Height);
      BitmapData d = bmp.LockBits(r, ImageLockMode.ReadWrite, PixelFormat.Format24bppRgb);
      int n = d.Stride * d.Height;
      byte[] px = new byte[n];
      Marshal.Copy(d.Scan0, px, 0, n);
      for (int y = 0; y < d.Height; y++) {
        int row = y * d.Stride;
        for (int x = 0; x < d.Width; x++) {
          int o = row + x * 3; // BGR
          int l = (int)Math.Round(0.0722 * px[o] + 0.7152 * px[o + 1] + 0.2126 * px[o + 2]);
          if (l > 255) l = 255;
          px[o] = lut[l, 2]; px[o + 1] = lut[l, 1]; px[o + 2] = lut[l, 0];
        }
      }
      Marshal.Copy(px, 0, d.Scan0, n);
      bmp.UnlockBits(d);
      ImageCodecInfo jpg = null;
      foreach (ImageCodecInfo c in ImageCodecInfo.GetImageEncoders()) if (c.MimeType == "image/jpeg") jpg = c;
      EncoderParameters ep = new EncoderParameters(1);
      ep.Param[0] = new EncoderParameter(System.Drawing.Imaging.Encoder.Quality, quality);
      bmp.Save(dst, jpg, ep);
    }
  }
}
"@

Get-ChildItem $masters -Recurse -Include *.jpg | ForEach-Object {
  $rel = $_.FullName.Substring($masters.Length + 1)
  if ($Only -and $rel -notlike "*$Only*") { return }
  $out = Join-Path $root ("assets\img\" + $rel)
  [FvTint]::Run($_.FullName, $out, 84)
  "{0,-28} {1,7:N0} KB -> {2,7:N0} KB" -f $rel, ($_.Length / 1KB), ((Get-Item $out).Length / 1KB)
}
