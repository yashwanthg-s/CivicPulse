# ⚡ INSTALL LEAFLET NOW - Quick Action Guide

## The Problem
Vite can't find Leaflet because it's not installed yet.

## The Solution
Install Leaflet packages in 30 seconds.

---

## 🚀 DO THIS NOW

### Copy & Paste This Command
```bash
cd frontend && npm install leaflet leaflet.heat react-leaflet
```

**That's it!** Just run this one command.

---

## What Happens

### Step 1: Command Runs
```
cd frontend && npm install leaflet leaflet.heat react-leaflet
```

### Step 2: npm Downloads Packages
```
added 15 packages in 45s
```

### Step 3: Restart Dev Server
```bash
npm run dev
```

### Step 4: Test
- Open admin dashboard
- Click "🔥 Heat Map" tab
- ✅ Map displays!

---

## If npm install Fails

### Try This
```bash
npm install --force leaflet leaflet.heat react-leaflet
```

### Or This
```bash
npm cache clean --force
npm install leaflet leaflet.heat react-leaflet
```

### Or This (Nuclear Option)
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Verify It Worked

### Check if packages installed
```bash
npm list leaflet leaflet.heat react-leaflet
```

Should show version numbers like:
```
leaflet@1.9.4
leaflet.heat@0.2.0
react-leaflet@4.2.1
```

---

## Then What?

1. **Restart dev server**
   ```bash
   npm run dev
   ```

2. **Open browser**
   - Go to admin dashboard
   - Click "🔥 Heat Map" tab

3. **Enjoy!**
   - Map displays with complaint hotspots
   - All features work

---

## Still Not Working?

### Hard Refresh Browser
- Windows/Linux: `Ctrl+Shift+R`
- Mac: `Cmd+Shift+R`

### Check Browser Console
- Press `F12`
- Look for errors
- Share errors if still stuck

### Verify Backend Running
```bash
curl http://localhost:5003/api/admin/heatmap
```

Should return JSON data, not error.

---

## Summary

| Step | Command | Time |
|------|---------|------|
| 1 | `cd frontend` | 1s |
| 2 | `npm install leaflet leaflet.heat react-leaflet` | 45s |
| 3 | `npm run dev` | 5s |
| 4 | Test in browser | 10s |

**Total Time**: ~1 minute

---

## That's All!

Just run the install command and you're done. The heatmap will work immediately after.

**Ready?** → Run: `cd frontend && npm install leaflet leaflet.heat react-leaflet`
