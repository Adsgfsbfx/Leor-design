# Visitor Tracking - Step-by-Step Test Instructions

## Quick Start

### 1. Start Development Server
```bash
cd C:\Users\gayat\leor-design
npm run dev
```
Wait until you see: `▲ Next.js X.X.X (Turbopack)` and `- Local: http://localhost:3000`

### 2. Open in Browser
- Navigate to: http://localhost:3000
- Open DevTools: F12
- Go to Console tab

### 3. You Should See
Log message like:
```
[tracking-init] { utm_source: '', utm_medium: '', utm_campaign: '', whatsapp_previously_clicked: false }
```

This confirms visitor tracking initialized.

---

## Test 1: Verify Visitor ID and Session ID

### In Browser Console
```javascript
sessionStorage.getItem('leor-visitor-id')
sessionStorage.getItem('leor-session-id')
```

You should get output like:
```
"a7b8c9d0e1f2g3h4"  // visitor ID
"k5l6m7n8o9p0q1r2"  // session ID
```

### Expected Result
✅ Both IDs are 16-character random strings
✅ Visitor ID persists across page reloads
✅ Session ID persists across page navigation

---

## Test 2: Test API Endpoint Directly

### Open Browser Console and Run:
```javascript
fetch('/api/visitor-event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventName: 'page_view',
    visitorId: sessionStorage.getItem('leor-visitor-id'),
    sessionId: sessionStorage.getItem('leor-session-id'),
    eventId: 'manual-test-' + Date.now(),
    pageUrl: window.location.href,
    pageTitle: document.title,
    previousPage: '',
    referralSource: '',
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
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
  console.log('Status:', r.status);
  return r.json();
})
.then(d => console.log('Response:', d))
.catch(e => console.error('Error:', e));
```

### Expected Result
✅ Status: 201
✅ Response message: "Visitor event recorded."
✅ eventId is returned

---

## Test 3: Check Network Tab for API Calls

### Steps
1. Open DevTools → Network tab
2. Filter by "visitor-event"
3. Reload page http://localhost:3000
4. Look for POST requests to `/api/visitor-event`

### Expected Result
✅ You should see at least one POST request
✅ Status: 201
✅ Request contains JSON payload with visitor data

---

## Test 4: Test Form Submission with Tracking

### Fill Consultation Form
1. Scroll to "Get Free Consultation" form
2. Enter:
   - Name: "Test User"
   - Mobile: "9876543210"
   - Email: "test@example.com"
   - Location: "Bangalore"
   - Home Type: "3 BHK"
   - Services: Check "Interior Design"
   - Consent: Check the checkbox

### Open Console Before Submitting
- Make sure Console tab is open
- Look for any errors

### Submit Form
- Click "Get a free consultation" button

### Check Network Tab
1. Go to Network tab → Filter "visitor-event"
2. You should see:
   - Multiple POST requests to `/api/visitor-event`
   - One with eventName: "form_submit"
   - Status 201 for all

### Expected Result
✅ Form submits successfully (says "Thanks")
✅ Network shows form_submit event sent to `/api/visitor-event`
✅ No console errors

---

## Test 5: UTM Parameter Persistence

### Test URL with UTM Parameters
1. Visit: http://localhost:3000?utm_source=google&utm_medium=cpc&utm_campaign=spring
2. Open Console
3. Check:
```javascript
sessionStorage.getItem('leor_utm_source')   // Should be "google"
sessionStorage.getItem('leor_utm_medium')   // Should be "cpc"
sessionStorage.getItem('leor_utm_campaign') // Should be "spring"
```

### Navigate Between Pages
- Click on links/navigation
- Revisit page

### Check sessionStorage Again
```javascript
sessionStorage.getItem('leor_utm_source')   // Should STILL be "google"
sessionStorage.getItem('leor_utm_medium')   // Should STILL be "cpc"
sessionStorage.getItem('leor_utm_campaign') // Should STILL be "spring"
```

### Expected Result
✅ UTM values capture from landing page URL
✅ UTM values persist across page navigation
✅ UTM values persist until browser tab closed

---

## Test 6: Device Type Detection

### Test on Different Screen Sizes

#### Desktop (1920px)
```javascript
// Send test event
fetch('/api/visitor-event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventName: 'test_event',
    visitorId: sessionStorage.getItem('leor-visitor-id'),
    sessionId: sessionStorage.getItem('leor-session-id'),
    eventId: 'desktop-test-' + Date.now(),
    pageUrl: window.location.href,
    pageTitle: document.title,
    previousPage: '',
    referralSource: '',
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    deviceType: 'desktop',
    browser: 'Chrome',
    operatingSystem: 'Windows',
    timeOnPage: 0,
    ctaName: '',
    cookieConsent: 'unknown',
    leadId: ''
  })
}).then(r => r.json()).then(d => console.log(d));
```

#### Tablet (768px)
- Press F12 to open DevTools
- Click device toggle (mobile icon)
- Choose iPad
- deviceType should be "tablet"

#### Mobile (375px)
- Press F12 to open DevTools
- Click device toggle (mobile icon)
- Choose Pixel 5 (375px)
- deviceType should be "mobile"

### Expected Result
✅ Desktop → deviceType: "desktop"
✅ Tablet → deviceType: "tablet"
✅ Mobile → deviceType: "mobile"

---

## Test 7: Rate Limiting

### Send 31 Events in Rapid Succession
```javascript
async function testRateLimit() {
  for (let i = 0; i < 31; i++) {
    const response = await fetch('/api/visitor-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'rate_limit_test',
        visitorId: sessionStorage.getItem('leor-visitor-id'),
        sessionId: sessionStorage.getItem('leor-session-id'),
        eventId: 'rate-test-' + Date.now() + '-' + i,
        pageUrl: window.location.href,
        pageTitle: document.title,
        previousPage: '',
        referralSource: '',
        utmSource: '',
        utmMedium: '',
        utmCampaign: '',
        deviceType: 'desktop',
        browser: 'Chrome',
        operatingSystem: 'Windows',
        timeOnPage: 0,
        ctaName: '',
        cookieConsent: 'unknown',
        leadId: ''
      })
    });
    console.log(`Event ${i + 1}:`, response.status);
  }
}
testRateLimit();
```

### Expected Result
✅ Events 1-30: Status 201
✅ Event 31: Status 429 (Too Many Requests)

---

## Test 8: Verify Google Sheets Integration

### Before Testing
1. Make sure you have the spreadsheet open in another browser tab
2. Have the .env.local file with:
   - GOOGLE_APPS_SCRIPT_URL
   - LEOR_WEBHOOK_SECRET

### Send Test Event
```javascript
fetch('/api/visitor-event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventName: 'page_view',
    visitorId: sessionStorage.getItem('leor-visitor-id'),
    sessionId: sessionStorage.getItem('leor-session-id'),
    eventId: 'sheets-test-' + Date.now(),
    pageUrl: window.location.href,
    pageTitle: 'Test Page for Sheets',
    previousPage: '',
    referralSource: 'direct',
    utmSource: 'test-source',
    utmMedium: 'test-medium',
    utmCampaign: 'test-campaign',
    deviceType: 'desktop',
    browser: 'Chrome',
    operatingSystem: 'Windows',
    timeOnPage: 5,
    ctaName: '',
    cookieConsent: 'accepted',
    leadId: ''
  })
}).then(r => r.json()).then(d => console.log('Sent:', d));
```

### Check Google Sheets
1. Switch to Google Sheets browser tab
2. Refresh the page (Ctrl+R)
3. Navigate to "Visitor Footprints" tab
4. Look for new rows with:
   - Your visitor ID in "Anonymous Visitor ID" column
   - "page_view" in "Event Name" column
   - "test-source" in "UTM Source" column
   - Current timestamp in "Timestamp" column

### Expected Result
✅ New row appears in Visitor Footprints tab
✅ All columns filled with sent data
✅ Timestamp is IST (India Standard Time)

---

## Test 9: Form Submission Integration

### Fill and Submit Estimator Form (Popup)

### Prerequisite
- Click on any "Budget Calculator" or "Estimator" link to open popup

### Fill Form
- Select property type
- Select services
- Enter name
- Enter mobile number
- Accept checkbox

### Check Console/Network BEFORE Submitting
- Open DevTools → Network tab
- Filter by "visitor-event"

### Submit Form
- Click Submit button

### Check Network
- Should see multiple POST requests to `/api/visitor-event`:
  - `form_submit` event with `ctaName: "estimator-form"`
  - Status: 201 for all

### Check Google Sheets
1. Refresh Google Sheets
2. Go to "Visitor Footprints" tab
3. Look for rows with:
   - Your visitor ID
   - Event: "form_submit"
   - CTA Name: "estimator-form"

4. Go to "Leads" tab
5. Look for new row with:
   - Your name
   - Your mobile number
   - UTM parameters (if you used UTM URL)

### Expected Result
✅ Form submits successfully
✅ Visitor event API called with form_submit
✅ Row created in Leads tab (21 columns)
✅ Row created in Visitor Footprints tab (19 columns)

---

## Test 10: Validation Error Handling

### Send Invalid Payload (Missing Required Field)
```javascript
fetch('/api/visitor-event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventName: 'test',
    // Missing visitorId and sessionId - required fields
    eventId: 'invalid-test',
    pageUrl: 'http://test.com',
    pageTitle: 'Test',
    cookieConsent: 'accepted'
  })
}).then(r => {
  console.log('Status:', r.status);
  return r.json();
}).then(d => console.log('Response:', d));
```

### Expected Result
✅ Status: 400
✅ Response includes validation error message

### Send Invalid Consent Value
```javascript
fetch('/api/visitor-event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventName: 'test',
    visitorId: 'test-visitor',
    sessionId: 'test-session',
    eventId: 'invalid-consent-test',
    pageUrl: 'http://test.com',
    pageTitle: 'Test',
    previousPage: '',
    referralSource: '',
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    deviceType: 'desktop',
    browser: 'Chrome',
    operatingSystem: 'Windows',
    timeOnPage: 0,
    ctaName: '',
    cookieConsent: 'invalid-value', // Invalid!
    leadId: ''
  })
}).then(r => {
  console.log('Status:', r.status);
  return r.json();
}).then(d => console.log('Response:', d));
```

### Expected Result
✅ Status: 400
✅ Response: "cookieConsent must be 'accepted', 'rejected', or 'unknown'"

---

## Troubleshooting

### Issue: No "[tracking-init]" log in console
**Solution:**
- Check that page is fully loaded
- Verify TrackingInitializer component is in layout
- Check for JavaScript errors in console
- Try clearing sessionStorage and reloading

### Issue: 400 error on API call
**Solution:**
- Check that all required fields are present
- Verify cookieConsent is one of: "accepted", "rejected", "unknown"
- Check that field values don't exceed max length
- Look at error message in response

### Issue: 429 Too Many Requests
**Solution:**
- Wait 60 seconds for rate limit window to reset
- Reduce number of events per second
- Normal usage should not trigger this

### Issue: Data not appearing in Google Sheets
**Solution:**
- Check that Apps Script deployment is active
- Check that Visitor Footprints tab exists in spreadsheet
- Check server logs for "[visitor-webhook]" errors
- Verify GOOGLE_APPS_SCRIPT_URL and LEOR_WEBHOOK_SECRET in .env.local
- Try refreshing Google Sheets page (Ctrl+R)

### Issue: Form submission works but API call not sent
**Solution:**
- Check browser console for errors
- Check Network tab to see if request was sent
- Verify visitor ID exists in sessionStorage
- Check that sendVisitorEvent is being awaited

---

## Summary of Expected Behavior

✅ Visitor tracking system initialized on page load
✅ Visitor ID persists across page reloads and navigation
✅ Session ID resets on new tab/window
✅ Events sent to `/api/visitor-event` with 201 status
✅ Rate limit enforced at 30 events/60 seconds
✅ Validation errors return 400 with error message
✅ Data appears in Google Sheets Visitor Footprints tab
✅ Form submissions create rows in both Leads and Visitor Footprints tabs
✅ UTM parameters captured and persisted
✅ Device type detected (desktop/tablet/mobile)

## Next Steps

Once all tests pass:

1. ✅ Commit changes to git
2. ✅ Merge to production branch
3. ✅ Deploy to hosting
4. ✅ Monitor Google Sheets for visitor events
5. ✅ Monitor server logs for errors
6. ✅ Set up alerts for rate limiting abuse
7. ✅ Consider adding more event types (estimator_open, cta_click, etc.)

## Need Help?

Check these files for implementation details:
- `app/api/visitor-event/route.ts` - API implementation
- `src/lib/visitorTracking.ts` - Client-side tracking
- `src/lib/visitorSheets.ts` - Google Sheets integration
- `VISITOR_TRACKING_IMPLEMENTATION.md` - Complete documentation
