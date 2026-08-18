# 🚀 Quick Test Guide - Profile Images

## Start Here ⬇️

### Step 1: Start Backend (Terminal 1)
```powershell
cd backend
npm install  # if needed
npm start
# Check for: "✅ Server is running on port 5000"
```

### Step 2: Start Frontend (Terminal 2)  
```powershell
cd frontend
npm install  # if needed
npm run dev
# Check for: "Local: http://localhost:5173"
```

### Step 3: Open Browser
```
http://localhost:5173
Login करो अपने account से
```

### Step 4: Go to Profile Page
```
Click "Profile" in navigation
Look for "Business Information" section
```

### Step 5: Open DevTools Console (F12)
```
Press F12
Click "Console" tab
Clear existing logs (Ctrl+L)
```

---

## Test 1: Upload Logo ⬇️

```
Steps:
1. Click "Edit Business Information" button
2. Click logo upload area
3. Select any image file
4. See it appear in preview

Watch console for:
✅ 📁 Logo: filename.jpg
✅ 📤 PUT /api/business
✅ ✅ Response received 200
✅ ✅ Business updated successfully
✅ 🖼️ Rendering logo image: http://localhost:5000/uploads/...
✅ ✅ Logo displayed: (ID)
```

---

## Test 2: Save & See Logo Display ⬇️

```
Steps:
1. Click "Save Changes" button
2. Wait for toast notification
3. Modal closes
4. Logo should appear on main page

Watch console for:
✅ 📤 PUT /api/business (request)
✅ ✅ Response received 200 (response)
✅ Toast: "Business profile saved!"
✅ 🖼️ Rendering logo image (display)
✅ ✅ Logo displayed (success)
```

---

## Test 3: Refresh Page ⬇️

```
Steps:
1. Press F5 (refresh page)
2. Wait for page to load
3. Logo should still be there

Watch console for:
✅ 📥 Fetching business (request)
✅ ✅ Business fetched (response)
✅ 📋 Profile - Business data loaded
✅ 🖼️ Setting logo preview
✅ 🖼️ Rendering logo image
✅ ✅ Logo displayed
```

---

## Test 4: Upload Profile Image ⬇️

```
Steps:
1. Click "Edit Business Information" again
2. Click profile image upload area
3. Select image
4. Should appear in preview immediately

Watch console for:
✅ 📸 Starting upload
✅ 📁 Profile Image: filename.jpg
✅ ✅ Business updated successfully
```

---

## Check Network Tab ⬇️

```
Steps:
1. Click "Network" tab in DevTools
2. Upload image
3. Look for requests

Should see:
✅ PUT /api/business → Status 200
✅ GET /api/business → Status 200

If image doesn't show:
❌ GET /uploads/filename.jpg → Status 404
   (means file not saved to backend)
```

---

## If Something Goes Wrong ⬇️

### Console Shows Error?
```
Copy the ❌ error message
Read the error text carefully
Look for:
- "404" = File not found on backend
- "403" = Permission denied
- "500" = Backend server error
```

### Image Doesn't Show?
```
1. Check console for errors (red ❌)
2. Check Network tab:
   - Click on image request
   - Look at "Status" column
   - Should be "200"
3. If 404, file didn't save to backend
   - Check backend/uploads/ folder
4. If you see URL, try accessing it directly:
   - Copy URL from console
   - Paste in new browser tab
   - Should show image or 404 error
```

### Backend Shows Error?
```
Check backend terminal for:
❌ Error logs (red text)
🔍 Look for "500" or "error" keywords
Make sure .env file is correct
```

---

## Expected Console Output (Success) ⬇️

```
📁 Logo: 1234567-logo.jpg
🖼️ Rendering logo image: http://localhost:5000/uploads/1234567-logo.jpg
✅ Logo displayed: 60abc123def456
```

---

## Console Commands (Manual Testing) ⬇️

```javascript
// Test URL transformation
const API_BASE_URL = 'http://localhost:5000/api';
const logo = '/uploads/test-logo.jpg';
const finalUrl = `${API_BASE_URL.replace('/api', '')}${logo}`;
console.log(finalUrl); // Should output: http://localhost:5000/uploads/test-logo.jpg

// Check image element
const img = document.querySelector('[data-type="business-logo"]');
console.log('Original:', img?.getAttribute('data-original'));
console.log('Processed:', img?.getAttribute('data-processed'));

// Test fetching image directly
const testUrl = 'http://localhost:5000/uploads/test.jpg';
fetch(testUrl)
  .then(r => r.ok ? '✅ SUCCESS' : `❌ ERROR ${r.status}`)
  .catch(e => `❌ FAILED: ${e.message}`);
```

---

## 📊 Success Indicators

✅ Can upload image  
✅ Image appears in preview  
✅ Toast shows "Saved!"  
✅ Modal closes  
✅ Image visible on main page  
✅ Console shows ✅ messages  
✅ Network shows 200 status  
✅ Refresh page - image still there  

---

## 📞 Report Issues

अगर कोई समस्या हो तो ये share करो:
1. **Console output** (screenshot/text)
2. **Network tab** (image request status)
3. **Backend terminal** output
4. **Exact error message** (if any)
5. **What you were doing** when it failed

---

## 🎯 That's It!

अब test करो और console में logs देखो! 🚀

सभी ✅ marks मिले तो everything is working! ✨
