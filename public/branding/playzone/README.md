# Play Zone Brand Assets

Complete logo and icon pack for **Play Zone — Your Sport, Your Time**

## 🎨 Brand Colors

- **Primary Blue:** `#3A7AFE` (Electric Blue)
- **Background Dark:** `#0D0D0D` (Black)
- **Background Light:** `#F7F7F8` (Light Gray)
- **Text Primary:** `#FFFFFF` (White)
- **Text Secondary:** `#B5B7BA` (Muted Gray)
- **Accent:** `#31FF83` (Neon Green - Optional)

## 📦 Available Assets

### Logo Files

1. **logo-full-light.svg** - Full logo with wordmark (light background)
2. **logo-full-dark.svg** - Full logo with wordmark (dark background)
3. **logo-icon-light.svg** - Icon only (light background)
4. **logo-icon-dark.svg** - Icon only (dark background)
5. **logo-wordmark.svg** - Text only wordmark

### Favicon Files

- **favicon.svg** - Modern SVG favicon (recommended)
- **favicon.ico** - Legacy ICO format (to be generated)
- **favicon-32x32.png** - PNG fallback (to be generated)
- **favicon-16x16.png** - PNG fallback (to be generated)

### App Icons

- **app-icon-512.png** - 512×512px (to be generated)
- **app-icon-256.png** - 256×256px (to be generated)
- **app-icon-128.png** - 128×128px (to be generated)
- **app-icon-64.png** - 64×64px (to be generated)

### Background Variations

- **icon-blue-on-light.svg** - Blue icon on light background
- **icon-white-on-dark.svg** - White icon on dark background
- **icon-black-on-white.svg** - Black icon on white background

## ✅ Usage Guidelines

### Do's

✅ Use SVG files for web (scalable, crisp at any size)  
✅ Use dark icon on light backgrounds  
✅ Use light icon on dark backgrounds  
✅ Maintain minimum clear space (20% of icon size)  
✅ Use primary blue (#3A7AFE) for brand consistency  
✅ Scale proportionally (never stretch or distort)

### Don'ts

❌ Don't change colors (except approved variations)  
❌ Don't rotate or skew the logo  
❌ Don't add effects (shadows, gradients, outlines)  
❌ Don't place on busy backgrounds  
❌ Don't use below 24px size for icon  
❌ Don't separate icon from wordmark without approval

## 📏 Recommended Sizes

- **Navbar Logo:** 32-40px height
- **Favicon:** 32×32px or 16×16px
- **App Icon:** 512×512px (scales down automatically)
- **Marketing:** 200-400px width
- **Social Media:** 1200×630px (use full logo)

## 💻 HTML Usage Examples

### Navbar Logo (Dark Background)
```html
<img 
  src="/branding/playzone/logo-icon-dark.svg" 
  alt="Play Zone" 
  width="40" 
  height="40"
/>
```

### Full Logo with Tagline
```html
<img 
  src="/branding/playzone/logo-full-dark.svg" 
  alt="Play Zone - Your Sport, Your Time" 
  width="320" 
  height="120"
/>
```

### SVG Inline (for styling)
```html
<svg width="40" height="40" viewBox="0 0 120 120">
  <!-- Copy SVG content here for CSS control -->
</svg>
```

### Next.js Image Component
```tsx
import Image from 'next/image';

<Image
  src="/branding/playzone/logo-icon-dark.svg"
  alt="Play Zone"
  width={40}
  height={40}
  priority
/>
```

## 🎯 Icon Design Details

The Play Zone icon combines:
- **Location Pin** - Represents "where" (court location)
- **Sports Ball** - Represents "sport" (basketball/football)
- **Court Lines** - Represents "court" (playing field)

The design is:
- Minimal and geometric
- Works at small sizes (favicon-ready)
- Recognizable and unique
- Professional and modern

## 🔄 Generating PNG/ICO Files

To generate PNG and ICO files from SVG:

1. **Online Tools:**
   - [CloudConvert](https://cloudconvert.com/svg-to-png)
   - [Convertio](https://convertio.co/svg-png/)

2. **Command Line (ImageMagick):**
```bash
# Generate PNGs
convert -background none favicon.svg -resize 32x32 favicon-32x32.png
convert -background none favicon.svg -resize 16x16 favicon-16x16.png

# Generate ICO
convert favicon-16x16.png favicon-32x32.png favicon.ico
```

3. **App Icons:**
```bash
convert -background none logo-icon-light.svg -resize 512x512 app-icon-512.png
convert -background none logo-icon-light.svg -resize 256x256 app-icon-256.png
convert -background none logo-icon-light.svg -resize 128x128 app-icon-128.png
convert -background none logo-icon-light.svg -resize 64x64 app-icon-64.png
```

## 📱 Integration Checklist

- [ ] Update `app/layout.tsx` with new favicon
- [ ] Update `manifest.json` with app icons
- [ ] Update `components/Navbar.tsx` with new logo
- [ ] Test logo on light and dark backgrounds
- [ ] Verify favicon displays in browser tab
- [ ] Test app icon on mobile devices
- [ ] Verify logo scales correctly at all sizes

## 📄 License

These brand assets are proprietary to Play Zone. Use only for official Play Zone applications and marketing materials.

---

**Brand:** Play Zone  
**Tagline:** Your Sport, Your Time  
**Version:** 1.0  
**Last Updated:** 2025

