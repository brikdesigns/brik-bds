# Responsive Aspect Ratio Conversions
**Quick reference for image aspect ratios across breakpoints**

---

## 📱 Breakpoint Overview

| Breakpoint | Screen Width | Device Types |
|------------|--------------|--------------|
| **Desktop Wide** | 1440px+ | Large monitors, 4K displays |
| **Desktop** | 1025-1439px | Standard laptops, desktops |
| **Tablet** | 768-1024px | iPads, tablets, small laptops |
| **Mobile** | 320-767px | Phones, small tablets |

---

## 🔄 Aspect Ratio Conversions by Breakpoint

### Desktop Wide (1440px+)

**Goal:** Optimize for large horizontal screen space

| Starting Ratio | Converts To | Reason |
|---------------|-------------|---------|
| **Landscape** (3:2, 4:3, 1.59:1) | **Widescreen** (16:9) | Utilize full monitor width |
| **Portrait** (2:3, 3:4) | **No change** (2:3, 3:4) | Maintains vertical balance |

---

### Desktop (1025-1439px)

**Goal:** Balance horizontal and vertical space

| Starting Ratio | Converts To | Reason |
|---------------|-------------|---------|
| **Widescreen** (16:9) | **Landscape** (3:2, 4:3) | Better content density |
| **Portrait** (2:3, 3:4) | **Landscape** (3:2, 4:3) | Optimize horizontal space |

---

### Tablet (768-1024px)

**Goal:** Adapt to medium screens, often portrait orientation

| Starting Ratio | Converts To | Reason |
|---------------|-------------|---------|
| **Widescreen** (16:9) | **Landscape** (3:2, 4:3) | Balance for tablet screens |
| **Portrait** (2:3, 3:4) | **Landscape** (3:2, 4:3) | Better use of screen width |

---

### Mobile (320-767px)

**Goal:** Maximize space on small screens

| Starting Ratio | Converts To | Reason |
|---------------|-------------|---------|
| **Portrait** (2:3, 3:4) | **Square** (1:1) | Efficient use of mobile screen |
| **Landscape** (3:2, 4:3, 1.59:1) | **Square** (1:1) | Consistent mobile experience |

---

## 📊 Visual Flow Chart

```
DESKTOP WIDE (1440px+)
├─ Landscape (3:2, 4:3) ──→ Widescreen (16:9) ✓
└─ Portrait (2:3, 3:4) ──→ Portrait (stays same) ✓

         ↓ Resize

DESKTOP (1025-1439px)
├─ Widescreen (16:9) ──→ Landscape (3:2, 4:3) ✓
└─ Portrait (2:3, 3:4) ──→ Landscape (3:2, 4:3) ✓

         ↓ Resize

TABLET (768-1024px)
├─ Widescreen (16:9) ──→ Landscape (3:2, 4:3) ✓
└─ Portrait (2:3, 3:4) ──→ Landscape (3:2, 4:3) ✓

         ↓ Resize

MOBILE (320-767px)
├─ Portrait (2:3, 3:4) ──→ Square (1:1) ✓
└─ Landscape (3:2, 4:3) ──→ Square (1:1) ✓
```

---

## 🎯 Quick Decision Tree

```
What screen size am I designing for?

┌─ DESKTOP WIDE (1440+)
│  ├─ Need horizontal impact? → Use Widescreen (16:9)
│  └─ Need vertical emphasis? → Use Portrait (2:3)
│
┌─ DESKTOP (1025-1439)
│  └─ Default to Landscape (3:2, 4:3) for balance
│
┌─ TABLET (768-1024)
│  └─ Use Landscape (3:2, 4:3) for optimal viewing
│
└─ MOBILE (320-767)
   └─ Use Square (1:1) for consistency
```

---

## 🔢 Aspect Ratio Cheat Sheet

### Widescreen (16:9)
- **Decimal:** 1.78:1
- **Use:** Hero images, video thumbnails
- **Best for:** Desktop Wide (1440px+)

### Landscape Standard (3:2)
- **Decimal:** 1.5:1
- **Use:** Photography, featured images
- **Best for:** Desktop, Tablet

### Landscape Alternate (4:3)
- **Decimal:** 1.33:1
- **Use:** Traditional photos, content images
- **Best for:** Desktop, Tablet

### Portrait (2:3)
- **Decimal:** 0.67:1
- **Use:** Team photos, product shots
- **Best for:** Desktop Wide (no conversion)

### Portrait Alternate (3:4)
- **Decimal:** 0.75:1
- **Use:** Tall images, posters
- **Best for:** Desktop Wide (no conversion)

### Square (1:1)
- **Decimal:** 1:1
- **Use:** Social media, icons, mobile images
- **Best for:** Mobile (320-767px)

---

## 💡 Key Principles

### 1. **Wider Screens → Wider Ratios**
Large monitors benefit from widescreen (16:9) images that fill horizontal space.

### 2. **Medium Screens → Balanced Ratios**
Desktop and tablet use landscape (3:2, 4:3) for content density without wasting space.

### 3. **Mobile → Square**
Small screens work best with square (1:1) images for consistency and efficient space use.

### 4. **Portrait is Special**
Portrait ratios (2:3, 3:4) only remain unchanged on Desktop Wide. They convert to landscape or square on smaller screens to maximize screen width usage.

---

## 📱 Implementation Example

```css
/* Desktop Wide: Widescreen */
.img-frame-hero {
  aspect-ratio: 16 / 9;
}

/* Desktop: Landscape */
@media (max-width: 1439px) {
  .img-frame-hero {
    aspect-ratio: 3 / 2;
  }
}

/* Tablet: Landscape (maintained) */
@media (max-width: 1024px) {
  .img-frame-hero {
    aspect-ratio: 3 / 2;
  }
}

/* Mobile: Square */
@media (max-width: 767px) {
  .img-frame-hero {
    aspect-ratio: 1 / 1;
  }
}
```

---

## ✅ Quick Reference Table

| Original | Desktop Wide<br>(1440+) | Desktop<br>(1025-1439) | Tablet<br>(768-1024) | Mobile<br>(320-767) |
|----------|------------------------|----------------------|---------------------|-------------------|
| **Landscape (3:2)** | Widescreen (16:9) | Landscape (3:2) | Landscape (3:2) | Square (1:1) |
| **Portrait (2:3)** | Portrait (2:3) | Landscape (3:2) | Landscape (3:2) | Square (1:1) |
| **Square (1:1)** | Square (1:1) | Square (1:1) | Square (1:1) | Square (1:1) |

---

## 🎨 Visual Comparison

### Portrait Image Journey

```
Desktop Wide (1440px+)          Desktop (1025px)           Mobile (320px)
┌───────────┐                   ┌──────────────────┐       ┌────────────┐
│           │                   │                  │       │            │
│           │                   │    Landscape     │       │   Square   │
│  Portrait │    ──────→        │      3:2         │  ──→  │    1:1     │
│    2:3    │                   │                  │       │            │
│           │                   └──────────────────┘       └────────────┘
│           │
└───────────┘
```

### Landscape Image Journey

```
Desktop Wide (1440px+)          Desktop (1025px)           Mobile (320px)
┌─────────────────────┐         ┌──────────────────┐       ┌────────────┐
│                     │         │                  │       │            │
│  Widescreen 16:9    │  ──→    │   Landscape 3:2  │  ──→  │  Square 1:1│
│                     │         │                  │       │            │
└─────────────────────┘         └──────────────────┘       └────────────┘
```

---

## 📋 Recommendations

### For Hero Sections
```
Desktop Wide  → 16:9 (widescreen)
Desktop       → 3:2 (landscape)
Tablet        → 3:2 (landscape)
Mobile        → 1:1 (square) or 4:3
```

### For Team/People Photos
```
Desktop Wide  → 2:3 (portrait)
Desktop       → 3:2 (landscape)
Tablet        → 3:2 (landscape)
Mobile        → 1:1 (square)
```

### For Product Images
```
All sizes     → 1:1 (square)
(No conversion needed)
```

### For Content Images
```
Desktop Wide  → 3:2 or 4:3
Desktop       → 3:2 or 4:3
Tablet        → 3:2 or 4:3
Mobile        → 1:1 (square)
```

---

## 🚨 Important Notes

### What Changes?
- **Aspect ratio** changes at breakpoints
- **Image crop/position** may shift
- **Content visibility** adapts

### What Stays the Same?
- **Image file** (same source image)
- **Resolution** (srcset handles sizing)
- **Alt text** and accessibility

### Testing Checklist
- [ ] Verify important content stays in frame at all breakpoints
- [ ] Check that faces/logos aren't cropped awkwardly
- [ ] Test actual devices, not just browser resize
- [ ] Validate aspect ratio math is correct

---

## 🎓 Why These Conversions?

### Desktop Wide → Widescreen (16:9)
Large monitors have abundant horizontal space. Widescreen images create cinematic impact and modern aesthetic.

### Desktop/Tablet → Landscape (3:2, 4:3)
Standard working screens need balanced ratios. Landscape provides good content density without excessive whitespace.

### Mobile → Square (1:1)
Small screens are precious. Square images are:
- Predictable in size
- Easy to scan
- Efficient use of limited space
- Consistent in grids

### Portrait Stays Portrait (Desktop Wide Only)
On large screens, portrait images provide vertical emphasis and variety in layout. On smaller screens, they convert to use width more efficiently.

---

**Created:** November 8, 2025  
**Based on:** Brik Designs responsive framework  
**Version:** 1.0  
**Purpose:** Quick reference for responsive image design decisions

