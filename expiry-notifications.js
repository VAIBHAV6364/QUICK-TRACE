/*const axios = require("axios");  // Import axios for HTTP requests
const Backendless = require("backendless"); // ✅ Import Backendless

// Initialize Backendless
const backendlessAppId = "E664847D-C023-4EB6-8289-7034F384D158";  // Replace with your Backendless App ID
const backendlessApiKey = "BDABE79E-98F7-4BB5-8752-6FD512892706"; // Replace with your Backendless API key
Backendless.initApp(backendlessAppId, backendlessApiKey);

// Fetch product data from Backendless
async function fetchProductData() {
    try {
        console.log("Fetching product data...");

        // ✅ Log the full API response for debugging
        const products = await Backendless.Data.of("Products").find();
        console.log("Raw Backendless Response:", JSON.stringify(products, null, 2));

        console.log(`Total products found: ${products.length}`);

        if (products.length === 0) {
            console.warn("⚠️ No products found in Backendless. Check database contents.");
            return; // Exit early if no products exist
        }

        const currentDate = new Date();

        for (let product of products) {
            const expiryDate = new Date(product.expiryDate);
            const daysRemaining = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));

            console.log(`Product: ${product.productName}, Expiry in: ${daysRemaining} days`);

            if ([30, 10, 5, 1].includes(daysRemaining) || daysRemaining === 0) {
                console.log(`Sending email for: ${product.productName}`);
                const toEmail = product.email;
                const subject = `Reminder: ${product.productName} is expiring in ${daysRemaining} day(s)`;
                const content = `
                    <h3>${daysRemaining > 0 ? "Reminder" : "Alert"}</h3>
                    <p>Hi,<br>Your product <strong>${product.productName}</strong> is ${daysRemaining > 0 ? `expiring in ${daysRemaining} day(s)` : "expired today"}.</p>
                    <p>Expiry Date: ${expiryDate.toDateString()}</p>
                    <p>Please visit the QUICKTRACE website and take necessary actions.</p>
                    <br><br>
                    <p>Thanking you,</p>
                    <p>Team QUICKTRACE.</p>
                `;

                await sendEmail(toEmail, subject, content);
                console.log(`Email sent to ${toEmail}`);
            }
        }
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}


// ✅ Ensure sendEmail() is async
async function sendEmail(toEmail, subject, content) {
    try {
        console.log("Sending email to:", toEmail);
        
        //const BREVO_API_KEY = process.env.BREVO_API_KEY;  // Fetch API key from GitHub Secrets

        // Email payload structure for Brevo API
        const emailData = {
            sender: { name: "QuickTrace Expiry Notifications", email: "project0rp0mail1@gmail.com" },  // Replace with verified sender email
            to: [{ email: toEmail }],
            subject: subject,
            htmlContent: content
        };

        // Send the email via Brevo SMTP API using axios
        const response = await axios.post(`https://api.sendinblue.com/v3/smtp/email`, emailData, {
            headers: {
                "api-key": "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", // Replace with your Brevo API key
                "Content-Type": "application/json",
            }
        });

        console.log("Email sent successfully:", response.data);
    } catch (error) {
        console.error("Error sending email:", error.response ? error.response.data : error);
    }
}

// ✅ Corrected: Properly calling async function in top-level context
(async () => {
    await fetchProductData();
})();
*/

require("dotenv").config(); // Load environment variables from .env
const axios = require("axios");
const Backendless = require("backendless");

// ✅ Load credentials securely from environment variables
const backendlessAppId = "E664847D-C023-4EB6-8289-7034F384D158";
const backendlessApiKey = "BDABE79E-98F7-4BB5-8752-6FD512892706";
const brevoApiKey = "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";
const senderEmail = "project0rp0mail1@gmail.com"; // Fallback email

if (!backendlessAppId || !backendlessApiKey || !brevoApiKey) {
    console.error("❌ Missing API credentials! Ensure environment variables are set.");
    process.exit(1);
}

Backendless.initApp(backendlessAppId, backendlessApiKey);

// ✅ Fetch product data from Backendless
async function fetchProductData() {
    try {
        console.log("📡 Fetching product data...");

        const products = await Backendless.Data.of("Products").find();
        console.log(`✅ Total products found: ${products.length}`);

        if (products.length === 0) {
            console.warn("⚠️ No products found in Backendless.");
            return;
        }

        const currentDate = new Date();

        for (let product of products) {
            const expiryDate = new Date(product.expiryDate);
            const daysRemaining = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));

            console.log(`📌 ${product.productName} expires in: ${daysRemaining} days`);

            // Notify only for specific intervals
            if ([30, 10, 5, 1, 0].includes(daysRemaining)) {
                console.log(`📧 Sending email for: ${product.productName}`);
                await sendEmail(product.email, product.productName, daysRemaining, expiryDate);
            }
        }
    } catch (error) {
        console.error("❌ Error fetching products:", error);
    }
}

// ✅ Function to send email via Brevo API
async function sendEmail(toEmail, productName, daysRemaining, expiryDate) {
    try {
        console.log(`📨 Sending email to: ${toEmail}`);

        const subject = `Reminder: ${productName} is expiring in ${daysRemaining} day(s)`;
        const content = `
            <h3>${daysRemaining > 0 ? "Reminder" : "Alert"}</h3>
            <p>Hi,<br>Your product <strong>${productName}</strong> is ${daysRemaining > 0 ? `expiring in ${daysRemaining} day(s)` : "expired today"}.</p>
            <p>Expiry Date: ${expiryDate.toDateString()}</p>
            <p>Please visit the QUICKTRACE website and take necessary actions.</p>
            <br><br>
            <p>Thanking you,</p>
            <p>Team QUICKTRACE.</p>
        `;

        const emailData = {
            sender: { name: "QuickTrace Expiry Notifications", email: senderEmail },
            to: [{ email: toEmail }],
            subject: subject,
            htmlContent: content,
        };

        const response = await axios.post(`https://api.sendinblue.com/v3/smtp/email`, emailData, {
            headers: {
                "api-key": brevoApiKey,
                "Content-Type": "application/json",
            }
        });

        console.log(`✅ Email sent successfully to ${toEmail}:`, response.data);
    } catch (error) {
        console.error("❌ Error sending email:", error.response ? error.response.data : error);
    }
}

// ✅ Auto-run function
(async () => {
    await fetchProductData();
})();
