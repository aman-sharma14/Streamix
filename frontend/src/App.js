import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import MovieDetailsPage from './components/MovieDetailsPage';
import VideoPlayerPage from './components/VideoPlayerPage';
import SearchResultsPage from './components/SearchResultsPage';
import CategoryPage from './components/CategoryPage'; // Import new page
import authService from './services/authService';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  return authService.isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movie/:id"
          element={
            <ProtectedRoute>
              <MovieDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/watch/:id"
          element={
            <ProtectedRoute>
              <VideoPlayerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchResultsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/category/:category"
          element={
            <ProtectedRoute>
              <CategoryPage />
            </ProtectedRoute>
          }
        />
        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
