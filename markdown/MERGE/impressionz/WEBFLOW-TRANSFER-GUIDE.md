# Webflow Transfer Guide - Stylist Card Flip Animation

## ✅ Files Ready for Transfer

### 1. **header.css** → Webflow Custom Code (Head)
- Open `header.css`
- Copy the entire file contents
- In Webflow: **Settings > Custom Code > Head Code**
- Wrap in `<style>` tags:
```html
<style>
[paste header.css contents here]
</style>
```

### 2. **footer.js** → Webflow Custom Code (Footer)
- Open `footer.js`
- Copy the entire file contents
- In Webflow: **Settings > Custom Code > Footer Code**
- Wrap in `<script>` tags:
```html
<script>
[paste footer.js contents here]
</script>
```

## 🔧 Required HTML Button Setup

### On detail_stylists.html template:

**"View my Bio" button** (front card):
- Must have ID: `flip-to-back-btn`
- Example: `<a href="#" id="flip-to-back-btn" class="button_primary sm w-button">View my Bio</a>`

**"view my profile" button** (back card):
- Must have ID: `flip-to-front-btn`
- Example: `<a href="#" id="flip-to-front-btn" class="button_primary sm w-button">view my profile</a>`

## 📦 What's Included

### CSS Features:
- ✅ 3D flip card animation (W3Schools style)
- ✅ Smooth 0.8s transition with backface-visibility
- ✅ Mobile responsive (faster transitions on smaller screens)
- ✅ Navigation dropdown positioning fixes
- ✅ Stylist list card flip support (for stylists.html)

### JavaScript Features:
- ✅ Click-triggered flip animation
- ✅ Smooth scroll to keep card in view
- ✅ Console logging for debugging
- ✅ Contact modal scroll control
- ✅ Support for both detail and list pages

## 🧪 Testing in Webflow

After transferring:
1. Publish the site
2. Navigate to a stylist detail page
3. Click "View my Bio" - card should flip to show bio
4. Click "view my profile" - card should flip back
5. Check browser console for confirmation messages

## 🐛 Troubleshooting

If the flip doesn't work in Webflow:
1. Check that button IDs are correct: `flip-to-back-btn` and `flip-to-front-btn`
2. Make sure custom code is in the correct sections (Head for CSS, Footer for JS)
3. Verify the code is wrapped in proper tags (`<style>` and `<script>`)
4. Check browser console for error messages
5. Ensure jQuery loads before the footer code

## 📝 Notes

- Console logs are included for debugging. Remove them in production if desired.
- The animation works on all modern browsers with CSS transform support
- Mobile responsive with faster transitions on smaller screens
- No external dependencies except jQuery (already in Webflow)

