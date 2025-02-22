const axios = require("axios");  // Import axios for HTTP requests

// Initialize Backendless
const backendlessAppId = "E664847D-C023-4EB6-8289-7034F384D158";  // Replace with your Backendless App ID
const backendlessApiKey = "BDABE79E-98F7-4BB5-8752-6FD512892706"; // Replace with your Backendless API key
Backendless.initApp(backendlessAppId, backendlessApiKey);

// Fetch product data from Backendless
async function fetchProductData() {
    try {
        console.log("Fetching product data...");

        const products = await Backendless.Data.of("Products").find();
        console.log(`Total products found: ${products.length}`);

        const currentDate = new Date();

        // ✅ Replaced .forEach() with for...of loop
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

                // ✅ Now `await` works correctly inside a `for...of` loop
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
        
        const BREVO_API_KEY = process.env.BREVO_API_KEY;  // Fetch API key from GitHub Secrets

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
                "api-key": BREVO_API_KEY, // Use GitHub Secrets
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
