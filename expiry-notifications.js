const axios = require("axios");  // Import axios for HTTP requests

// Initialize Backendless
  const backendlessAppId = "E664847D-C023-4EB6-8289-7034F384D158";  // Replace with your Backendless App ID
  const backendlessApiKey = "BDABE79E-98F7-4BB5-8752-6FD512892706"; // Replace with your Backendless API key
  Backendless.initApp(backendlessAppId, backendlessApiKey);

  // Fetch product data from Backendless
  async function fetchProductData() {
    try {
      const products = await Backendless.Data.of("Products").find();
      products.forEach(product => {
        const expiryDate = new Date(product.expiryDate);
        const currentDate = new Date();
        const daysRemaining = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));

        // Check if it's time to send a notification (30, 10, 5, 1 day(s) before expiry, and the expiry day)
        if ([30, 10, 5, 1].includes(daysRemaining) || daysRemaining === 0) {
          const toEmail = product.email;
          const subject = `Reminder: ${product.productName} is expiring in ${daysRemaining} day(s)`;
          const content = `
            <h3>${daysRemaining > 0 ? "Reminder" : "Alert"}</h3>
            <p>Hi,<br>Your product <strong>${product.productName}</strong> is ${daysRemaining > 0 ? `expiring in ${daysRemaining} day(s)` : "expired today"}.</p>
            <p>Expiry Date: ${expiryDate.toDateString()}</p>
            <p>Please visit the QUICKTRACE website and make sure of it to take necessary actions.</p>
            <p>.....THANK YOU for using QUICKTRACE......<p>
              <br><br>
            <p>Thanking you,<p>
            <p>Team QUICKTRACE.<p>
          `;
          // Send email using Brevo SMTP
          await sendEmail(toEmail, subject, content);
        }
      });
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  // Send email using Brevo SMTP
  async function sendEmail(toEmail, subject, content) {
    // Debugging: Log the details of the email being sent
    console.log("Sending email to:", toEmail);  // Log recipient email
    console.log("Subject:", subject);  // Log the subject of the email
    console.log("Content:", content);  // Log the email content

    // Email payload structure for Brevo API
    const emailData = {
      sender: { name: "QuickTrace Expiry Notifications", email: "project0rp0mail1@gmail.com" },  // Replace with your verified sender email
      to: [{ email: toEmail }],
      subject: subject,
      htmlContent: content
    };

    // Send the email via Brevo SMTP API using axios
    axios.post(`https://api.sendinblue.com/v3/smtp/email`, emailData, {
      headers: {
        "api-key": "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", // Replace with your Brevo API key
        "Content-Type": "application/json",
      }
    })
    .then(response => {
      console.log("Email sent successfully:", response);
    })
    .catch(error => {
      console.error("Error sending email:", error.response ? error.response.data : error);
    });
  }

  // Call fetchProductData to start fetching products and sending emails
(async () => {
await fetchProductData();
})();
