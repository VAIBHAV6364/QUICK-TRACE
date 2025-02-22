async function fetchProductData() {
    try {
        console.log("Fetching product data...");

        const products = await Backendless.Data.of("Products").find();
        console.log(`Total products found: ${products.length}`);

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
