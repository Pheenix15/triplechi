// server.js
import {sendEmail} from "./sendEmail.js"

import dotenv from "dotenv";
dotenv.config();; //Load variables from .env

// IMPORT express, cors and nodemailer libraries
import express from "express";
// import nodemailer from "nodemailer";
import cors from "cors";
// CREATE an Express app
const app = express();


// SET the port to listen on
const PORT = process.env.PORT || 5000;

// ALLOWS CORS-Cross Origin Resource Sharing 
app.use(cors());

// Tells Express to accept JSON in incoming requests
app.use(express.json());

// SETUP the transporter (the mail-sending engine)
app.post('/send-checkout-email', async (req, res) => {
  try {
    const { userDetails, cartItems, transactionReference, totalAmount } = req.body;
 
    // Admin Email Option
    await sendEmail({ 
      to: process.env.EMAIL_USER,
      subject: `New Order from ${userDetails.firstName} ${userDetails.lastName}`,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222; max-width: 600px; margin: 0 auto; border: 1px solid #eee;">
              <!-- HEADER -->
              <div style="text-align: center; padding: 20px;">
                <img src="https://chibythem.store/img/logo-2.png" alt="TripleChi Logo" style="height: 60px; margin-bottom: 10px;" />
                <h2 style="margin: 0; color: rgb(128, 0, 150);">New Order Received</h2>
              </div>

              <!-- BODY -->
              <div style="padding: 20px;">
                <h3 style="color: black;">Customer Info:</h3>
                <p><strong>Name:</strong> ${userDetails.firstName} ${userDetails.lastName}</p>
                <p><strong>Email:</strong> ${userDetails.email}</p>
                <p><strong>Phone:</strong> ${userDetails.phoneNumber}</p>
                <p><strong>Address:</strong> ${userDetails.address}, ${userDetails.state}, ${userDetails.country}</p>

                <h3 style="color: black;">Cart Contents:</h3>
                <ul style="padding-left: 20px;">
                  ${cartItems.map(item => `
                    <li>
                      ${item.name} (Size: ${item.size}, Qty: ${item.quantity})
                    </li>
                  `).join('')}
                </ul>

                <p><strong>Transaction Reference:</strong> ${transactionReference}</p>
                <p><strong>Total Paid:</strong> ${totalAmount}</p>
              </div>

              <!-- FOOTER -->
              <div style="background: black; color: white; text-align: center; padding: 15px;">
                <p style="margin: 0;">— Chibythem Store (Admin Notification)</p>
              </div>
            </div>`,
    });

    // User Confirmation Email
    await sendEmail({
      to: userDetails.email, // customer
      subject: "Your Chibythem Order Confirmation",
      html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222; max-width: 600px; margin: 0 auto; border: 1px solid #eee;">
          
            <!-- HEADER -->
            <div style="text-align: center; padding: 20px;">
              <img src="https://chibythem.store/img/logo-2.png" alt="Chibythem Logo" style="height: 60px; margin-bottom: 10px;" />
              <h2 style="margin: 0; color: rgb(128, 0, 150);">Your order has been confirmed</h2>
            </div>

            <!-- BODY -->
            <div style="padding: 20px;">
              <p>Hi ${userDetails.firstName},</p>

              <p>Thank you for shopping with <strong>Chibythem</strong>. Your order has been received and is being processed.</p>

              <h3 style="color: black;">Order Summary:</h3>
              <ul style="padding-left: 20px;">
                ${cartItems.map(item => `
                  <li>
                    ${item.name} (Size: ${item.size}, Qty: ${item.quantity})
                  </li>
                `).join('')}
              </ul>

              <p><strong>Transaction Reference:</strong> ${transactionReference}</p>
              <p><strong>Total Paid:</strong> ${totalAmount}</p>

              <p>We’ll contact you once your order has been shipped.</p>
            </div>

            <!-- FOOTER -->
            <div style="background: black; color: white; text-align: center; padding: 15px;">
              <p style="margin: 0;">— Chibythem Store</p>
            </div>
          </div>
      `,
    });

    res.status(200).json({ message: 'Emails sent successfully to admin and user.' });
  } catch (error) {
    console.error('Error sending checkout emails:', error);
    res.status(500).json({ error: 'Failed to send emails.' });
  }
});

// OLD EMAIL SENDING ENGINE
// const transporter = nodemailer.createTransport({
//   host: process.env.HOST,
//   port: process.env.SMTP_PORT,
//   secure: process.env.SECURE,
//   auth: {
//     user: process.env.ADMIN_EMAIL,       // Replace this with your Gmail address
//     pass: process.env.EMAIL_PASS,       // Replace this with your Gmail App Password
//   }
// });


// // POST endpoint to handle checkout email
// app.post('/send-checkout-email', async (req, res) => {
//   try {
//     const { userDetails, cartItems, transactionReference, totalAmount } = req.body;

//     // Admin email options
//     const adminMailOptions = {
//       from: process.env.ADMIN_EMAIL,
//       to: process.env.EMAIL_USER,
//       subject: `New Order from ${userDetails.firstName} ${userDetails.lastName}`,
//       html: `
            // <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222; max-width: 600px; margin: 0 auto; border: 1px solid #eee;">

            //   <!-- HEADER -->
            //   <div style="text-align: center; padding: 20px;">
            //     <img src="https://triplechi.store/img/logo-2.png" alt="TripleChi Logo" style="height: 60px; margin-bottom: 10px;" />
            //     <h2 style="margin: 0; color: rgb(128, 0, 150);">New Order Received</h2>
            //   </div>

            //   <!-- BODY -->
            //   <div style="padding: 20px;">
            //     <h3 style="color: black;">Customer Info:</h3>
            //     <p><strong>Name:</strong> ${userDetails.firstName} ${userDetails.lastName}</p>
            //     <p><strong>Email:</strong> ${userDetails.email}</p>
            //     <p><strong>Phone:</strong> ${userDetails.phoneNumber}</p>
            //     <p><strong>Address:</strong> ${userDetails.address}, ${userDetails.state}, ${userDetails.country}</p>

            //     <h3 style="color: black;">Cart Contents:</h3>
            //     <ul style="padding-left: 20px;">
            //       ${cartItems.map(item => `
            //         <li>
            //           ${item.name} (Size: ${item.size}, Qty: ${item.quantity})
            //         </li>
            //       `).join('')}
            //     </ul>

            //     <p><strong>Transaction Reference:</strong> ${transactionReference}</p>
            //     <p><strong>Total Paid:</strong> ${totalAmount}</p>
            //   </div>

            //   <!-- FOOTER -->
            //   <div style="background: black; color: white; text-align: center; padding: 15px;">
            //     <p style="margin: 0;">— TripleChi Store (Admin Notification)</p>
            //   </div>
            // </div>
//           `
//     };

//     // User confirmation email options
//     const userMailOptions = {
//       from: process.env.ADMIN_EMAIL,
//       to: userDetails.email,
//       subject: 'Your TripleChi Order Confirmation',
//       // MESSAGE SENT TO USER

//       html: `
          //   <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222; max-width: 600px; margin: 0 auto; border: 1px solid #eee;">
      
          //   <!-- HEADER -->
          //   <div style="text-align: center; padding: 20px;">
          //     <img src="https://triplechi.store/img/logo-2.png" alt="TripleChi Logo" style="height: 60px; margin-bottom: 10px;" />
          //     <h2 style="margin: 0; color: rgb(128, 0, 150);">Your order has been confirmed</h2>
          //   </div>

          //   <!-- BODY -->
          //   <div style="padding: 20px;">
          //     <p>Hi ${userDetails.firstName},</p>

          //     <p>Thank you for shopping with <strong>TripleChi</strong>. Your order has been received and is being processed.</p>

          //     <h3 style="color: black;">Order Summary:</h3>
          //     <ul style="padding-left: 20px;">
          //       ${cartItems.map(item => `
          //         <li>
          //           ${item.name} (Size: ${item.size}, Qty: ${item.quantity})
          //         </li>
          //       `).join('')}
          //     </ul>

          //     <p><strong>Transaction Reference:</strong> ${transactionReference}</p>
          //     <p><strong>Total Paid:</strong> ${totalAmount}</p>

          //     <p>We’ll contact you once your order has been delivered.</p>
          //   </div>

          //   <!-- FOOTER -->
          //   <div style="background: black; color: white; text-align: center; padding: 15px;">
          //     <p style="margin: 0;">— TripleChi Store</p>
          //   </div>
          // </div>
//           `
//     };

//     // Send both emails
//     await transporter.sendMail(adminMailOptions);
//     await transporter.sendMail(userMailOptions);

//     res.status(200).json({ message: 'Emails sent successfully to admin and user.' });
//   } catch (error) {
//     console.error('Error sending checkout emails:', error);
//     res.status(500).json({ error: 'Failed to send emails.' });
//   }
// });


// START the server on port 5000
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
