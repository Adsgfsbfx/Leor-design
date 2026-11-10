# Cookie Consent System - Local Testing Checklist

## Quick Start
Run these commands to test locally:
```bash
cd C:\Users\gayat\leor-design
npm run dev
# Then visit http://localhost:3000
```

## Step-by-Step Testing

### Phase 1: Banner Visibility

#### Test 1A: Banner Shows on First Visit
- [ ] Clear browser localStorage (DevTools → Storage → Local Storage → Delete all for localhost)
- [ ] Hard refresh page (Ctrl+Shift+R)
- [ ] Verify banner appears at bottom of page
- [ ] Banner content visible: "Your Privacy Matters", three buttons visible
- [ ] Banner is NOT blocking main content

#### Test 1B: Banner Positioning
- [ ] Banner fixed at bottom of viewport
- [ ] Doesn't scroll away when page scrolls
- [ ] Stays above other fixed elements (no overlap)
- [ ] On mobile: Banner still visible and usable at bottom

---

### Phase 2: Accept All Flow

#### Test 2A: Accept All Button
- [ ] Click "Accept All" button
- [ ] Banner immediately disappears
- [ ] Page does not reload
- [ ] No console errors appear

#### Test 2B: Consent Persisted
- [ ] Refresh page (F5)
- [ ] Banner does NOT reappear
- [ ] Open DevTools Console
- [ ] Run: `localStorage.getItem('leor-cookie-preferences')`
- [ ] Result should show: `{"analytics":true,"essential":true,"timestamp":...}`
- [ ] Close and reopen browser
- [ ] Visit site again - banner still gone

#### Test 2C: Tracking Enabled
- [ ] Verify visitor tracking runs (check Network tab for `/api/visitor-event` calls)
- [ ] Each page navigation creates new tracking events
- [ ] Debug log shows: `[tracking-init] analytics_consent: true`

---

### Phase 3: Reject All Flow

#### Test 3A: Reject All Button
- [ ] Clear localStorage again
- [ ] Refresh page - banner appears
- [ ] Click "Reject All" button
- [ ] Banner disappears
- [ ] No console errors

#### Test 3B: Consent Persisted
- [ ] Refresh page
- [ ] Banner does NOT reappear
- [ ] Run: `localStorage.getItem('leor-cookie-preferences')`
- [ ] Result should show: `{"analytics":false,"essential":true,"timestamp":...}`

#### Test 3C: Tracking Disabled
- [ ] Open Network tab
- [ ] Navigate between pages
- [ ] NO `/api/visitor-event` API calls should appear
- [ ] UTM parameters still captured (Check sessionStorage → `leor_utm_*`)
- [ ] WhatsApp clicks still recorded (Check sessionStorage → `leor_whatsapp_clicked`)
- [ ] Debug log shows: `[tracking-init] analytics_consent: false`

---

### Phase 4: Customize Modal

#### Test 4A: Open Customize
- [ ] Clear localStorage
- [ ] Refresh page - banner appears
- [ ] Click "Customize" button
- [ ] Modal appears with overlay background
- [ ] Modal centered on screen
- [ ] Cannot interact with page behind modal

#### Test 4B: Essential Storage Section
- [ ] Verify text: "Essential Storage"
- [ ] Verify badge: "Always Active" (gold background)
- [ ] Verify toggle is disabled/unchecked
- [ ] Cannot click toggle for Essential Storage
- [ ] Description visible: "Required for core website functionality..."

#### Test 4C: Analytics Toggle
- [ ] "Analytics & Tracking" section visible
- [ ] Toggle switch visible (appears OFF initially)
- [ ] Click toggle switch - should turn ON
- [ ] Click again - should turn OFF
- [ ] Toggle animates smoothly
- [ ] Description visible below toggle

#### Test 4D: Modal Buttons
- [ ] "Reject All" button appears (secondary style)
- [ ] "Save Preferences" button appears (gold style)
- [ ] Close button (X) appears in top-right corner
- [ ] All buttons are clickable

---

### Phase 5: Customize with Analytics ON

#### Test 5A: Save with Analytics Enabled
- [ ] Clear localStorage
- [ ] Refresh page
- [ ] Click "Customize"
- [ ] Toggle "Analytics & Tracking" ON
- [ ] Click "Save Preferences"
- [ ] Modal closes
- [ ] Banner closes
- [ ] Page remains on same URL

#### Test 5B: Verify Preferences
- [ ] Refresh page
- [ ] Banner does NOT appear
- [ ] Run: `localStorage.getItem('leor-cookie-preferences')`
- [ ] Result shows: `{"analytics":true,"essential":true,"timestamp":...}`

#### Test 5C: Tracking Works
- [ ] Open Network tab
- [ ] Refresh page
- [ ] Check for `/api/visitor-event` API calls
- [ ] Multiple events should be sent

---

### Phase 6: Customize with Analytics OFF

#### Test 6A: Save with Analytics Disabled
- [ ] Clear localStorage
- [ ] Refresh page
- [ ] Click "Customize"
- [ ] Ensure toggle is OFF (do NOT toggle)
- [ ] Click "Save Preferences"
- [ ] Modal closes, banner closes

#### Test 6B: Verify Tracking Disabled
- [ ] Refresh page
- [ ] Run: `localStorage.getItem('leor-cookie-preferences')`
- [ ] Result shows: `{"analytics":false,"essential":true,"timestamp":...}`
- [ ] Open Network tab
- [ ] No `/api/visitor-event` calls appear on page navigation

---

### Phase 7: Footer Cookie Settings

#### Test 7A: Button Exists in Footer
- [ ] Scroll to bottom of page
- [ ] Look for "Cookie Settings" link in footer-legal section
- [ ] Link has gold color and underline
- [ ] Link text is uppercase

#### Test 7B: Open Settings Modal
- [ ] Click "Cookie Settings" link
- [ ] Modal appears (same as customize modal)
- [ ] Shows current preferences (if Accept All: toggle ON, if Reject All: toggle OFF)

#### Test 7C: Change Preferences
- [ ] Modal has toggle with current state
- [ ] Toggle the analytics preference
- [ ] Click "Save Preferences"
- [ ] Modal closes
- [ ] localStorage is updated

#### Test 7D: Cancel Button
- [ ] Click "Cookie Settings"
- [ ] Toggle preference
- [ ] Click "Cancel"
- [ ] Modal closes WITHOUT saving
- [ ] localStorage unchanged

#### Test 7E: Close Button
- [ ] Click "Cookie Settings"
- [ ] Click X button in top-right corner
- [ ] Modal closes WITHOUT saving
- [ ] localStorage unchanged

---

### Phase 8: Consent Change Events

#### Test 8A: Event Fired on Accept All
- [ ] Clear localStorage
- [ ] Refresh page
- [ ] Open DevTools Console
- [ ] Run: `window.addEventListener('consent-changed', (e) => console.log('consent changed', e.detail))`
- [ ] Click "Accept All"
- [ ] Console shows: `consent changed {analytics: true}`

#### Test 8B: Event Fired on Customize Save
- [ ] Clear localStorage
- [ ] Add listener as above
- [ ] Click "Customize"
- [ ] Toggle analytics
- [ ] Click "Save Preferences"
- [ ] Console shows correct analytics value

#### Test 8C: Tracking Initializes on Consent Grant
- [ ] Clear localStorage
- [ ] Add listener: `window.addEventListener('consent-changed', (e) => console.log('tracking update', e.detail))`
- [ ] Reject All (analytics: false)
- [ ] Verify no tracking in Network tab
- [ ] Open footer Cookie Settings
- [ ] Toggle to ON
- [ ] Save Preferences
- [ ] Console shows: `consent changed {analytics: true}`
- [ ] New Network tab entries appear for tracking

---

### Phase 9: Responsive Design

#### Test 9A: Desktop (1280px+)
- [ ] Resize browser to 1280px width
- [ ] Banner shows in 2-column layout (text left, buttons right)
- [ ] Text and buttons both visible and readable
- [ ] Modal centered and takes 500px max width
- [ ] All controls easily clickable
- [ ] No horizontal scrolling

#### Test 9B: Tablet (768px)
- [ ] Resize to 768px width
- [ ] Banner switches to 1-column layout (text on top, buttons below)
- [ ] Buttons stack or stretch horizontally
- [ ] Modal still readable
- [ ] Touch targets are large enough

#### Test 9C: Mobile (375px)
- [ ] Resize to 375px width (iPhone SE size)
- [ ] Banner text readable, no overflow
- [ ] Buttons accessible, large enough to tap
- [ ] Modal takes full width with padding
- [ ] Close button easily tappable
- [ ] Toggle switch easily operated with finger
- [ ] No overlapping elements

#### Test 9D: Small Mobile (320px)
- [ ] Resize to 320px width
- [ ] All content visible without horizontal scroll
- [ ] Font sizes adjusted appropriately
- [ ] Buttons remain tappable (minimum 44px touch target)
- [ ] Layout remains readable

---

### Phase 10: Existing Integrations

#### Test 10A: Enquiry Form Submission
- [ ] Accept All (enable tracking)
- [ ] Fill and submit enquiry form
- [ ] Verify Google Sheets receives new row
- [ ] All 21 columns populated correctly
- [ ] Reject All tracking, submit form
- [ ] Verify row still saves to Google Sheets (form works regardless of consent)

#### Test 10B: UTM Parameters
- [ ] Visit site with URL: `http://localhost:3000?utm_source=test&utm_medium=email&utm_campaign=promo`
- [ ] Reject All (disable tracking)
- [ ] Check sessionStorage: `leor_utm_source` = "test"
- [ ] Navigate between pages
- [ ] UTM values persist (not cleared by consent rejection)
- [ ] Accept All, submit form
- [ ] Verify UTM values in Google Sheets

#### Test 10C: WhatsApp Click Tracking
- [ ] Accept All
- [ ] Click any WhatsApp button on page
- [ ] Check sessionStorage: `leor_whatsapp_clicked` = "true"
- [ ] Accept All, submit form
- [ ] Google Sheets "WhatsApp Clicked" column shows "Yes"
- [ ] Reject All tracking
- [ ] Click WhatsApp button
- [ ] Check sessionStorage: still "true" (not cleared)
- [ ] Submit form
- [ ] Google Sheets still shows "Yes"

---

### Phase 11: Edge Cases

#### Test 11A: Multiple Tabs
- [ ] Open site in Tab A
- [ ] Accept All
- [ ] Open site in Tab B (should show banner because each tab has separate session)
- [ ] Both tabs' localStorage should sync (if supported by browser)

#### Test 11B: Private/Incognito Mode
- [ ] Open site in private window
- [ ] localStorage exists only for that session
- [ ] Preferences don't persist after closing private window
- [ ] This is expected behavior

#### Test 11C: LocalStorage Disabled (if testable)
- [ ] Browser: Some browsers allow disabling localStorage
- [ ] If localStorage unavailable, banner should still show
- [ ] Preferences default to "unknown" consent state
- [ ] Tracking does not run (safe default)

#### Test 11D: Rapid Preference Changes
- [ ] Click "Customize"
- [ ] Toggle ON
- [ ] Save
- [ ] Immediately open "Cookie Settings" again
- [ ] Toggle OFF
- [ ] Save
- [ ] localStorage reflects OFF state
- [ ] No race conditions or crashes

---

### Phase 12: Console & Debug Logs

#### Test 12A: Console Output
- [ ] Open DevTools Console
- [ ] Refresh page
- [ ] Look for: `[tracking-init]` log with these values:
  - `utm_source: ...` (or null)
  - `utm_medium: ...` (or null)
  - `utm_campaign: ...` (or null)
  - `whatsapp_previously_clicked: true/false`
  - `analytics_consent: true/false`

#### Test 12B: No Errors
- [ ] Console shows NO red errors
- [ ] Warnings are acceptable (usually from external libraries)
- [ ] Page runs smoothly with 60 FPS

#### Test 12C: Debug Logs for Tracking
- [ ] With analytics ON, navigate pages
- [ ] No console logs (by design - to not spam console)
- [ ] With analytics OFF, navigate pages
- [ ] Should see: `[visitor-tracking] Skipping event - analytics consent not granted`

---

### Phase 13: Styling & Branding

#### Test 13A: Colors Match Leor Design
- [ ] Banner background: Navy (#3E2C23)
- [ ] Banner text: Ivory (#F3ECE0)
- [ ] Buttons accent: Gold (#DDB13C)
- [ ] "Always Active" badge: Gold background
- [ ] All colors match existing site branding

#### Test 13B: Typography
- [ ] Fonts match existing Leor site (Cormorant Garamond, Inter)
- [ ] Title: "Your Privacy Matters" in display font
- [ ] Body text readable and aligned
- [ ] All text has sufficient contrast (WCAG AA)

#### Test 13C: Animations
- [ ] Banner slides up smoothly when appearing
- [ ] Modal fades in with overlay
- [ ] Toggle switch animates on state change
- [ ] Close button has hover effect (color change)
- [ ] All animations are < 300ms

---

## Success Criteria

✅ **All tests should pass before considering implementation complete:**

- [ ] Banner appears/disappears correctly
- [ ] Preferences persist across sessions
- [ ] Tracking respects consent preferences
- [ ] All forms work regardless of consent
- [ ] UTM parameters always captured
- [ ] WhatsApp clicks always tracked
- [ ] Responsive on all screen sizes
- [ ] No console errors
- [ ] No TypeScript/ESLint errors
- [ ] Production build succeeds
- [ ] Google Sheets saves work correctly
- [ ] All color and branding match Leor Design

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Banner not appearing | Clear localStorage, hard refresh (Ctrl+Shift+R) |
| Preferences not saving | Check if localStorage is enabled in browser |
| Tracking still running | Check `hasAnalyticsConsent()` in console returns false |
| Modal not visible | Check z-index in CSS (should be 1000), verify CSS loaded |
| Toggle not working | Check browser supports HTML5 input[type=checkbox] |
| Colors wrong | Verify CSS variables exist in globals.css |

---

## Notes for Final Verification

1. Test on at least 3 different browsers (Chrome, Firefox, Safari/Edge)
2. Test on at least 2 different devices (Desktop and Mobile)
3. Test with and without DevTools open
4. Test after complete browser cache clear
5. Verify Google Sheets integration one more time
6. Confirm no deployment made to production
7. Ready to commit and merge once all tests pass
