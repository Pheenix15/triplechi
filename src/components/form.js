// Updated sendCheckoutEmail function to work with your Node.js backend
// Add this to your form.js file or wherever your sendCheckoutEmail function is located

export const sendCheckoutEmail = async (checkoutFormData, cartItems, transaction, totalAmount, shippingCost = 0, currency = 'USD') => {
  try {
    console.log('Sending checkout notification email...');
    
    // Your backend server URL - change this if your server runs on a different port
    const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';
    
    // Prepare the data to send to your backend
    const emailData = {
      checkoutFormData,
      cartItems,
      transaction,
      totalAmount,
      shippingCost,
      currency
    };
    
    console.log('Email data being sent:', emailData);
    
    // Send POST request to your Node.js backend
    const response = await fetch(`${SERVER_URL}/api/send-checkout-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('Checkout notification sent successfully!', result);
      
      // Optionally send customer confirmation email too
      try {
        await fetch(`${SERVER_URL}/api/send-customer-confirmation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData)
        });
        console.log('Customer confirmation sent successfully!');
      } catch (confirmationError) {
        console.warn('Customer confirmation failed (but order notification succeeded):', confirmationError);
      }
      
      return result;
    } else {
      throw new Error(result.message || 'Failed to send email');
    }
    
  } catch (error) {
    console.error('Error sending checkout email:', error);
    
    // Don't throw the error to prevent breaking the checkout process
    // Just log it - the purchase was successful even if email fails
    return {
      success: false,
      error: error.message
    };
  }
};


// OTHER sendCheckOutEmail////////
// SEND MAIL USING smtpJS
    // const sendCheckoutEmail = (checkoutFormData, cartItems, transactionRef, totalAmount) => {
        
    //     const cartSummary = cartItems.map((item, index) => {
    //         return `Item ${index + 1}:
    //     - Name: ${item.name}
    //     - Quantity: ${item.quantity}
    //     - Size: ${item.size}
    //     - Price: ${item.price}
    //     - Image: ${item.image || "N/A"}\n`;
    //     }).join("\n");

    //     const body = `
    //     Transaction Reference: ${transactionRef}
    //     Name: ${checkoutFormData.firstName} ${checkoutFormData.lastName}
    //     Email: ${checkoutFormData.email}
    //     Phone: ${checkoutFormData.phoneNumber}
    //     Delivery Address: ${checkoutFormData.address}
    //     Total Amount Paid: ${(totalAmount / 100).toLocaleString()} NGN

    //     Cart Items:
    //     ${cartSummary}
    //     `;

    //     window.Email.send({
    //         // SecureToken: "da110434-289d-4790-8b9c-f1de3eef3d31",
    //         Host : "s1.maildns.net",
    //         Username : "pheenixgraphix@gmail.com",
    //         Password : "jchh zxam rqcj rlik",   
    //         To: "fpheenix15@gmail.com",
    //         From: "pheenixgraphix@gmail.com", // Must match the email used to generate the token
    //         Subject: "New Order Received",
    //         Body: "If you received this, SMTP is working.",
    //     }).then(
    //         message => console.log("Email sent successfully:", message)
    //     ).catch(
    //         error => console.error("Failed to send email:", error)
    //     );                  
    // };




// Alternative version if you prefer using axios (if you have it installed)
/*
import axios from 'axios';

export const sendCheckoutEmail = async (checkoutFormData, cartItems, transaction, totalAmount, shippingCost = 0, currency = 'USD') => {
  try {
    console.log('Sending checkout notification email...');
    
    const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';
    
    const emailData = {
      checkoutFormData,
      cartItems,
      transaction,
      totalAmount,
      shippingCost,
      currency
    };
    
    const response = await axios.post(`${SERVER_URL}/api/send-checkout-email`, emailData);
    
    if (response.data.success) {
      console.log('✅ Checkout notification sent successfully!', response.data);
      
      // Send customer confirmation
      try {
        await axios.post(`${SERVER_URL}/api/send-customer-confirmation`, emailData);
        console.log('✅ Customer confirmation sent successfully!');
      } catch (confirmationError) {
        console.warn('⚠️ Customer confirmation failed:', confirmationError);
      }
      
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to send email');
    }
    
  } catch (error) {
    console.error('❌ Error sending checkout email:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};
*/