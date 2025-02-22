const axios = require("axios");
const Backendless = require("backendless");

// Initialize Backendless
Backendless.initApp("E664847D-C023-4EB6-8289-7034F384D158", "BDABE79E-98F7-4BB5-8752-6FD512892706");

async function fetchProductData() {
    try {
        console.log("Fetching product data...");
        const products = await Backendless.Data.of("Products").find();
        const currentDate = new Date();

        for (let product of products) {
            const expiryDate = new Date(product.expiryDate);
            const daysRemaining = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));

            if ([30, 10, 5, 1].includes(daysRemaining) || daysRemaining === 0) {
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
            }
        }
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

async function sendEmail(toEmail, subject, content) {
    try {
        console.log(`Sending email to ${toEmail}...`);
        await axios.post("https://api.sendinblue.com/v3/smtp/email", {
            sender: { name: "QuickTrace Expiry Notifications", email: "project0rp0mail1@gmail.com" },
            to: [{ email: toEmail }],
            subject: subject,
            htmlContent: content
        }, {
            headers: {
                "api-key": "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",
                "Content-Type": "application/json",
            }
        });
        console.log(`Email sent successfully to ${toEmail}`);
    } catch (error) {
        console.error("Error sending email:", error.response ? error.response.data : error);
    }
}

// Run the function
fetchProductData();
