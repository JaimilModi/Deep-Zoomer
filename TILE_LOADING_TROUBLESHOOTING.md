# 🔧 Tile Loading Troubleshooting Guide

## 🚨 **"Tile Load Failed" Error - Solutions**

### **Quick Fixes to Try:**

1. **Test DZI Files Directly**
   - Visit: `http://localhost:8080/dzi-test`
   - Check browser console for detailed error messages
   - This will help identify the exact issue

2. **Verify File Structure**
   ```
   public/
   ├── earth_tiles.dzi ✅
   ├── earth_tiles_files/ ✅
   │   ├── 0/0_0.jpg ✅
   │   ├── 1/0_0.jpg ✅
   │   └── ...
   ```

3. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for network errors in Console tab
   - Check Network tab for failed requests

## 🔍 **Common Issues & Solutions**

### **Issue 1: CORS Errors**
**Symptoms**: Cross-origin request blocked
**Solution**:
```javascript
// Add to vite.config.ts
export default defineConfig({
  server: {
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  }
});
```

### **Issue 2: File Path Problems**
**Symptoms**: 404 errors for tile files
**Solution**:
```javascript
// Ensure correct paths in Gallery component
const images = [
  {
    href: "/earth-image.jpg",
    title: "Earth Day",
    highResUrl: "/earth_tiles.dzi", // ✅ Correct path
  }
];
```

### **Issue 3: DZI Format Issues**
**Symptoms**: Invalid DZI file format
**Solution**:
```xml
<!-- Check DZI file format -->
<?xml version="1.0" encoding="UTF-8"?>
<Image xmlns="http://schemas.microsoft.com/deepzoom/2008"
  Format="jpg"
  Overlap="1"
  TileSize="256">
  <Size Height="3718" Width="3718"/>
</Image>
```

### **Issue 4: OpenSeadragon Configuration**
**Symptoms**: Tiles load but display incorrectly
**Solution**:
```javascript
// Correct OpenSeadragon configuration
osdRef.current = OpenSeadragon({
  element: container,
  prefixUrl: "https://cdn.jsdelivr.net/npm/openseadragon@4.1/build/openseadragon/images/",
  tileSources: "/earth_tiles.dzi", // Direct DZI path
  tileSize: 256, // Match DZI tile size
  maxZoomPixelRatio: 2,
  // ... other settings
});
```

## 🛠️ **Step-by-Step Debugging**

### **Step 1: Test Basic DZI Loading**
1. Go to `http://localhost:8080/dzi-test`
2. Check if the viewer loads
3. Look for console messages

### **Step 2: Check Network Requests**
1. Open Developer Tools (F12)
2. Go to Network tab
3. Try to zoom/pan the image
4. Look for failed requests (red entries)

### **Step 3: Verify File Access**
1. Try accessing DZI file directly: `http://localhost:8080/earth_tiles.dzi`
2. Try accessing a tile directly: `http://localhost:8080/earth_tiles_files/0/0_0.jpg`
3. Both should return the files (not 404)

### **Step 4: Check Console Errors**
Look for these common errors:
- `CORS policy` - Cross-origin issues
- `404 Not Found` - Missing files
- `Failed to load resource` - Network issues
- `Invalid DZI format` - File format problems

## 🔧 **Advanced Solutions**

### **Solution 1: Fix CORS Issues**
```javascript
// Add to vite.config.ts
export default defineConfig({
  server: {
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
});
```

### **Solution 2: Fix File Serving**
```javascript
// Ensure Vite serves static files correctly
// In vite.config.ts
export default defineConfig({
  publicDir: 'public',
  server: {
    fs: {
      allow: ['..']
    }
  }
});
```

### **Solution 3: Fix OpenSeadragon Configuration**
```javascript
// Use proper DZI configuration
const tileSource = {
  type: "dzi",
  url: "/earth_tiles.dzi",
  tileSize: 256,
  overlap: 1,
  format: "jpg"
};

osdRef.current = OpenSeadragon({
  element: container,
  tileSources: tileSource,
  // ... other settings
});
```

### **Solution 4: Add Error Handling**
```javascript
// Add comprehensive error handling
viewer.addHandler("tile-load-failed", (event) => {
  console.error("Tile load failed:", event);
  // Retry logic
  setTimeout(() => {
    viewer.forceRedraw();
  }, 1000);
});

viewer.addHandler("error", (event) => {
  console.error("Viewer error:", event);
  // Show user-friendly error message
});
```

## 🚀 **Quick Fixes to Try**

### **Fix 1: Restart Development Server**
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### **Fix 2: Clear Browser Cache**
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or clear browser cache completely

### **Fix 3: Check File Permissions**
```bash
# Ensure files are readable
chmod -R 755 public/
```

### **Fix 4: Use Absolute Paths**
```javascript
// Try absolute paths instead of relative
const imageUrl = "http://localhost:8080/earth_tiles.dzi";
```

## 🔍 **Diagnostic Tools**

### **Browser Console Commands**
```javascript
// Check if OpenSeadragon is loaded
console.log(typeof OpenSeadragon);

// Check viewer instance
console.log(osdRef.current);

// Check tile source
console.log(osdRef.current?.world?.getItemAt(0)?.getSource());
```

### **Network Tab Analysis**
1. Look for failed requests (red entries)
2. Check response codes (404, 500, etc.)
3. Verify file sizes and content types
4. Check if CORS headers are present

### **File System Check**
```bash
# Verify DZI files exist
ls -la public/*.dzi

# Verify tile directories exist
ls -la public/*_files/

# Check tile files
ls -la public/earth_tiles_files/0/
```

## 📊 **Expected Behavior**

### **Working Correctly:**
- ✅ DZI file loads without errors
- ✅ Tiles load as you zoom in
- ✅ Smooth zooming and panning
- ✅ No console errors
- ✅ Network requests return 200 status

### **Common Error Patterns:**
- ❌ 404 errors for tile files
- ❌ CORS policy errors
- ❌ Invalid DZI format errors
- ❌ Network timeout errors
- ❌ JavaScript errors in console

## 🎯 **Final Checklist**

- [ ] DZI files exist in `/public` directory
- [ ] Tile directories contain expected files
- [ ] Browser can access DZI files directly
- [ ] No CORS errors in console
- [ ] OpenSeadragon configuration is correct
- [ ] Development server is running
- [ ] Browser cache is cleared
- [ ] File permissions are correct

## 🚨 **Emergency Fallback**

If nothing works, try this minimal configuration:

```javascript
// Minimal working configuration
osdRef.current = OpenSeadragon({
  element: container,
  prefixUrl: "https://cdn.jsdelivr.net/npm/openseadragon@4.1/build/openseadragon/images/",
  tileSources: "/earth_tiles.dzi",
  showNavigator: true,
  showNavigationControl: true,
});
```

---

**🔧 Try the diagnostic steps above and let me know what errors you see in the console!**
