# Missing Tokens to Add to Notion

This document lists all the tokens from the Figma variables file that need to be added to your Notion Design Tokens database.

## Database Schema Updates (COMPLETED)

I've already updated your Notion database schemas with the following:

### Design Tokens Database - New Foundation Types:
- `font-size`, `font-line-height`, `space`, `size`
- `shadow-blur`, `shadow-offset`, `shadow-spread`
- `border-radius`, `border-width`

### Design Tokens Database - New Collection Types:
- `spacing`, `typography`, `elevation`, `breakpoint`

### Modes Database - New Type:
- `Border Radius`

---

## Modes to Add Manually

### Border Radius Modes
| Name | Type | Description | Figma Collection |
|------|------|-------------|------------------|
| sharp | Border Radius | Minimal rounding (none=0, sm=2, md=4, lg=8) | border-radius.sharp |
| soft | Border Radius | Moderate rounding (none=0, sm=8, md=12, lg=16) | border-radius.soft |
| softest | Border Radius | Maximum rounding (none=0, sm=24, md=40, lg=pill) | border-radius.softest |

### Spacing Modes (align with Figma)
| Name | Type | Description | Figma Collection |
|------|------|-------------|------------------|
| compact | Spacing | Tighter spacing for dense UIs | spacing.compact |
| comfortable | Spacing | Balanced default spacing | spacing.comfortable |
| spacious | Spacing | Generous whitespace | spacing.spacious |

### Elevation Modes (align with Figma)
| Name | Type | Description | Figma Collection |
|------|------|-------------|------------------|
| None | Elevation | Flat, no shadows (all elevation values = 0) | elevation.None |
| Low | Elevation | Subtle shadows (elevation-01=1, elevation-08=8) | elevation.Low |
| Mid | Elevation | Medium shadows (elevation-01=1, elevation-08=16) | elevation.Mid |
| High | Elevation | Prominent shadows (elevation-01=2, elevation-08=32) | elevation.High |

---

## Primitive Tokens to Add

### Font Size Primitives
| Name | Type | Foundation | Collection | Figma Variable | Value |
|------|------|------------|------------|----------------|-------|
| font-size-5 | primitive | font-size | primitive | font-size/5 | 5.69px |
| font-size-10 | primitive | font-size | primitive | font-size/10 | 6.41px |
| font-size-15 | primitive | font-size | primitive | font-size/15 | 8.11px |
| font-size-20 | primitive | font-size | primitive | font-size/20 | 9.12px |
| font-size-25 | primitive | font-size | primitive | font-size/25 | 10.26px |
| font-size-50 | primitive | font-size | primitive | font-size/50 | 11.54px |
| font-size-75 | primitive | font-size | primitive | font-size/75 | 14px |
| font-size-100 | primitive | font-size | primitive | font-size/100 | 16px |
| font-size-200 | primitive | font-size | primitive | font-size/200 | 18px |
| font-size-300 | primitive | font-size | primitive | font-size/300 | 20px |
| font-size-400 | primitive | font-size | primitive | font-size/400 | 22.5px |
| font-size-500 | primitive | font-size | primitive | font-size/500 | 25.3px |
| font-size-600 | primitive | font-size | primitive | font-size/600 | 28.5px |
| font-size-700 | primitive | font-size | primitive | font-size/700 | 32px |
| font-size-800 | primitive | font-size | primitive | font-size/800 | 36px |
| font-size-900 | primitive | font-size | primitive | font-size/900 | 40.5px |
| font-size-1000 | primitive | font-size | primitive | font-size/1000 | 45.5px |

### Font Line Height Primitives
| Name | Type | Foundation | Collection | Figma Variable | Value |
|------|------|------------|------------|----------------|-------|
| line-height-none | primitive | font-line-height | primitive | font-line-height/none | 0 |
| line-height-tight | primitive | font-line-height | primitive | font-line-height/tight | 1.1 |
| line-height-snug | primitive | font-line-height | primitive | font-line-height/snug | 1.25 |
| line-height-normal | primitive | font-line-height | primitive | font-line-height/normal | 1.5 |
| line-height-relaxed | primitive | font-line-height | primitive | font-line-height/relaxed | 1.75 |
| line-height-loose | primitive | font-line-height | primitive | font-line-height/loose | 2 |

### Space Primitives
| Name | Type | Foundation | Collection | Figma Variable | Value |
|------|------|------------|------------|----------------|-------|
| space-0 | primitive | space | primitive | space/0 | 0px |
| space-25 | primitive | space | primitive | space/25 | 1px |
| space-50 | primitive | space | primitive | space/50 | 2px |
| space-100 | primitive | space | primitive | space/100 | 4px |
| space-150 | primitive | space | primitive | space/150 | 6px |
| space-200 | primitive | space | primitive | space/200 | 8px |
| space-250 | primitive | space | primitive | space/250 | 10px |
| space-300 | primitive | space | primitive | space/300 | 12px |
| space-400 | primitive | space | primitive | space/400 | 16px |
| space-500 | primitive | space | primitive | space/500 | 20px |
| space-600 | primitive | space | primitive | space/600 | 24px |
| space-800 | primitive | space | primitive | space/800 | 32px |
| space-1000 | primitive | space | primitive | space/1000 | 40px |
| space-1200 | primitive | space | primitive | space/1200 | 48px |
| space-1600 | primitive | space | primitive | space/1600 | 64px |

### Border Radius Primitives
| Name | Type | Foundation | Collection | Figma Variable | Value |
|------|------|------------|------------|----------------|-------|
| border-radius-0 | primitive | border-radius | primitive | border-radius/0 | 0px |
| border-radius-50 | primitive | border-radius | primitive | border-radius/50 | 2px |
| border-radius-100 | primitive | border-radius | primitive | border-radius/100 | 4px |
| border-radius-200 | primitive | border-radius | primitive | border-radius/200 | 8px |
| border-radius-400 | primitive | border-radius | primitive | border-radius/400 | 12px |
| border-radius-600 | primitive | border-radius | primitive | border-radius/600 | 16px |
| border-radius-800 | primitive | border-radius | primitive | border-radius/800 | 24px |
| border-radius-1200 | primitive | border-radius | primitive | border-radius/1200 | 40px |
| border-radius-pill | primitive | border-radius | primitive | border-radius/pill | 999px |
| border-radius-circle | primitive | border-radius | primitive | border-radius/radius-circle | 9999px |

### Shadow Primitives
| Name | Type | Foundation | Collection | Figma Variable | Value |
|------|------|------------|------------|----------------|-------|
| shadow-blur-0 | primitive | shadow-blur | primitive | shadow-blur/0 | 0px |
| shadow-blur-100 | primitive | shadow-blur | primitive | shadow-blur/100 | 2px |
| shadow-blur-200 | primitive | shadow-blur | primitive | shadow-blur/200 | 4px |
| shadow-blur-400 | primitive | shadow-blur | primitive | shadow-blur/400 | 8px |
| shadow-blur-800 | primitive | shadow-blur | primitive | shadow-blur/800 | 16px |
| shadow-offset-0 | primitive | shadow-offset | primitive | shadow-offset/0 | 0px |
| shadow-offset-100 | primitive | shadow-offset | primitive | shadow-offset/100 | 2px |
| shadow-offset-200 | primitive | shadow-offset | primitive | shadow-offset/200 | 4px |
| shadow-spread-0 | primitive | shadow-spread | primitive | shadow-spread/0 | 0px |
| shadow-spread-100 | primitive | shadow-spread | primitive | shadow-spread/100 | 2px |
| shadow-spread-200 | primitive | shadow-spread | primitive | shadow-spread/200 | 4px |

---

## Semantic/Alias Tokens to Add

### Typography Semantic Tokens
| Name | Type | Foundation | Collection | Figma Variable | References |
|------|------|------------|------------|----------------|------------|
| typography-huge | alias | font-size | typography | typography/huge | {font-size.500} = 25.3px |
| typography-xl | alias | font-size | typography | typography/xl | {font-size.400} = 22.5px |
| typography-lg | alias | font-size | typography | typography/lg | {font-size.300} = 20px |
| typography-md | alias | font-size | typography | typography/md | {font-size.200} = 18px |
| typography-sm | alias | font-size | typography | typography/sm | {font-size.100} = 16px |
| typography-xs | alias | font-size | typography | typography/xs | {font-size.75} = 14px |
| typography-tiny | alias | font-size | typography | typography/tiny | {font-size.50} = 11.54px |

### Spacing Semantic Tokens (Gap)
| Name | Type | Foundation | Collection | Figma Variable | Default Mode Value |
|------|------|------------|------------|----------------|-------------------|
| gap-none | alias | space | spacing | gap/none | {space.0} = 0px |
| gap-tiny | alias | space | spacing | gap/tiny | {space.100} = 4px |
| gap-sm | alias | space | spacing | gap/sm | {space.200} = 8px |
| gap-md | alias | space | spacing | gap/md | {space.400} = 16px |
| gap-lg | alias | space | spacing | gap/lg | {space.600} = 24px |

### Spacing Semantic Tokens (Padding)
| Name | Type | Foundation | Collection | Figma Variable | Default Mode Value |
|------|------|------------|------------|----------------|-------------------|
| padding-none | alias | space | spacing | padding/none | {space.0} = 0px |
| padding-tiny | alias | space | spacing | padding/tiny | {space.200} = 8px |
| padding-sm | alias | space | spacing | padding/sm | {space.400} = 16px |
| padding-md | alias | space | spacing | padding/md | {space.600} = 24px |
| padding-lg | alias | space | spacing | padding/lg | {space.800} = 32px |
| padding-huge | alias | space | spacing | padding/huge | {space.1200} = 48px |

### Elevation Semantic Tokens
| Name | Type | Foundation | Collection | Figma Variable | Element |
|------|------|------------|------------|----------------|---------|
| elevation-01 | alias | box-shadow | elevation | elevation-01 | elevation |
| elevation-02 | alias | box-shadow | elevation | elevation-02 | elevation |
| elevation-03 | alias | box-shadow | elevation | elevation-03 | elevation |
| elevation-04 | alias | box-shadow | elevation | elevation-04 | elevation |
| elevation-05 | alias | box-shadow | elevation | elevation-05 | elevation |
| elevation-06 | alias | box-shadow | elevation | elevation-06 | elevation |
| elevation-07 | alias | box-shadow | elevation | elevation-07 | elevation |
| elevation-08 | alias | box-shadow | elevation | elevation-08 | elevation |
| box-shadow-sm | alias | box-shadow | elevation | box-shadow/sm | elevation |
| box-shadow-md | alias | box-shadow | elevation | box-shadow/md | elevation |
| box-shadow-lg | alias | box-shadow | elevation | box-shadow/lg | elevation |
| box-shadow-xl | alias | box-shadow | elevation | box-shadow/xl | elevation |
| box-shadow-popover | alias | box-shadow | elevation | box-shadow/popover | elevation |
| box-shadow-sticky | alias | box-shadow | elevation | box-shadow/sticky | elevation |
| box-shadow-toast | alias | box-shadow | elevation | box-shadow/toast | elevation |
| blur-radius-sm | alias | shadow-blur | elevation | blur-radius/sm | elevation |
| blur-radius-md | alias | shadow-blur | elevation | blur-radius/md | elevation |
| blur-radius-lg | alias | shadow-blur | elevation | blur-radius/lg | elevation |
| blur-radius-xl | alias | shadow-blur | elevation | blur-radius/xl | elevation |

### Breakpoint Tokens
| Name | Type | Foundation | Collection | Figma Variable | Value |
|------|------|------------|------------|----------------|-------|
| breakpoint-web | primitive | size | breakpoint | breakpoint/web | 1200px |
| breakpoint-tablet | primitive | size | breakpoint | breakpoint/tablet | 768px |
| breakpoint-mobile | primitive | size | breakpoint | breakpoint/mobile | 320px |

---

## Missing Color Tokens (Semantic)

### Text Colors - Missing from Notion
| Name | Type | Element | Role | Figma Variable |
|------|------|---------|------|----------------|
| text-muted | alias | text | (add "muted" role) | text/muted |
| text-on-color | alias | text | - | text/on-color |
| text-accent-yellow | alias | text | - | text/accent-yellow |
| text-accent-blue | alias | text | - | text/accent-blue |
| text-accent-green | alias | text | - | text/accent-green |
| text-accent-purple | alias | text | - | text/accent-purple |
| text-accent-red | alias | text | - | text/accent-red |

### Background Colors - Missing from Notion
| Name | Type | Element | Role | Figma Variable |
|------|------|---------|------|----------------|
| background-muted | alias | background | (add "muted" role) | background/muted |
| background-on-color | alias | background | - | background/on-color |
| background-input | alias | background | - | background/input |
| background-accent-yellow | alias | background | - | background/accent-yellow |
| background-accent-blue | alias | background | - | background/accent-blue |
| background-accent-green | alias | background | - | background/accent-green |
| background-accent-purple | alias | background | - | background/accent-purple |
| background-accent-red | alias | background | - | background/accent-red |

### Border Colors - Missing from Notion
| Name | Type | Element | Role | Figma Variable |
|------|------|---------|------|----------------|
| border-muted | alias | border | (add "muted" role) | border/muted |
| border-on-color | alias | border | - | border/on-color |

---

## Theme Color Palettes (Primitives)

These theme palettes from Figma are not tracked in Notion at all:

### theme.brik
- poppy-red: #e35335
- black: #000000
- tan: #f1f0ec
- yellow: #f4d364
- orange: #e76134
- green: #bcff8c
- blue: #8ebbcc
- purple: #9e8bc2

### theme.peach
- peach: #ed8059
- peach-light: #efc7a2
- peach-lightest: #fef4e8
- green: #443b2b
- tan: #fffaeb

### theme.vibrant
- yellow: #f6c647
- blue: #5889f7
- orange: #ed7648
- purple: #7a78f7
- green: #4aa35b
- tan: #fcf9f2

### (And 9 more theme palettes...)

---

## Notes

1. **Role "muted" needs to be added** to the {role} select options in the Design Tokens database
2. **Consider adding "accent" roles** for the accent color tokens
3. **The Modes database** needs the new entries for border-radius, spacing, and elevation modes
4. **Theme palettes** should be added as primitives with Collection = "primitive" and a new "theme" Color Family option
