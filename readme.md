# 🏀 NBA Jersey Store

A full-stack web application for an NBA jersey store with user authentication, shopping cart functionality, and admin panel.

## ✨ Features

### 🛍️ Store Functionality
- **Product Catalog**: Browse NBA jerseys with images, descriptions, and prices
- **Shopping Cart**: Add/remove items, adjust quantities
- **Checkout System**: Complete purchase flow with order confirmation
- **User Accounts**: Registration, login, and purchase history

### 🔐 Authentication & Security
- **User Registration**: Create new accounts with validation
- **Secure Login**: Password-protected authentication
- **Session Management**: Cookie-based user sessions
- **Rate Limiting**: DOS protection and login attempt limiting
- **Input Validation**: Comprehensive form validation

### 👨‍💼 Admin Panel
- **User Management**: Monitor user activity and purchases
- **Product Management**: Add, edit, and remove products
- **Activity Logging**: Track all user actions and system events
- **Sales Analytics**: View purchase history and user data

### 🎨 User Experience
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode**: Toggle between light and dark themes
- **Modern UI**: Clean, professional interface
- **Navigation**: Easy-to-use navigation bar

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Server**: `server/server.js` - Main Express application
- **Routes**: Modular route handlers for each functionality
- **Middleware**: Rate limiting, authentication, and validation
- **Data Persistence**: File-based JSON storage system

### Frontend (HTML + CSS + JavaScript)
- **Static Pages**: HTML files for each major function
- **Styling**: CSS with dark mode support
- **Interactivity**: Vanilla JavaScript for dynamic features
- **Responsive**: Mobile-first design approach

### Data Storage
- **Products**: `data/products.json` - Product catalog
- **Users**: `data/users.json` - User accounts
- **Carts**: `data/carts.json` - Shopping cart data
- **Purchases**: `data/purchases.json` - Order history
- **Activity**: `data/activity.json` - System activity logs

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd nba-jersey-store
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
nba-jersey-store/
├── client/                 # Frontend files
│   ├── *.html             # HTML pages
│   ├── style.css          # Main stylesheet
│   ├── navbar.js          # Navigation functionality
│   └── images/            # Product images
├── server/                 # Backend files
│   ├── server.js          # Main server file
│   ├── *-server.js        # Route handlers
│   ├── persist_module.js  # Data persistence
│   └── *-protection.js    # Security middleware
├── data/                   # Data storage
│   ├── products.json      # Product catalog
│   ├── users.json         # User accounts
│   ├── carts.json         # Shopping carts
│   └── purchases.json     # Order history
├── package.json            # Dependencies and scripts
└── test.js                 # Test suite
```

## 🔧 API Endpoints

### Authentication
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout

### Products
- `GET /products` - Get all products
- `POST /admin-add-product` - Add new product (admin)
- `POST /admin-remove-product` - Remove product (admin)
- `DELETE /admin-products/:id` - Delete product (admin)

### Shopping Cart
- `GET /cart` - Get user's cart
- `POST /add-to-cart` - Add item to cart
- `PUT /cart` - Update cart item quantity
- `DELETE /cart` - Remove item from cart

### Checkout
- `POST /checkout` - Process purchase
- `GET /my-items` - Get user's purchase history

### Admin
- `GET /admin-activity` - Get system activity logs
- `GET /admin-products` - Get all products for management

## 🧪 Testing

Run the comprehensive test suite:
```bash
node test.js
```

The test suite covers:
- ✅ Server functionality
- ✅ API endpoints
- ✅ Authentication
- ✅ Data validation
- ✅ Security features
- ✅ Error handling

**Note**: Some tests may show "failures" due to rate limiting protection working correctly. This is expected behavior in production.

## 🛡️ Security Features

- **Rate Limiting**: 1000 requests per minute per IP
- **Login Protection**: 5 failed attempts trigger temporary blocking
- **Input Validation**: All user inputs are validated
- **Session Management**: Secure cookie-based sessions
- **DOS Protection**: Automatic abuse detection and prevention

## 🎯 Production Deployment

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

### Security Considerations
- Rate limiting is configured for production use
- Input validation prevents injection attacks
- Session cookies are properly secured
- Error messages don't expose system internals

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests to ensure everything works
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- NBA for jersey designs and branding
- Express.js community for the web framework
- Node.js team for the runtime environment

---

**Built with ❤️ for basketball fans everywhere**

