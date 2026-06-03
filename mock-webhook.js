import http from "http";
import { createClient } from "@supabase/supabase-js";

// Load environment variables manually
import fs from "fs";
import path from "path";

const envPath = path.resolve("./.env.local");
let supabaseUrl = "";
let supabaseKey = "";

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const lines = envContent.split("\n");
    for (const line of lines) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let val = match[2] || "";
            if (val.startsWith('"') && val.endsWith('"')) {
                val = val.substring(1, val.length - 1);
            }
            if (key === "NEXT_PUBLIC_SUPABASE_URL") supabaseUrl = val;
            if (key === "SUPABASE_SERVICE_ROLE_KEY") supabaseKey = val;
        }
    }
}

const supabase = createClient(supabaseUrl, supabaseKey);
const port = 3000;
const url = `http://localhost:${port}/api/webhooks/polar`;
const email = "mssidea21@gmail.com";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getDbState() {
    const { data, error } = await supabase
        .from("users")
        .select("plan, subscription_status, credits")
        .eq("email", email)
        .single();
    return data || null;
}

function sendWebhook(payload) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data),
                "x-bypass-webhook-validation": "true"
            }
        };

        const req = http.request(url, options, (res) => {
            let body = "";
            res.on("data", (chunk) => body += chunk);
            res.on("end", () => resolve({ status: res.statusCode, body }));
        });

        req.on("error", (err) => reject(err));
        req.write(data);
        req.end();
    });
}

async function run() {
    console.log("=== Polar Webhook Integration Test ===");
    console.log(`Target email: ${email}\n`);

    // Reset user state to Free plan, 0 credits for testing
    console.log("Resetting user DB state to Free plan, 0 credits...");
    await supabase.from("users").update({
        plan: "Free",
        subscription_status: "inactive",
        credits: 0
    }).eq("email", email);

    let state = await getDbState();
    console.log("Initial DB State:", state);
    console.log("--------------------------------------------------\n");

    // 1. Test order.paid for Pro plan (adds 100 credits)
    console.log("Step 1: Simulating 'order.paid' for Pro plan (Should add 100 credits)...");
    const checkoutId = "mock_chk_" + Math.random().toString(36).substring(2, 10);
    const orderPaidPayload = {
        type: "order.paid",
        data: {
            id: "mock_ord_" + Math.random().toString(36).substring(2, 10),
            totalAmount: 2000, // $20.00
            currency: "USD",
            productId: "3f83bebf-337b-47b4-af99-1af3a57e5868", // Pro plan product ID
            checkoutId: checkoutId,
            customer: {
                email: email
            }
        }
    };

    const res1 = await sendWebhook(orderPaidPayload);
    console.log(`Webhook Response Status: ${res1.status}`);
    await sleep(1000);
    state = await getDbState();
    console.log("Current DB State:", state);
    console.log("--------------------------------------------------\n");

    // 2. Test customer.state_changed to Pro (Updates plan name and sub status)
    console.log("Step 2: Simulating 'customer.state_changed' to active Pro subscription (Should update plan & status)...");
    const stateChangedProPayload = {
        type: "customer.state_changed",
        data: {
            email: email,
            activeSubscriptions: [
                {
                    id: "mock_sub_" + Math.random().toString(36).substring(2, 10),
                    status: "active",
                    productId: "3f83bebf-337b-47b4-af99-1af3a57e5868"
                }
            ]
        }
    };

    const res2 = await sendWebhook(stateChangedProPayload);
    console.log(`Webhook Response Status: ${res2.status}`);
    await sleep(1000);
    state = await getDbState();
    console.log("Current DB State:", state);
    console.log("--------------------------------------------------\n");

    // 3. Test Upgrade: Pro -> Ultra (Should update plan to Ultra and add 200 credits)
    console.log("Step 3: Simulating Upgrade to Ultra via 'customer.state_changed' (Should update plan to Ultra and add 200 credits)...");
    const stateChangedUpgradePayload = {
        type: "customer.state_changed",
        data: {
            email: email,
            activeSubscriptions: [
                {
                    id: "mock_sub_" + Math.random().toString(36).substring(2, 10),
                    status: "active",
                    productId: "fe8f8926-d880-468a-9484-8f5ab5a8da68" // Ultra plan product ID
                }
            ]
        }
    };

    const res3 = await sendWebhook(stateChangedUpgradePayload);
    console.log(`Webhook Response Status: ${res3.status}`);
    await sleep(1000);
    state = await getDbState();
    console.log("Final DB State:", state);
    console.log("--------------------------------------------------\n");
    
    // Check payments table log
    console.log("Checking Payments Table log...");
    const { data: payments } = await supabase
        .from("payments")
        .select("id, amount, currency, status, provider, checkout_id")
        .eq("checkout_id", checkoutId);
    console.log("Payment record inserted in Step 1:", payments);
    console.log("==================================================");
    
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
