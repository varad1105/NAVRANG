const nodemailer = require('nodemailer');

// Create Email Transporter
const createTransporter = () => {
  // Development – Gmail SMTP
  if (process.env.NODE_ENV !== 'production') {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });
  }

  // Production SMTP
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};


// Send Order Confirmation Email
const sendOrderConfirmationEmail = async (userEmail, orderDetails, products) => {
  try {
    const transporter = createTransporter();

    const productsHTML = products.map(item => `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">
          <img src="${item.product.images[0]?.url || 'https://via.placeholder.com/50x50'}" 
            style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;" />
          ${item.product.name}
        </td>
        <td style="padding: 10px; border: 1px solid #ddd;">${item.size}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">₹${item.product.price.purchase}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">₹${item.product.price.purchase * item.quantity}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Navrang" <noreply@navrang.com>',
      to: userEmail,
      subject: `Order Confirmation - #${orderDetails._id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial; background: #f4f4f4; padding: 20px;">
          <div style="background: white; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto;">
            <h1 style="color:#ff6b35; text-align:center;">🎉 Navrang Navratri</h1>
            <h2 style="text-align:center;">Order Confirmation</h2>

            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> #${orderDetails._id}</p>
            <p><strong>Date:</strong> ${new Date(orderDetails.createdAt).toLocaleDateString()}</p>
            <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
            <p><strong>Status:</strong> ${orderDetails.status}</p>

            <h3>Shipping Address</h3>
            <p>${orderDetails.shippingAddress.street}</p>
            <p>${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state}</p>
            <p>Pincode: ${orderDetails.shippingAddress.pincode}</p>
            <p>Phone: ${orderDetails.shippingAddress.phone}</p>

            <h3>Order Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="background:#ff6b35; color:white; padding:10px;">Product</th>
                  <th style="background:#ff6b35; color:white; padding:10px;">Size</th>
                  <th style="background:#ff6b35; color:white; padding:10px;">Qty</th>
                  <th style="background:#ff6b35; color:white; padding:10px;">Price</th>
                  <th style="background:#ff6b35; color:white; padding:10px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${productsHTML}
              </tbody>
            </table>

            <h2 style="text-align:right;">Total Amount: ₹${orderDetails.totalAmount}</h2>

            <p style="text-align:center; margin-top:20px;">
              Thank you for shopping with Navrang! 🎊
            </p>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error("Email Error:", error);
    return { success: false, error: error.message };
  }
};


// Send Welcome Email
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Navrang" <noreply@navrang.com>',
      to: userEmail,
      subject: 'Welcome to Navrang! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial; background:#f4f4f4; padding:20px;">
          <div style="background:white; padding:20px; border-radius:10px; max-width:600px; margin:auto;">
            <h1 style="text-align:center; color:#ff6b35;">🎉 Welcome to Navrang Navratri!</h1>
            <h2>Hello ${userName},</h2>
            <p>Thank you for joining our festive family!</p>
            <a href="http://localhost:3000" 
               style="background:#ff6b35; color:white; padding:12px 25px; text-decoration:none; display:inline-block; border-radius:5px;">
               Start Shopping
            </a>

            <p style="margin-top:20px; text-align:center;">
              For any queries, contact support@navrang.com
            </p>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error("Welcome Email Error:", error);
    return { success: false, error: error.message };
  }
};


// Send Order Status Update Email
const sendStatusUpdateEmail = async (userEmail, orderDetails) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Navrang" <noreply@navrang.com>',
      to: userEmail,
      subject: `Order Status Update - #${orderDetails._id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial; background: #f4f4f4; padding: 20px;">
          <div style="background: white; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto;">
            <h1 style="color:#ff6b35; text-align:center;">Navrang Navratri</h1>
            <h2 style="text-align:center;">Order Status Updated</h2>
            <p><strong>Order ID:</strong> #${orderDetails._id}</p>
            <p><strong>Current Status:</strong> ${orderDetails.status}</p>
            <p style="margin-top:20px;">Thank you for shopping with Navrang.</p>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Status Update Email Error:", error);
    return { success: false, error: error.message };
  }
};


// Export
module.exports = {
  sendOrderConfirmationEmail,
  sendWelcomeEmail,
  sendStatusUpdateEmail
};
