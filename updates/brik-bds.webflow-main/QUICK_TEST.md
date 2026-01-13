# Quick Industry Switching Test

## 🚨 **If Industry Switching Isn't Working**

Follow these steps to troubleshoot:

### **Step 1: Open Browser Console**
1. Open your website in a browser
2. Press `F12` to open Developer Tools
3. Click on the "Console" tab
4. Look for any red error messages

### **Step 2: Test Basic Functionality**
In the console, type these commands one by one:

```javascript
// Check if industry data is loaded
console.log('Industry Data:', window.industryData);

// Check if switch function exists
console.log('Switch Function:', typeof window.switchToIndustry);

// Test switching to dental
if (window.switchToIndustry) {
    window.switchToIndustry('dental');
    console.log('Switched to dental');
} else {
    console.log('Switch function not available');
}
```

### **Step 3: Check Available Industries**
```javascript
if (window.industryData) {
    console.log('Available industries:', Object.keys(window.industryData));
} else {
    console.log('No industry data found');
}
```

### **Step 4: Test Content Update**
```javascript
// Test updating hero title manually
const heroTitle = document.querySelector('.section_hero .text_display-xl') || 
                 document.querySelector('#heroTitle') ||
                 document.querySelector('h1');

if (heroTitle && window.industryData && window.industryData.dental) {
    heroTitle.textContent = window.industryData.dental.hero.title;
    console.log('Updated hero title manually');
} else {
    console.log('Could not update hero title');
}
```

## 🔧 **Common Issues & Solutions**

### **Issue: "industryData is undefined"**
**Solution:** The industry data script isn't loading. Check:
- File `js/industry-data.js` exists
- No JavaScript errors in console
- Script is loaded before `footer.js`

### **Issue: "switchToIndustry is not a function"**
**Solution:** The footer.js script isn't loading properly. Check:
- File `footer.js` exists
- No JavaScript errors in console
- Script loads after `industry-data.js`

### **Issue: Content doesn't update**
**Solution:** HTML selectors don't match. The system looks for:
- `#heroTitle` or `.section_hero .text_display-xl` for hero title
- `#service1Title`, `#service2Title`, etc. for service titles
- `[data-industry]` attributes for industry-specific content

## 🎯 **Quick Fix Commands**

If you see errors, try these in the console:

```javascript
// Force reload scripts
location.reload();

// Test manual content update
if (window.industryData && window.industryData.dental) {
    // Update hero
    const hero = document.querySelector('.section_hero .text_display-xl');
    if (hero) hero.textContent = window.industryData.dental.hero.title;
    
    // Update services
    const services = document.querySelectorAll('.section_4-col .col_1');
    services.forEach((service, index) => {
        const title = service.querySelector('.text_label-md');
        if (title && window.industryData.dental.services[index]) {
            title.textContent = window.industryData.dental.services[index].title;
        }
    });
    
    console.log('Manual update completed');
}
```

## 📋 **Test Files Available**

1. **`minimal-test.html`** - Basic functionality test
2. **`simple-test.html`** - Simple interface test
3. **`debug-industry-switcher.html`** - Full debug interface
4. **`test-industry-switcher.html`** - Complete test page

Open any of these in your browser to test the functionality.

## 🆘 **Still Not Working?**

If none of the above works:

1. **Check file paths** - Make sure `js/industry-data.js` and `footer.js` exist
2. **Check file permissions** - Ensure files are readable
3. **Check for JavaScript errors** - Look for syntax errors in the console
4. **Try the test files** - Open `minimal-test.html` to isolate the issue

## 📞 **Need Help?**

If you're still having issues, please:
1. Open the browser console
2. Run the test commands above
3. Share any error messages you see
4. Let me know which test files work/don't work 