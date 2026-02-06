# Streamix Frontend - React Application

## 🚀 Complete Setup Guide

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend server running on `http://localhost:8081`

---

## 📁 Project Structure

```
Streamix/
├── backend/                  (Your Spring Boot project)
│   └── identity-service/
└── frontend/                 (React application)
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── LandingPage.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Dashboard.jsx
    │   ├── services/
    │   │   └── authService.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── package.json
    ├── tailwind.config.js
    └── .gitignore
```

---

## 🔧 Step-by-Step Setup

### Step 1: Navigate to Frontend Directory
```bash
cd Streamix/frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- React
- React Router DOM (for navigation)
- Axios (for API calls)
- Lucide React (for icons)
- Tailwind CSS (for styling)

### Step 3: Install Tailwind CSS
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

### Step 4: Create postcss.config.js
Create a file `postcss.config.js` in the frontend root:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Step 5: Start the Development Server
```bash
npm start
```

The application will open at `http://localhost:3000`

---

## 🎯 Features Implemented

### ✅ Landing Page
- Beautiful hero section with cinema background
- Feature highlights
- Statistics section
- Call-to-action buttons
- Responsive navigation
- Footer with links

### ✅ Registration Page
- Full name input
- Email validation
- Password strength check
- Confirm password matching
- Terms & conditions checkbox
- Error handling
- Success message with auto-redirect
- Beautiful gradient design matching landing page

### ✅ Login Page
- Email and password inputs
- Show/hide password toggle
- Remember me checkbox
- Forgot password link
- Error handling
- Loading states
- JWT token storage in localStorage

### ✅ Dashboard (Protected Route)
- User information display
- Logout functionality
- Session details
- Protected route (redirects to login if not authenticated)
- Welcome message
- Quick stats

### ✅ Authentication Service
- Register API call
- Login API call
- JWT token management
- localStorage integration
- Axios interceptors for token injection
- Logout functionality

---

## 🔐 Authentication Flow

1. **Registration:**
   - User fills registration form
   - Form validates data locally
   - Sends POST request to `/auth/register`
   - Shows success message
   - Redirects to login page

2. **Login:**
   - User enters email and password
   - Sends POST request to `/auth/login`
   - Receives JWT token
   - Stores token in localStorage
   - Redirects to dashboard

3. **Protected Routes:**
   - Checks for token in localStorage
   - If no token: redirects to login
   - If token exists: allows access

4. **Logout:**
   - Removes token from localStorage
   - Redirects to login page

---

## 🌐 API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Register new user |
| `/auth/login` | POST | Login user |

### Register Request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login Request:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Login Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "message": "Login successful!",
  "email": "john@example.com"
}
```

---

## 🎨 Design Theme

### Colors:
- **Primary Red**: `#DC2626` (red-600)
- **Dark Red**: `#991B1B` (red-800)
- **Background**: Black and Gray gradients
- **Text**: White with gray variations

### Components Styled:
- Gradient backgrounds
- Glassmorphism effects (backdrop-blur)
- Smooth transitions
- Hover effects
- Responsive design
- Loading states
- Error/Success messages

---

## 🔄 How to Test

### 1. Start Backend Server
```bash
cd backend/identity-service
mvn spring-boot:run
```
Backend should run on `http://localhost:8081`

### 2. Start Frontend Server
```bash
cd frontend
npm start
```
Frontend will run on `http://localhost:3000`

### 3. Test Flow:
1. **Visit Homepage**: `http://localhost:3000/`
2. **Click "Get Started"** → Goes to Register page
3. **Fill registration form** → Creates account
4. **Auto-redirect to Login** → Enter credentials
5. **Login successful** → Dashboard with user info
6. **Logout** → Returns to login page

---

## 🐛 Troubleshooting

### CORS Errors:
If you get CORS errors, add this to your Spring Boot backend `SecurityConfig`:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

Then add to your SecurityFilterChain:
```java
http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
```

### Proxy Not Working:
The `package.json` includes a proxy configuration. If it doesn't work, you can use the full URL:

In `authService.js`, change:
```javascript
const API_URL = 'http://localhost:8081/auth';
```

### Tailwind Not Working:
Make sure you have:
1. Installed Tailwind CSS
2. Created `tailwind.config.js`
3. Created `postcss.config.js`
4. Added Tailwind directives to `index.css`

---

## 📱 Responsive Design

The application is fully responsive:
- **Mobile**: Single column layout
- **Tablet**: Adjusted spacing and grid
- **Desktop**: Full multi-column layout

---

## 🚀 Next Steps (Future Enhancements)

- [ ] Forgot password functionality
- [ ] Email verification
- [ ] Profile page
- [ ] Movie catalog
- [ ] Search functionality
- [ ] User preferences
- [ ] Watch history
- [ ] Favorites
- [ ] Recommendations

---

## 📝 Notes

- JWT tokens are stored in `localStorage`
- Tokens expire after 10 hours (as configured in backend)
- All API calls go through Axios with automatic token injection
- Routes are protected using React Router

---

## 🎉 You're All Set!

Your Streamix frontend is now fully integrated with your Spring Boot backend!

**Test Credentials:**
After registering, use your email and password to login.

**Happy Streaming! 🎬**
