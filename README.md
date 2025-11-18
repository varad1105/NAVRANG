# 🎭 Navrang Navratri - E-Commerce Website

A complete e-commerce platform for Navratri outfits and festive fashion, built with modern web technologies.

## 🌟 Features

### 🛍️ For Customers
- Browse and shop for Navratri outfits (Men, Women, Kids)
- Filter products by category, price, size, and color
- Add items to cart with size and rental period options
- Wishlist functionality
- User authentication and profile management
- Order tracking and history
- Responsive design for all devices

### 🏪 For Sellers
- Seller dashboard with analytics
- Product management (Add, Edit, Delete)
- Order management and tracking
- Revenue and sales analytics
- Low stock alerts

### 💳 Payment System
- Cash on Delivery (COD)
- Demo payment integration for testing
- Secure checkout process

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd navrang-navratri-ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```
   This will install dependencies for both frontend and backend.

3. **Environment Setup**
   
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/navrang-navratri
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

4. **Start MongoDB**
   - If using local MongoDB, start the MongoDB service
   - If using MongoDB Atlas, update the `MONGODB_URI` in the `.env` file

5. **Run the application**
   ```bash
   npm run dev
   ```
   This will start both frontend (port 3000) and backend (port 5000) concurrently.

## 📁 Project Structure

```
navrang-navratri-ecommerce/
├── backend/
│   ├── models/          # Database models (User, Product, Order)
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── server.js        # Main server file
│   └── .env            # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React context providers
│   │   ├── pages/        # Page components
│   │   └── App.js        # Main app component
│   ├── public/          # Static files
│   └── tailwind.config.js
├── package.json         # Root package.json
└── README.md
```

## 🎨 Design Features

### Festive Theme
- Navratri-inspired color palette (Orange, Red, Gold, Green)
- Custom animations and hover effects
- Responsive design with mobile-first approach
- Festive gradients and patterns

### UI Components
- Modern card-based layouts
- Interactive product galleries
- Smooth transitions and micro-interactions
- Custom form inputs and buttons

## 🔧 Available Scripts

### Root Commands
- `npm run dev` - Start both frontend and backend in development mode
- `npm run install-all` - Install all dependencies
- `npm run server` - Start backend only
- `npm run client` - Start frontend only

### Backend Commands (cd backend)
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Frontend Commands (cd frontend)
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - Get all products with filters
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (seller only)
- `PUT /api/products/:id` - Update product (seller only)
- `DELETE /api/products/:id` - Delete product (seller only)

### Cart
- `GET /api/users/cart` - Get user cart
- `POST /api/users/cart` - Add item to cart
- `PUT /api/users/cart/:id` - Update cart item
- `DELETE /api/users/cart/:id` - Remove from cart

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/cancel` - Cancel order

### Seller
- `GET /api/sellers/dashboard` - Get seller dashboard
- `GET /api/sellers/products` - Get seller products
- `GET /api/sellers/orders` - Get seller orders

## 🧪 Testing Features

### Demo Payment
- Test the payment flow without real transactions
- Simulate both successful and failed payments
- 90% success rate for demo purposes

### Sample Data
- Pre-configured sample products for testing
- Demo user accounts can be created
- Seller functionality available for testing

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet.js for security headers

## 🌐 Deployment

### Frontend (Vercel/Netlify)
1. Build the frontend: `cd frontend && npm run build`
2. Deploy the `build` folder to your hosting platform
3. Update environment variables as needed

### Backend (Render/Railway)
1. Deploy the backend to your hosting platform
2. Set environment variables in the hosting dashboard
3. Ensure MongoDB is accessible from your deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Future Enhancements

- [ ] Real payment gateway integration (Stripe/Razorpay)
- [ ] Advanced search and filtering
- [ ] Product reviews and ratings
- [ ] Wishlist sharing
- [ ] Order tracking with real-time updates
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

## 📞 Support

For support and queries:
- Email: support@navrang.com
- Phone: +91 98765 43210

---

🎊 **Happy Navratri Shopping!** 🎊
