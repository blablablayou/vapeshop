# Vape Shop System

A full-featured e-commerce platform for a vape shop with user authentication, product catalog, shopping cart, checkout, and admin dashboard functionality.

## Features

- **Age Verification Gate** - Regulatory compliance with age verification on entry
- **User Authentication** - Secure login and signup system
- **Product Catalog** - Browse and search vape products
- **Shopping Cart** - Add/remove items, view cart totals
- **Checkout System** - Complete purchase flow with address and payment info
- **Shipping & Returns** - Manage shipping options and return policies
- **Admin Dashboard** - Inventory management and admin controls
- **Contact System** - Customer support and communication
- **Responsive Design** - Mobile-friendly interface

## Getting Started

### Quick Start
1. Open index.html in your browser
2. Complete the age verification prompt
3. Browse products or create an account

### Demo Credentials
- **Admin Login**: dmin@store.com / dmin123
- **Admin Dashboard**: Navigate to admin-dashboard.html after logging in

## Project Structure

`vapeshop/
+-- index.html              # Home page & product showcase
+-- login.html              # User login form
+-- signup.html             # User registration form
+-- checkout.html           # Shopping cart & checkout
+-- shipping.html           # Shipping options & tracking
+-- returns.html            # Return policy & process
+-- contact.html            # Contact & support page
+-- admin-login.html        # Admin authentication
+-- admin-dashboard.html    # Admin control panel
+-- styles.css              # Global styling (responsive)
+-- script.js               # Age gate & UI logic
+-- auth.js                 # Authentication logic
+-- inventory.js            # Product & inventory management
+-- products.txt            # Product data
+-- images/                 # Product images & assets
`

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Storage**: localStorage for user sessions and preferences
- **Data**: JSON & text files for product data

## Security Features

- Age verification gate with localStorage persistence
- Admin login authentication
- Session management for user accounts
- Protected admin dashboard

## Data Management

- products.txt - Product catalog with descriptions and pricing
- inventory.js - Product management and stock tracking
- uth.js - User authentication and session handling

## Notes

- Age verification state is persisted in localStorage, so returning visitors won't be prompted again
- Product images are stored in the images/ directory
- Admin dashboard includes inventory and order management tools
- The system uses client-side storage for demo purposes

## Future Enhancements

- Backend database integration (MongoDB/PostgreSQL)
- Payment gateway integration (Stripe/PayPal)
- Email notifications for orders and support
- Advanced inventory tracking
- User account history and order tracking
- Real-time chat support
