# How to Verify Visitor Tracking in Google Sheets

## Step-by-Step Verification Guide

### Prerequisites
- Development server running: `npm run dev`
- Google Sheets open in another browser tab
- .env.local configured with GOOGLE_APPS_SCRIPT_URL and LEOR_WEBHOOK_SECRET
- Apps Script deployment with visitor_event handler active

---

## Part 1: Verify Visitor Footprints Tab Exists

### 1. Open Google Sheets
- Navigate to your Leor Design Google Sheet
- You should see tabs at the bottom

### 2. Locate Visitor Footprints Tab
- Should see tabs: "Leads" | "Visitor Footprints" | ...
- If "Visitor Footprints" doesn't exist, contact us

### 3. Check Column Headers
Click on "Visitor Footprints" tab and verify these 19 column headers (A through S):

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| Timestamp (IST) | Anonymous Visitor ID | Session ID | Event ID | Event Name | Page URL | Page Title | Previous Page | Referral Source | UTM Source |

| K | L | M | N | O | P | Q | R | S |
|---|---|---|---|---|---|---|---|---|
| UTM Medium | UTM Campaign | Device Type | Browser | Operating System | Time on Page (Seconds) | CTA Name | Cookie Consent Status | Lead ID |

If all 19 columns exist → ✅ Tab is ready

---

## Part 2: Test Visitor Event Submission

### 1. Start Development Server
```bash
cd C:\Users\gayat\leor-design
npm run dev
```

Wait for: `▲ Next.js ... - Local: http://localhost:3000`

### 2. Open http://localhost:3000 in Browser
- Open DevTools: F12
- Go to Console tab

### 3. Generate a Test Visitor Event

Copy and paste this in the Console (all one command):

```javascript
fetch('/api/visitor-event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventName: 'page_view',
    visitorId: 'test-visitor-' + Math.random().toString(36).slice(2, 9),
    sessionId: 'test-session-' + Math.random().toString(36).slice(2, 9),
    eventId: 'test-event-' + Date.now(),
    pageUrl: 'http://localhost:3000/',
    pageTitle: 'Test Page View',
    previousPage: '',
    referralSource: 'test-referral',
    utmSource: 'test-source',
    utmMedium: 'test-medium',
    utmCampaign: 'test-campaign',
    deviceType: 'desktop',
    browser: 'Chrome',
    operatingSystem: 'Windows',
    timeOnPage: 0,
    ctaName: '',
    cookieConsent: 'accepted',
    leadId: ''
  })
})
.then(r => {
  console.log('API Response Status:', r.status);
  return r.json();
})
.then(d => console.log('API Response Data:', d))
.catch(e => console.error('Error:', e));
```

### 4. Check Console Output
- Should see: `API Response Status: 201`
- Should see: `API Response Data: { message: 'Visitor event recorded.', eventId: '...' }`

✅ If you see 201 and event recorded → API is working

---

## Part 3: Check Google Sheets for New Row

### 1. Go Back to Google Sheets Tab
- Don't close Google Sheets browser tab from before

### 2. Refresh the Page
- Press Ctrl+R or Cmd+R
- Wait for page to load

### 3. Click "Visitor Footprints" Tab
- Should still be on this tab

### 4. Scroll to Bottom of Data
- Look for the most recent row (highest row number)

### 5. Verify New Row Contains
| Column | Expected Value |
|--------|---|
| A (Timestamp) | Current date/time in IST format |
| B (Visitor ID) | 16-char random (test-visitor-...) |
| C (Session ID) | 16-char random (test-session-...) |
| D (Event ID) | Started with "test-event-" |
| E (Event Name) | "page_view" |
| F (Page URL) | "http://localhost:3000/" |
| G (Page Title) | "Test Page View" |
| H (Previous Page) | (empty) |
| I (Referral Source) | "test-referral" |
| J (UTM Source) | "test-source" |
| K (UTM Medium) | "test-medium" |
| L (UTM Campaign) | "test-campaign" |
| M (Device Type) | "desktop" |
| N (Browser) | "Chrome" |
| O (Operating System) | "Windows" |
| P (Time on Page) | 0 |
| Q (CTA Name) | (empty) |
| R (Cookie Consent) | "accepted" |
| S (Lead ID) | (empty) |

✅ If new row appears with correct data → Google Sheets integration works

---

## Part 4: Test Form Submission Integration

### 1. Fill Consultation Form

Go back to http://localhost:3000 and:

1. Scroll down to "Get Free Consultation" form
2. Fill in:
   - Name: "Test User"
   - Mobile: "9876543210"
   - Email: "test@example.com"
   - Location: "Bangalore"
   - Home Type: "3 BHK"
   - Services: Check "Interior Design"
   - Consent: Check the checkbox

3. Open DevTools Network tab → Filter "visitor-event"

4. Click "Get a free consultation" button

### 2. Check Network Tab
- Should see POST requests to `/api/visitor-event`
- One of them should have eventName: "form_submit"
- All should have Status: 201

### 3. Check Google Sheets Leads Tab

1. Go to Google Sheets
2. Click "Leads" tab
3. Scroll to bottom
4. Should see new row with:
   - Name: "Test User"
   - Mobile: "9876543210"
   - Email: "test@example.com"
   - Locality: "Bangalore"
   - Property Type: "Apartment"
   - Services: "Interior Design"
   - Consent: "Yes" or timestamp

### 4. Check Google Sheets Visitor Footprints Tab

1. Go to "Visitor Footprints" tab
2. Scroll to bottom
3. Should see new rows with:
   - Event Name: "form_submit"
   - CTA Name: "consultation-form"
   - Status: "accepted" or similar

✅ If new rows appear in BOTH tabs → Form submission works

---

## Part 5: Test UTM Parameter Persistence

### 1. Visit with UTM Parameters

In browser address bar, navigate to:
```
http://localhost:3000?utm_source=google&utm_medium=cpc&utm_campaign=spring-sale
```

### 2. Check Browser Console

Open DevTools Console and run:
```javascript
console.log('UTM Source:', sessionStorage.getItem('leor_utm_source'));
console.log('UTM Medium:', sessionStorage.getItem('leor_utm_medium'));
console.log('UTM Campaign:', sessionStorage.getItem('leor_utm_campaign'));
```

Should see:
```
UTM Source: google
UTM Medium: cpc
UTM Campaign: spring-sale
```

### 3. Navigate to Different Page
- Click any navigation link
- Go to different page

### 4. Check sessionStorage Again

Run the same command in Console on new page:
```javascript
console.log('UTM Source:', sessionStorage.getItem('leor_utm_source'));
console.log('UTM Medium:', sessionStorage.getItem('leor_utm_medium'));
console.log('UTM Campaign:', sessionStorage.getItem('leor_utm_campaign'));
```

Should STILL see:
```
UTM Source: google
UTM Medium: cpc
UTM Campaign: spring-sale
```

✅ If UTM values persist → UTM tracking works

### 5. Submit Form and Check Google Sheets

1. Scroll to form and submit with UTM parameters still active
2. Check Google Sheets:
   - Leads tab: Columns 13-15 should show: google | cpc | spring-sale
   - Visitor Footprints tab: Columns J-L should show: google | cpc | spring-sale

✅ If UTM values in both tabs → Full integration works

---

## Part 6: Test Device Detection

### 1. Test Desktop
- Open http://localhost:3000 on full-screen
- Send test event (use Part 2 instructions)
- Check Google Sheets: Column M (Device Type) should be "desktop"

### 2. Test Tablet
- Press F12 to open DevTools
- Click device toggle (mobile phone icon, top-left of DevTools)
- Select "iPad" or tablet device
- Send test event
- Check Google Sheets: Column M should be "tablet"

### 3. Test Mobile
- With DevTools still open
- Select "iPhone 12" or mobile device
- Send test event
- Check Google Sheets: Column M should be "mobile"

✅ If device types match → Device detection works

---

## Part 7: Complete End-to-End Test

### Scenario
A visitor arrives from Google with UTM campaign, views multiple pages, and submits the estimator form.

### Steps

1. **Arrive with UTM**
   ```
   http://localhost:3000?utm_source=google&utm_medium=cpc&utm_campaign=summer-2024
   ```
   - Record visitor ID from console

2. **Navigate Between Pages**
   - Click links
   - Visit multiple pages
   - Stay on each page for 5+ seconds

3. **Submit Estimator Form**
   - Scroll to budget calculator
   - Fill and submit
   - Watch Network tab for visitor-event calls

4. **Check Google Sheets - Leads Tab**
   - New row created with:
     - Visitor's name and mobile
     - Columns 13-15: google | cpc | summer-2024
     - All 21 columns populated

5. **Check Google Sheets - Visitor Footprints Tab**
   - Multiple rows for same visitor ID:
     - page_view events for each page visited
     - page_leave events with time-on-page values
     - form_submit event with ctaName: "estimator-form"
   - All rows should have:
     - Same Visitor ID
     - UTM values in columns J-L
     - Correct device type in column M
     - "accepted" in cookie consent (column R)

✅ If all above verified → Full system works end-to-end

---

## Troubleshooting: If Data Doesn't Appear

### Check 1: API is Receiving Requests

In browser DevTools:
- Network tab
- Filter: "visitor-event"
- Reload page
- Should see POST request(s)

**If NO requests:**
- Check for JavaScript errors in console
- Verify sessionStorage has visitor ID
- Check that tracking-initializer is in layout

**If requests show status 400 or 500:**
- Click request → Response tab
- Read error message
- Check API route.ts for validation

### Check 2: Apps Script is Responding

In browser DevTools:
- Network tab → POST to visitor-event
- Click request → Response tab
- Should see JSON: `{ success: true, eventId: '...' }`

**If error response:**
- Check Apps Script deployment is active
- Verify Apps Script has visitor_event handler
- Check webhook secret is correct in .env.local

### Check 3: Google Sheets Tab Exists

- Open Google Sheets
- Check tab names at bottom
- Should see "Visitor Footprints" tab

**If missing:**
- Create tab manually: Right-click tab area → Insert sheet
- Name it "Visitor Footprints"
- Add 19 column headers as listed in Part 1

### Check 4: Google Sheets Permissions

- Verify your Google Apps Script can write to this spreadsheet
- Check spreadsheet sharing settings
- Verify script has Sheets permission

---

## Summary of Verification

Once you complete all 7 parts above:

✅ Part 1: Visitor Footprints tab exists with 19 columns
✅ Part 2: API accepts visitor events and returns 201
✅ Part 3: Test visitor event appears in Google Sheets
✅ Part 4: Form submission creates rows in both Leads and Visitor Footprints
✅ Part 5: UTM parameters persist and appear in both sheets
✅ Part 6: Device detection works (desktop/tablet/mobile)
✅ Part 7: Full end-to-end scenario works

**If all 7 parts pass → Visitor tracking system is working correctly!**

---

## Next Actions

After verification:

1. ✅ Run `npm run build` to confirm production build works
2. ✅ Merge changes to production branch
3. ✅ Deploy to hosting platform
4. ✅ Monitor Google Sheets for ongoing tracking
5. ✅ Monitor server logs for errors
6. ✅ Consider adding more event types (estimator_open, cta_click, etc.)

---

## Questions?

Refer to:
- `VISITOR_TRACKING_TEST_GUIDE.md` - More detailed testing
- `VISITOR_TRACKING_IMPLEMENTATION.md` - Technical reference
- `app/api/visitor-event/route.ts` - API implementation
- `src/lib/visitorTracking.ts` - Client-side tracking

---

## Support Email Response Template

If you email about tracking not working, include:

1. Screenshot of Google Sheets (showing Visitor Footprints columns)
2. Browser console output (F12 → Console)
3. Network tab screenshot showing visitor-event requests
4. Any error messages from Parts 1-7 above
5. Browser and OS you tested on

This will help us debug quickly!
