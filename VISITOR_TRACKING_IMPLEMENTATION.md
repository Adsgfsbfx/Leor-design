# Visitor Tracking System Implementation

## Overview

This document describes the new visitor event tracking system implemented for the Leor Design website. The system records visitor activity in a separate "Visitor Footprints" tab in Google Sheets while preserving the existing "Leads" integration.

## Architecture

### Components Created

1. **API Endpoint** (`app/api/visitor-event/route.ts`)
   - Validates incoming visitor event payloads
   - Enforces rate limiting (30 events per 60 seconds per IP)
   - Sends events to Google Apps Script with `record_type: 'visitor_event'`
   - Returns 201 on success, 400 on validation error, 429 on rate limit, 500 on server error

2. **Google Sheets Helper** (`src/lib/visitorSheets.ts`)
   - Formats visitor events into 19-column row for Visitor Footprints tab
   - Handles idempotency (prevents duplicate events)
   - Manages error logging with sensitive data redaction
   - Mirrors the pattern of existing `leadSheets.ts` helper

3. **Client-side Tracking** (`src/lib/visitorTracking.ts`)
   - Generates and manages visitor ID (persistent per browser session)
   - Generates and manages session ID (per browsing session)
   - Generates unique event IDs per event
   - Detects device type, browser, and operating system
   - Extracts and persists UTM parameters
   - Captures referral source from document.referrer
   - Integrates with cookie consent status

4. **Cookie Consent Utility** (`src/lib/cookies.ts`)
   - Tracks user's cookie consent decision
   - Returns consent status: "accepted", "rejected", or "unknown"
   - Allows selective tracking based on consent (optional: proceed on "unknown")

5. **Tracking Initializer Update** (`app/components/tracking-initializer.tsx`)
   - Now calls `initializePageTracking()` on page load
   - Calls `trackPageLeave()` on beforeunload event
   - Maintains existing UTM and WhatsApp click tracking

## Data Collected

### Visitor Footprints Tab (19 columns)

| Column | Type | Description |
|--------|------|-------------|
| Timestamp (IST) | String | Server-side timestamp when event was received |
| Anonymous Visitor ID | String | Random ID persistent per browser session |
| Session ID | String | ID for current browsing session |
| Event ID | String | Unique identifier per event |
| Event Name | String | Type of event (page_view, click, form_submit, etc.) |
| Page URL | String | Full URL of current page |
| Page Title | String | Document title |
| Previous Page | String | URL visitor came from |
| Referral Source | String | External referral domain (if from another website) |
| UTM Source | String | utm_source parameter (persisted) |
| UTM Medium | String | utm_medium parameter (persisted) |
| UTM Campaign | String | utm_campaign parameter (persisted) |
| Device Type | String | mobile, tablet, or desktop |
| Browser | String | Chrome, Firefox, Safari, Edge, etc. |
| Operating System | String | iOS, Android, Windows, macOS, Linux |
| Time on Page (Seconds) | Number | Seconds visitor spent on page |
| CTA Name | String | Name of call-to-action clicked (optional) |
| Cookie Consent Status | String | accepted, rejected, or unknown |
| Lead ID | String | Links to lead if visitor submitted enquiry |

## Event Types

Current event tracking includes:

- **page_view**: User landed on or navigated to a page
- **page_leave**: User navigated away from a page (with time spent)
- **whatsapp_click**: User clicked a WhatsApp link or button
- **phone_click**: User clicked a phone call button
- **form_start**: User began filling out a form
- **form_submit**: User submitted an enquiry form
- **estimator_open**: User opened the budget estimator popup
- **estimator_complete**: User calculated an estimate
- **cta_click**: User clicked a call-to-action button

## Integration with Existing Systems

### Google Sheets Structure

- **Leads tab** (21 columns): Unchanged. Receives enquiry submissions only.
- **Visitor Footprints tab** (19 columns): NEW. Receives visitor events from `/api/visitor-event`.

### Existing Tracking Preserved

- UTM parameter capture and persistence (existing `src/lib/tracking.ts`)
- WhatsApp click detection (existing)
- Form submission to Leads tab (existing `app/api/enquiry/route.ts`)

### No Changes to

- Google Apps Script URL
- Webhook secret
- Spreadsheet ID
- Existing 21-column Leads structure
- Existing enquiry form submission flow

## Testing

### Manual Testing Checklist

#### 1. Page View Tracking

- [ ] Visit homepage
- [ ] Check browser console for debug logs
- [ ] Check browser sessionStorage for `leor-visitor-id`, `leor-session-id`
- [ ] Submit manual API request: `POST /api/visitor-event` with event data
- [ ] Verify event appears in Visitor Footprints tab

#### 2. UTM Persistence

- [ ] Visit homepage with `?utm_source=test&utm_medium=email&utm_campaign=march`
- [ ] Navigate to another page
- [ ] Submit enquiry form
- [ ] Verify UTM values appear in both:
  - Visitor Footprints tab (UTM columns)
  - Leads tab (columns 13-15)

#### 3. Visitor ID Persistence

- [ ] Visit homepage
- [ ] Record visitor ID from console
- [ ] Navigate between multiple pages
- [ ] Submit enquiry form
- [ ] Verify same visitor ID appears in multiple rows of Visitor Footprints

#### 4. Session ID Management

- [ ] Visit homepage
- [ ] Record session ID from console
- [ ] Perform multiple actions
- [ ] Verify same session ID across related events
- [ ] Close browser/tab and reopen
- [ ] Verify new session ID is generated

#### 5. WhatsApp Click Tracking

- [ ] Click a WhatsApp button on the website
- [ ] Check sessionStorage for `leor_whatsapp_clicked = true`
- [ ] Submit enquiry form
- [ ] Verify "WhatsApp Clicked" shows "Yes" in Leads tab
- [ ] Verify whatsapp_click event in Visitor Footprints

#### 6. Device Detection

- [ ] Visit on desktop (1920px viewport)
- [ ] Verify deviceType = "desktop"
- [ ] Visit on tablet (768px viewport)
- [ ] Verify deviceType = "tablet"
- [ ] Visit on mobile (375px viewport)
- [ ] Verify deviceType = "mobile"

#### 7. Form Submission Integration

- [ ] Fill and submit enquiry form
- [ ] Verify row created in Leads tab (21 columns)
- [ ] Verify rows created in Visitor Footprints (19 columns):
  - form_start event
  - form_submit event
- [ ] Verify lead_id links events to form submission

#### 8. Rate Limiting

- [ ] Send 30 visitor events within 60 seconds
- [ ] Verify all succeed (201 status)
- [ ] Send 31st event within same 60-second window
- [ ] Verify 429 (Too Many Requests) response
- [ ] Wait 60+ seconds
- [ ] Verify next batch succeeds

#### 9. Error Handling

- [ ] Submit malformed event payload
- [ ] Verify 400 error response with validation message
- [ ] Verify console logs show validation errors
- [ ] Verify Visitor Footprints tab unchanged

#### 10. Consent Status

- [ ] Visit without setting cookie consent
- [ ] Verify events show `cookie_consent = "unknown"`
- [ ] Accept cookies (when UI prompts)
- [ ] Verify subsequent events show `cookie_consent = "accepted"`
- [ ] Reject cookies (if UI allows)
- [ ] Verify subsequent events show `cookie_consent = "rejected"`

### API Testing

#### Test 1: Valid Page View Event

```bash
curl -X POST http://localhost:3000/api/visitor-event \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "page_view",
    "visitorId": "test-visitor-001",
    "sessionId": "test-session-001",
    "eventId": "test-event-001",
    "pageUrl": "https://leor-design.com/",
    "pageTitle": "Leor Design - Home",
    "previousPage": "",
    "referralSource": "",
    "utmSource": "google",
    "utmMedium": "cpc",
    "utmCampaign": "spring-sale",
    "deviceType": "desktop",
    "browser": "Chrome",
    "operatingSystem": "Windows",
    "timeOnPage": 0,
    "ctaName": "",
    "cookieConsent": "accepted",
    "leadId": ""
  }'
```

Expected response:
```json
{
  "message": "Visitor event recorded.",
  "eventId": "test-event-001"
}
```

#### Test 2: Missing Required Field

```bash
curl -X POST http://localhost:3000/api/visitor-event \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "page_view",
    "sessionId": "test-session-001",
    "eventId": "test-event-002"
  }'
```

Expected: 400 error with validation message

#### Test 3: Invalid Consent Status

```bash
curl -X POST http://localhost:3000/api/visitor-event \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "page_view",
    "visitorId": "test-visitor-002",
    "sessionId": "test-session-002",
    "eventId": "test-event-003",
    "pageUrl": "https://leor-design.com/",
    "pageTitle": "Leor Design",
    "previousPage": "",
    "referralSource": "",
    "utmSource": "",
    "utmMedium": "",
    "utmCampaign": "",
    "deviceType": "desktop",
    "browser": "Chrome",
    "operatingSystem": "Windows",
    "timeOnPage": 0,
    "ctaName": "",
    "cookieConsent": "invalid-value",
    "leadId": ""
  }'
```

Expected: 400 error with "cookieConsent must be 'accepted', 'rejected', or 'unknown'"

## Google Sheets Verification

### Viewing Visitor Footprints Data

1. Open Google Sheets at [spreadsheet ID configured in .env.local]
2. Navigate to "Visitor Footprints" tab
3. Verify columns appear in this order:
   - Timestamp (IST)
   - Anonymous Visitor ID
   - Session ID
   - Event ID
   - Event Name
   - Page URL
   - Page Title
   - Previous Page
   - Referral Source
   - UTM Source
   - UTM Medium
   - UTM Campaign
   - Device Type
   - Browser
   - Operating System
   - Time on Page (Seconds)
   - CTA Name
   - Cookie Consent Status
   - Lead ID

4. Verify multiple rows appear for different events
5. Verify same visitor ID appears across multiple rows
6. Verify different session IDs for different sessions
7. Verify UTM parameters are captured correctly

### Viewing Leads Tab (Unchanged)

1. Navigate to "Leads" tab
2. Verify all 21 columns remain intact and unchanged
3. Verify enquiry form submissions appear as rows
4. Verify WhatsApp Clicked shows "Yes" or "No" correctly
5. Verify UTM Source, Medium, Campaign appear in columns 13-15

## Implementation Details

### Visitor ID Generation

```typescript
// Random 16-character alphanumeric ID
// Format: [a-z0-9]{16}
// Stored in sessionStorage with key "leor-visitor-id"
// Reused for all events in same browser session
```

### Session ID

```typescript
// Random 16-character alphanumeric ID
// Format: [a-z0-9]{16}
// Stored in sessionStorage with key "leor-session-id"
// Represents current browsing session (tab/window)
// Changes when browser closed or session cleared
```

### Event ID

```typescript
// Timestamp-based unique ID
// Format: {timestamp}-{random-8-chars}
// Example: 1234567890123-abc12345
// Guarantees uniqueness even with high concurrency
```

### Device Detection

```typescript
// Browser User-Agent parsing
// Returns: "mobile", "tablet", or "desktop"
// Mobile detection: /mobile|android|iphone|ipod/i
// Tablet detection: /tablet|ipad|playbook|silk/i
// Default: "desktop"
```

### Browser Detection

```typescript
// Browser User-Agent parsing
// Returns: "Chrome", "Firefox", "Safari", "Edge", "Opera", or "unknown"
```

### OS Detection

```typescript
// Browser User-Agent parsing
// Returns: "Windows", "macOS", "Linux", "Android", "iOS", or "unknown"
```

### Rate Limiting

```typescript
// Per IP per 60-second window
// Limit: 30 events per IP
// Key format: "visitor-event:{IP_ADDRESS}"
// Returns 429 when exceeded
```

## Security Considerations

1. **Webhook Secret**: Only server-side, never exposed to browser
2. **Event Validation**: All fields validated server-side with size limits
3. **Rate Limiting**: Prevents spam from individual IPs
4. **Sensitive Data Redaction**: Errors redact URLs, emails, phone numbers
5. **Idempotency**: Duplicate events detected and deduplicated
6. **Consent Respect**: Cookie consent status tracked but optional tracking proceeds on "unknown"

## Performance Impact

- **Async Operations**: All tracking calls are non-blocking
- **Timeout**: 15-second timeout on Apps Script requests
- **Deduplication**: In-memory tracking prevents redundant submissions
- **Storage**: sessionStorage usage is minimal (~200 bytes per session)

## Troubleshooting

### Events not appearing in Google Sheets

1. Check browser console for JavaScript errors
2. Check server logs for webhook diagnostic messages
3. Verify Apps Script deployment URL is correct
4. Verify webhook secret is correct
5. Verify Visitor Footprints tab exists in spreadsheet
6. Check Apps Script quota usage (may be exceeded)

### Duplicate events in Google Sheets

1. Idempotency key should prevent this
2. Check Apps Script for error handling
3. Review console.error logs for "[visitor-webhook]" messages

### Events not captured from specific page

1. Verify TrackingInitializer component is in layout
2. Verify page component is a client component (if needed)
3. Check browser sessionStorage for visitor ID
4. Verify no JavaScript errors preventing tracking initialization

### Rate limiting responses

1. Reduce event frequency if sending >30 per minute
2. Check IP-based rate limiting in browser DevTools Network tab
3. Verify X-Forwarded-For headers if behind proxy

## Future Enhancements

1. Track specific form field interactions
2. Track scroll depth on pages
3. Track video playback events
4. Track error messages and console errors
5. Implement client-side queue for offline tracking
6. Add analytics dashboard with charts/graphs
7. Implement funnel analysis (visitor → lead conversion)

## Documentation Files

- This file: High-level implementation overview
- `app/api/visitor-event/route.ts`: API endpoint implementation
- `src/lib/visitorSheets.ts`: Google Sheets integration
- `src/lib/visitorTracking.ts`: Client-side tracking library
- `src/lib/cookies.ts`: Cookie consent management
- `app/components/tracking-initializer.tsx`: Component setup

## Files Modified

- `app/components/tracking-initializer.tsx`: Added visitor tracking initialization

## Files Created

- `app/api/visitor-event/route.ts`: New API endpoint
- `src/lib/visitorSheets.ts`: New Google Sheets helper
- `src/lib/visitorTracking.ts`: New client-side tracking
- `src/lib/cookies.ts`: New cookie consent utility

## Deployment Checklist

Before deploying to production:

- [ ] Test all tracking events end-to-end
- [ ] Verify data appears in Google Sheets
- [ ] Run full test suite: `npm run build`
- [ ] Review TypeScript types: `npx tsc --noEmit`
- [ ] Review lint results: `npm run lint`
- [ ] Verify rate limiting with load test
- [ ] Verify error handling and logging
- [ ] Document any custom event tracking added to pages
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on multiple devices (mobile, tablet, desktop)
- [ ] Monitor production logs for errors
- [ ] Monitor Google Sheets for unusual patterns
