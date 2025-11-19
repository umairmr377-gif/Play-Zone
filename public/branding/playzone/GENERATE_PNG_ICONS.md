# Generate PNG and ICO Files

The SVG files have been created. To complete the icon pack, you need to generate PNG and ICO files from the SVG sources.

## Quick Method: Online Tools

1. **For Favicons:**
   - Go to [RealFaviconGenerator](https://realfavicongenerator.net/)
   - Upload `favicon.svg`
   - Download the generated favicon package

2. **For App Icons:**
   - Go to [CloudConvert](https://cloudconvert.com/svg-to-png)
   - Upload `logo-icon-light.svg`
   - Convert to PNG at sizes: 512, 256, 128, 64
   - Save as `app-icon-{size}.png`

## Command Line Method (ImageMagick)

If you have ImageMagick installed:

```bash
cd public/branding/playzone

# Generate Favicon PNGs
magick -background none favicon.svg -resize 32x32 favicon-32x32.png
magick -background none favicon.svg -resize 16x16 favicon-16x16.png

# Generate Favicon ICO
magick favicon-16x16.png favicon-32x32.png favicon.ico

# Generate App Icons
magick -background none logo-icon-light.svg -resize 512x512 app-icon-512.png
magick -background none logo-icon-light.svg -resize 256x256 app-icon-256.png
magick -background none logo-icon-light.svg -resize 128x128 app-icon-128.png
magick -background none logo-icon-light.svg -resize 64x64 app-icon-64.png
```

## Node.js Script Method

Create a script using `sharp` or `jimp`:

```bash
npm install sharp --save-dev
```

Then create `scripts/generate-icons.js` and run it.

## Files to Generate

- [ ] `favicon.ico` (multi-size ICO file)
- [ ] `favicon-32x32.png`
- [ ] `favicon-16x16.png`
- [ ] `app-icon-512.png`
- [ ] `app-icon-256.png`
- [ ] `app-icon-128.png`
- [ ] `app-icon-64.png`

Once generated, place all files in `/public/branding/playzone/`

