// testRequest.js

const axios = require('axios');

async function sendTestCheckoutData() {
  try {
    const response = await axios.post('http://localhost:5000/send-checkout-email', {
      userDetails: {
        firstName: "Ada",
        lastName: "Obi",
        email: "ada@example.com",
        phoneNumber: "08012345678",
        address: "12 Example Street"
      },
      cartItems: [
        { name: "Blue Shirt", size: "M", quantity: 2 },
        { name: "Black Cap", size: "L", quantity: 1 }
      ],
      transactionReference: "PSK_12345678",
      totalAmount: "₦15,000"
    });

    console.log("Email sent! Response from server:");
    console.log(response.data);
  } catch (error) {
    console.error("Error sending test data:", error.message);
    if (error.response) {
      console.log("Server response:", error.response.data);
    }
  }
}

sendTestCheckoutData();