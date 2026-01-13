# Image Implementation Guide
**Comprehensive guide to image structure, aspect ratios, and responsive breakpoints**

---

## 📐 Image Wrapper Architecture

### Structure Pattern

```html
<div class="img-frame-{type}">   <!-- Wrapper: Sets aspect ratio -->
  <img class="img" src="..." alt="">  <!-- Image: Fills wrapper -->
</div>
```

**Why This Works:**
- **Wrapper** (`.img-frame-*`) defines the aspect ratio box
- **Image** (`.img`) fills the box with `object-fit: cover`
- **Positioning**: Wrapper is `relative`, image is `absolute`

---

## 🎯 Available Image Frames

### Square (1:1)
**Class:** `.img-frame-square`

```css
.img-frame-square {
  aspect-ratio: 1;
  width: 100%;
  position: relative;
  overflow: hidden;
}
```

**Use for:**
- Profile photos
- Social media posts
- Icons and thumbnails
- Instagram-style galleries

**Recommended size:** 1080 x 1080px

---

### Portrait (2:3)
**Class:** `.img-frame-portrait`

```css
.img-frame-portrait {
  aspect-ratio: 2 / 3;
  width: 100%;
  position: relative;
  overflow: hidden;
}
```

**Use for:**
- Team member photos
- Product shots
- Vertical banner images

**Recommended size:** 1200 x 1800px

**Mobile adaptation:** Changes to 16:9 on mobile screens

---

### Landscape (3:2)
**Class:** `.img-frame-landscape`

```css
.img-frame-landscape {
  aspect-ratio: 3 / 2;
  width: 100%;
  position: relative;
  overflow: hidden;
}
```

**Use for:**
- Print photos
- Photography galleries
- Featured images

**Recommended size:** 1620 x 1080px

---

### Wide (16:9)
**Class:** `.img-frame-wide`

```css
.img-frame-wide {
  aspect-ratio: 16 / 9;
  width: 100%;
  position: relative;
  overflow: hidden;
}
```

**Use for:**
- Hero images
- Video thumbnails
- Widescreen presentations
- Logos in horizontal layouts

**Recommended size:** 1920 x 1080px

---

## 🖼️ Image Element Styling

```css
.img {
  object-fit: cover;          /* Crops to fill frame */
  width: 100%;
  height: 100%;
  display: block;
  position: absolute;         /* Positioned within frame */
  top: 0;
  left: 0;
}
```

### Object-Fit Options

```css
/* COVER - Crops to fill (default) */
.img {
  object-fit: cover;          /* ✅ Most common */
}

/* CONTAIN - Letterbox to fit */
.img.contain {
  object-fit: contain;        /* ✅ For logos */
}

/* FILL - Stretches to fill */
.img.fill {
  object-fit: fill;           /* ⚠️ Can distort */
}
```

---

## 📱 Responsive Breakpoint Strategy

### Desktop Wide (1920px+)
```css
/* Base styles - widest layout */
.img-frame-wide {
  aspect-ratio: 16 / 9;       /* Widescreen */
}

.img-frame-portrait {
  aspect-ratio: 2 / 3;        /* Portrait */
}
```

### Desktop (1280px - 1919px)
```css
/* Maintain ratios, adjust sizing */
@media (max-width: 1919px) {
  .img-frame-square {
    width: 100%;              /* Full container width */
  }
}
```

### Tablet (768px - 1279px)
```css
/* Adjust for tablet viewports */
@media (max-width: 1279px) {
  .img-frame-wide {
    aspect-ratio: 4 / 3;      /* Tighter ratio */
  }
}
```

### Mobile (< 768px)
```css
/* Optimize for mobile screens */
@media (max-width: 767px) {
  .img-frame-portrait {
    aspect-ratio: 16 / 9;     /* Wider for mobile */
  }
  
  .img-frame-landscape {
    aspect-ratio: 1;          /* Square on mobile */
  }
}
```

### Why These Breakpoints?
- **Mobile (<768px)**: Portrait becomes landscape to better use horizontal screen space
- **Tablet (768-1279px)**: Balanced ratios for medium screens
- **Desktop (1280px+)**: Full aspect ratios with optimal viewing

---

## 🎨 Implementation Examples

### Example 1: Hero Section with Wide Image

```html
<section class="section_hero">
  <div class="container_lg">
    <div class="img-frame-wide">
      <img 
        class="img" 
        src="images/hero.webp" 
        alt="Salon interior"
        sizes="100vw"
        srcset="images/hero-500.webp 500w,
                images/hero-800.webp 800w,
                images/hero-1080.webp 1080w,
                images/hero-1920.webp 1920w"
      >
    </div>
  </div>
</section>
```

**CSS:**
```css
.section_hero .img-frame-wide {
  aspect-ratio: 16 / 9;
}

@media (max-width: 767px) {
  .section_hero .img-frame-wide {
    aspect-ratio: 4 / 3;      /* Taller on mobile */
  }
}
```

---

### Example 2: Team Grid with Portrait Images

```html
<div class="layout_3-col">
  <div class="img-frame-portrait">
    <img 
      class="img" 
      src="images/stylist-1.webp" 
      alt="Stylist name"
      sizes="(max-width: 768px) 100vw, 33vw"
      srcset="images/stylist-1-500.webp 500w,
              images/stylist-1-800.webp 800w,
              images/stylist-1-1200.webp 1200w"
    >
  </div>
  <!-- More cards... -->
</div>
```

**CSS:**
```css
.layout_3-col .img-frame-portrait {
  aspect-ratio: 2 / 3;
}

@media (max-width: 767px) {
  .layout_3-col .img-frame-portrait {
    aspect-ratio: 16 / 9;     /* Wider on mobile */
  }
}
```

---

### Example 3: Logo Grid with Contain

```html
<div class="img-frame-wide">
  <img 
    class="img contain" 
    src="images/logo-partner.svg" 
    alt="Partner logo"
  >
</div>
```

**CSS:**
```css
.img.contain {
  object-fit: contain;        /* Don't crop logos */
  object-position: center;
}
```

---

## 🖼️ Image Format Guide

### WebP (Primary Format)
- **Use for:** All photos and complex images
- **Compression:** 60-80% quality
- **Fallback:** Always provide JPEG/PNG backup
- **Browser support:** 97%+ (with fallback)

```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>
```

### JPEG
- **Use for:** Fallback for WebP
- **Compression:** 60-80% quality
- **Best for:** Photographs with many colors

### PNG
- **Use for:** Graphics with transparency
- **Compression:** PNG-8 when possible
- **Note:** Larger file sizes than WebP

### SVG
- **Use for:** Logos, icons, simple graphics
- **Benefits:** Scalable, small file size, crisp at any resolution
- **Note:** Always set explicit width/height

---

## 📏 Image Size Recommendations

| Frame Type | Aspect Ratio | Desktop Size | Mobile Size | File Size Target |
|-----------|--------------|--------------|-------------|------------------|
| Square | 1:1 | 1080 x 1080 | 600 x 600 | < 200KB |
| Portrait | 2:3 | 1200 x 1800 | 800 x 1200 | < 300KB |
| Landscape | 3:2 | 1620 x 1080 | 800 x 533 | < 300KB |
| Wide | 16:9 | 1920 x 1080 | 800 x 450 | < 400KB |

### Srcset Strategy

```html
<img
  sizes="(max-width: 768px) 100vw, 
         (max-width: 1280px) 50vw, 
         33vw"
  srcset="image-500.webp 500w,
          image-800.webp 800w,
          image-1080.webp 1080w,
          image-1600.webp 1600w,
          image-2000.webp 2000w"
  src="image-1080.webp"
  alt="Description"
>
```

**Sizes attribute breakdown:**
- `(max-width: 768px) 100vw` → Mobile: full viewport width
- `(max-width: 1280px) 50vw` → Tablet: half viewport width
- `33vw` → Desktop: one-third viewport width (3-column grid)

---

## ✅ Best Practices Checklist

### HTML Structure
- [ ] Use semantic wrapper pattern (`img-frame-*` + `.img`)
- [ ] Always include `alt` text
- [ ] Use `loading="lazy"` for below-fold images
- [ ] Include `srcset` for responsive images
- [ ] Define `sizes` attribute for proper browser selection

### CSS Implementation
- [ ] Wrapper has `position: relative`
- [ ] Wrapper sets `aspect-ratio`
- [ ] Image has `position: absolute`
- [ ] Image fills wrapper (`width: 100%; height: 100%;`)
- [ ] Use `object-fit: cover` for photos
- [ ] Use `object-fit: contain` for logos
- [ ] Set `overflow: hidden` on wrapper

### Responsive Design
- [ ] Mobile-first approach
- [ ] Adjust aspect ratios at breakpoints
- [ ] Consider orientation changes
- [ ] Test on actual devices
- [ ] Verify image loading performance

### Performance
- [ ] Use WebP format with fallbacks
- [ ] Compress images (60-80% quality)
- [ ] Generate multiple sizes for srcset
- [ ] Lazy load below-fold images
- [ ] Optimize largest contentful paint (LCP)

---

## 🚨 Common Mistakes

### Mistake 1: object-fit on Wrapper
```css
/* ❌ BAD - object-fit doesn't work on divs */
.img-frame-portrait {
  object-fit: cover;
}

/* ✅ GOOD - Apply to img element */
.img-frame-portrait .img {
  object-fit: cover;
}
```

---

### Mistake 2: Missing position: relative
```css
/* ❌ BAD - Image won't position correctly */
.img-frame-square {
  aspect-ratio: 1;
}

/* ✅ GOOD - Creates positioning context */
.img-frame-square {
  aspect-ratio: 1;
  position: relative;
}
```

---

### Mistake 3: Hardcoded Sizes
```html
<!-- ❌ BAD - Not responsive -->
<img src="image.jpg" width="500" height="500">

<!-- ✅ GOOD - Responsive with frame -->
<div class="img-frame-square">
  <img class="img" src="image.jpg" alt="">
</div>
```

---

### Mistake 4: No Overflow Hidden
```css
/* ❌ BAD - Image may exceed frame */
.img-frame-portrait {
  aspect-ratio: 2 / 3;
}

/* ✅ GOOD - Clips overflow */
.img-frame-portrait {
  aspect-ratio: 2 / 3;
  overflow: hidden;
}
```

---

## 🔧 Quick Reference CSS

```css
/* Base frame styles */
.img-frame-square,
.img-frame-portrait,
.img-frame-landscape,
.img-frame-wide {
  position: relative;
  width: 100%;
  overflow: hidden;
}

/* Specific aspect ratios */
.img-frame-square { aspect-ratio: 1; }
.img-frame-portrait { aspect-ratio: 2 / 3; }
.img-frame-landscape { aspect-ratio: 3 / 2; }
.img-frame-wide { aspect-ratio: 16 / 9; }

/* Image positioning */
.img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Logo variant */
.img.contain {
  object-fit: contain;
  object-position: center;
}

/* Mobile adjustments */
@media (max-width: 767px) {
  .img-frame-portrait { aspect-ratio: 16 / 9; }
  .img-frame-landscape { aspect-ratio: 1; }
}
```

---

## 📚 Related Documentation

- [Positioning Quick Reference](./positioning-quick-reference.md)
- [Positioning Examples](./positioning-examples.md)
- [Naming Framework](./naming-framework.md)

---

**Image Implementation Guide**  
**Version:** 1.0  
**Created:** November 8, 2025  
**Updated:** November 8, 2025  
**Audit Status:** Based on impressionz.webflow codebase

