---
inclusion: fileMatch
fileMatchPattern: "**/*.astro,**/*.jsx,**/*.tsx,**/components/**"
---

# UI Patterns

## Design System
- Clean, minimal interface
- Large touch targets (min 44x44px) for mobile
- Clear visual hierarchy
- Consistent color themes (3-5 preset options)

## Component Strategy (Astro Islands)

### Static Components (`.astro`) - No JS
- Navigation bars
- Project cards (display only)
- Footer
- Static content sections
- Template previews

### Interactive Islands (`.tsx`) - Client JS
- Camera capture (`client:idle`)
- Image upload with progress (`client:visible`)
- Form inputs with validation (`client:visible`)
- Toast notifications (`client:idle`)
- Theme switcher (`client:idle`)

## Common Components
- Cards for project listings (Astro)
- Bottom navigation for mobile (Astro + React for active state)
- Modal dialogs for confirmations (React island)
- Toast notifications for feedback (React island)
- Loading spinners/skeletons (Astro with CSS animations)

## Form Patterns
- Single-column layouts on mobile
- Clear labels and placeholders
- Inline validation messages (React island)
- Disabled states during submission
- Progressive enhancement - forms work without JS

## Image Handling
- Use `astro:assets` for static images
- Show upload progress (React island)
- Preview before submission
- Client-side compression before upload
- Error states for failed uploads

## Accessibility
- Proper ARIA labels
- Sufficient color contrast
- Focus indicators
- Screen reader friendly
- Works without JavaScript (progressive enhancement)
