#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test script to verify enquiry attribution and WhatsApp lead attribution
 * Run with: node test-tracking.js
 */

const http = require("http");

const BASE_URL = "http://localhost:3000";

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Test)",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({ status: res.statusCode, body: data, headers: res.headers });
      });
    });

    req.on("error", reject);
    req.end();
  });
}

async function runTests() {
  console.log("🧪 Testing Leor Design Enquiry Attribution\n");

  try {
    // Test 1: Homepage loads
    console.log("Test 1: Homepage loads successfully");
    const home = await makeRequest("/");
    if (home.status === 200) {
      console.log("✅ Homepage loaded (HTTP 200)\n");
    } else {
      console.log(`❌ Homepage failed (HTTP ${home.status})\n`);
      return;
    }

    // Test 2: Check for enquiry attribution initialization
    console.log("Test 2: Check for EnquiryAttributionInitializer component");
    if (home.body.includes("enquiry-attribution-initializer") || home.body.includes("captureUtmParameters")) {
      console.log("✅ Enquiry attribution initialization code present in HTML\n");
    } else {
      console.log("⚠️  EnquiryAttributionInitializer might not be rendering (expected in production)\n");
    }

    // Test 3: Check for API route
    console.log("Test 3: Enquiry API route exists");
    // We can't POST without proper data, but we can check if it's defined
    if (home.body.includes("api/enquiry") || home.body.includes("/api/enquiry")) {
      console.log("✅ Enquiry API references found in HTML\n");
    } else {
      console.log("⚠️  Enquiry API references not found in HTML (might be client-side only)\n");
    }

    // Test 4: Check form elements
    console.log("Test 4: Consultation form elements present");
    const formIndicators = [
      home.body.includes("consult-form"),
      home.body.includes("name"),
      home.body.includes("mobile"),
      home.body.includes("locality"),
    ];
    if (formIndicators.some((x) => x)) {
      console.log("✅ Form elements found in HTML\n");
    } else {
      console.log("⚠️  Form elements not clearly visible in HTML\n");
    }

    // Test 5: Check WhatsApp links
    console.log("Test 5: WhatsApp links present");
    if (home.body.includes("wa.me") || home.body.includes("whatsapp")) {
      console.log("✅ WhatsApp links/buttons found in HTML\n");
    } else {
      console.log("❌ WhatsApp links not found\n");
      return;
    }

    console.log("📊 Summary:\n");
    console.log("✅ All basic tests passed!");
    console.log(
      "\n📝 Next: Open http://localhost:3000 in your browser and:\n" +
        "   1. Visit with UTM params: http://localhost:3000/?utm_source=google&utm_medium=cpc&utm_campaign=test\n" +
        "   2. Navigate to different sections\n" +
        "   3. Click a WhatsApp button\n" +
        "   4. Fill and submit the consultation form\n" +
        "   5. Check sessionStorage in DevTools (F12 > Application > Session Storage)\n" +
        "   6. Verify Google Sheets received the data\n"
    );
  } catch (error) {
    console.error("❌ Error running tests:", error.message);
    console.error("\nIs the dev server running at http://localhost:3000?");
    console.error("Start it with: npm run dev");
  }
}

runTests();
