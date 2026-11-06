# Quick Testing Checklist - Leor Design Website

## 🚀 Start Here

### Step 1: Start Development Server
```bash
cd C:\Users\gayat\leor-design
npm.cmd run dev
```
**Expected:** Server starts on http://localhost:3000

---

## ✅ Test Checklist

### Test 1: Popup Form Submission (2-3 minutes)
- [ ] Go to http://localhost:3000
- [ ] Wait for popup or click "Register to unlock flat 10% off"
- [ ] Fill form:
  - Name: `John Doe`
  - Mobile: `9876543210`
  - Email: `john@example.com`
  - Consent: ✓ Check
- [ ] Click "Continue to claim 10% off"
- [ ] Verify: See "Your registration has been saved" message
- [ ] Expected: ✅ Success - Data sent to Google Sheets

### Test 2: Main Enquiry Form (2-3 minutes)
- [ ] Scroll to bottom: "Our Services" section
- [ ] Fill form completely:
  - Name: `Jane Smith`
  - Mobile: `9999999999`
  - Email: `jane@example.com`
  - Locality: `Bangalore`
  - Property Type: `Apartment`
  - Services: Check any (e.g., Living Room)
  - Requirements: `Test submission`
- [ ] Click "Send Enquiry"
- [ ] Verify: Confirmation shows your name
- [ ] Expected: ✅ Success - Email in Google Sheets column D/F

### Test 3: Email Field Validation (1 minute)
- [ ] Open any form
- [ ] Try submitting with invalid email: `notanemail`
- [ ] Verify: Error message appears
- [ ] Try empty email: Leave blank
- [ ] Verify: Form accepts (optional field)
- [ ] Expected: ✅ Validation working

### Test 4: WhatsApp Click Tracking (2 minutes)
- [ ] Open http://localhost:3000
- [ ] Click any WhatsApp button/link
- [ ] Open DevTools (F12) → Application → Session Storage
- [ ] Look for key: `leor_whatsapp_clicked`
- [ ] Verify: Value is `true`
- [ ] Expected: ✅ WhatsApp clicks tracked

### Test 5: UTM Tracking (2 minutes)
- [ ] Visit: http://localhost:3000?utm_source=test&utm_medium=social&utm_campaign=launch
- [ ] Open DevTools (F12) → Application → Session Storage
- [ ] Verify keys exist:
  - `leor_utm_source` = `test`
  - `leor_utm_medium` = `social`
  - `leor_utm_campaign` = `launch`
- [ ] Submit any form
- [ ] Expected: ✅ UTM values appear in Google Sheets

### Test 6: Mobile Responsiveness (2 minutes)
- [ ] Open DevTools (F12) → Toggle Device Toolbar (Ctrl+Shift+M)
- [ ] Set width to 375px (Mobile)
- [ ] Verify:
  - [ ] No horizontal scrolling
  - [ ] All text readable
  - [ ] Buttons easy to tap (44px+)
  - [ ] Forms accessible
- [ ] Set width to 768px (Tablet)
- [ ] Verify: Layout adjusts properly
- [ ] Set width to 1440px (Desktop)
- [ ] Verify: Full layout displays
- [ ] Expected: ✅ Responsive on all sizes

### Test 7: Technical Quality (2 minutes)
```bash
# Terminal 1: Keep dev server running
# Terminal 2: Run checks

# TypeScript Check
npx tsc --noEmit
# Expected: No errors

# ESLint Check
npm.cmd run lint
# Expected: No errors

# Build Check
npm.cmd run build
# Expected: Success message, no errors
```

---

## 📊 Verification in Google Sheets

After running tests, check your Google Sheets:

1. Open your spreadsheet
2. Go to "Leads" tab
3. Look for new rows with:
   - Name: John Doe, Jane Smith, etc.
   - Mobile: 9876543210, 9999999999, etc.
   - **Email**: john@example.com, jane@example.com (Column D/F)
   - **UTM Source**: test (if UTM test done)
   - **WhatsApp Clicked**: TRUE (if clicked WhatsApp)

**Expected:** ✅ All submitted form data appears with correct values

---

## 🐛 Troubleshooting

### Form not submitting?
1. Check browser console (F12) for errors
2. Check DevTools Network tab for POST to `/api/enquiry`
3. Verify form fields all have values

### Email not saving?
1. Submit form with valid email (required format: user@domain.com)
2. Check Google Sheets column D (Email)
3. Email should appear in that column

### Tracking not appearing?
1. For WhatsApp: Click WhatsApp link BEFORE submitting form
2. For UTM: Include query params in URL BEFORE visiting page
3. Check Session Storage (DevTools > Application > Session Storage)

### Responsive layout broken?
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh page
3. Check DevTools for CSS errors
4. Try different browser

---

## ✨ Expected Results Summary

| Test | Expected Result |
|------|-----------------|
| **Popup Form** | Submits successfully, data appears in Google Sheets |
| **Main Form** | Email field present, saves to Google Sheets |
| **Email Field** | Validates format, optional but checks if provided |
| **WhatsApp Tracking** | Clicks recorded in sessionStorage, included in submission |
| **UTM Tracking** | Parameters captured from URL, persisted, sent to Sheets |
| **Mobile (375px)** | No horizontal scroll, all content accessible |
| **Tablet (768px)** | Responsive layout, no layout breaks |
| **Desktop (1440px)** | Full layout, optimal spacing |
| **TypeScript** | 0 errors |
| **ESLint** | 0 errors |
| **Build** | Successful compilation |
| **Console** | No JavaScript errors |

---

## 🎯 Quick Decision Tree

```
Did the popup form submit?
├─ YES ✅ → Continue to next test
└─ NO ❌ → Check browser console, verify network request

Did email save to Google Sheets?
├─ YES ✅ → Email field working correctly
└─ NO ❌ → Verify email format valid, check Sheets column D

Does responsive design work on mobile?
├─ YES ✅ → No horizontal scroll, all fields visible
└─ NO ❌ → Clear cache, refresh, check CSS

Are UTM values in Google Sheets?
├─ YES ✅ → Tracking working end-to-end
└─ NO ❌ → Verify URL has query params, submit again

Are WhatsApp clicks recorded?
├─ YES ✅ → Click tracking working
└─ NO ❌ → Click WhatsApp link before submitting form

All tests passing?
├─ YES ✅ → READY FOR PRODUCTION
└─ NO ❌ → Review FINAL_AUDIT_REPORT.md for details
```

---

## 📝 Test Results Template

Copy and fill this out after testing:

```
TEST DATE: _______________
TESTER: ___________________

RESULTS:
Popup Form: ☐ PASS ☐ FAIL
Main Form: ☐ PASS ☐ FAIL
Email Field: ☐ PASS ☐ FAIL
WhatsApp Tracking: ☐ PASS ☐ FAIL
UTM Tracking: ☐ PASS ☐ FAIL
Mobile (375px): ☐ PASS ☐ FAIL
Tablet (768px): ☐ PASS ☐ FAIL
Desktop (1440px): ☐ PASS ☐ FAIL
TypeScript: ☐ PASS ☐ FAIL
ESLint: ☐ PASS ☐ FAIL
Build: ☐ PASS ☐ FAIL
Console: ☐ PASS ☐ FAIL

NOTES:
_______________________________
_______________________________

OVERALL: ☐ PASS ☐ FAIL
```

---

## 📞 Need Help?

1. **Check the full report:** See `FINAL_AUDIT_REPORT.md` for detailed documentation
2. **Review code changes:** See `app/components/home/forms.tsx` for implementation details
3. **Verify functionality:** Run the tests above in order
4. **Check Google Sheets:** Verify data is being saved to correct columns

---

**Status:** ✅ READY FOR TESTING  
**Last Updated:** 2025  
**All Tests:** Designed to be completed in ~20 minutes
