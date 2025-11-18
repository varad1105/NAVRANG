const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  // For development, use a test account
  if (process.env.NODE_ENV !== 'production') {
    return nodemailer.createTransporter({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });
  }

  // Production configuration
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (userEmail, orderDetails, products) => {
  try {
    const transporter = createTransporter();

    // Create product details HTML
    const productsHTML = products.map(item => `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">
          <img src="${item.product.images[0]?.url || 'https://via.placeholder.com/50x50'}" 
               alt="${item.product.name}" 
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
      from: process.env.EMAIL_FROM || '"Navrang Navratri" <noreply@navrang.com>',
      to: userEmail,
      subject: `Order Confirmation - #${orderDetails._id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #ff6b35; }
            .header h1 { color: #ff6b35; margin: 0; font-size: 28px; }
            .order-info { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .order-info h3 { margin: 0 0 10px 0; color: #333; }
            .order-info p { margin: 5px 0; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background-color: #ff6b35; color: white; padding: 10px; text-align: left; }
            .total { text-align: right; margin: 20px 0; font-size: 18px; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Navrang Navratri</h1>
              <h2>Order Confirmation</h2>
            </div>
            
            <div class="order-info">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> #${orderDetails._id}</p>
              <p><strong>Date:</strong> ${new Date(orderDetails.createdAt).toLocaleDateString()}</p>
              <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
              <p><strong>Status:</strong> ${orderDetails.status}</p>
            </div>

            <div class="order-info">
              <h3>Shipping Address</h3>
              <p>${orderDetails.shippingAddress.street}</p>
              <p>${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state}</p>
              <p>Pincode: ${orderDetails.shippingAddress.pincode}</p>
              <p>Phone: ${orderDetails.shippingAddress.phone}</p>
            </div>

            <h3>Order Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Size</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${productsHTML}
              </tbody>
            </table>

            <div class="total">
              <p>Total Amount: ₹${orderDetails.totalAmount}</p>
            </div>

            <div class="footer">
              <p>Thank you for shopping with Navrang Navratri! 🎊</p>
              <p>For any queries, contact us at support@navrang.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Navrang Navratri" <noreply@navrang.com>',
      to: userEmail,
      subject: 'Welcome to Navrang Navratri! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Navrang Navratri</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #ff6b35; }
            .header h1 { color: #ff6b35; margin: 0; font-size: 28px; }
            .content { padding: 20px 0; text-align: center; }
            .cta-button { display: inline-block; background-color: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Navrang Navratri!</h1>
            </div>
            
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>Thank you for joining Navrang Navratri! We're excited to have you as part of our festive family.</p>
              <p>Discover our amazing collection of traditional Navratri attire and accessories.</p>
              <a href="http://localhost:3000" class="cta-button">Start Shopping</a>
            </div>

            <div class="footer">
              <p>For any queries, contact us at support@navrang.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendWelcomeEmail
};
