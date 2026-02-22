import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Mail, ArrowLeft, Loader, CheckCircle, Key, Lock, Eye, EyeOff, RefreshCw } from 'lucide-react';
import authService from '../services/authService';

const ForgotPassword = () => {
    const navigate = useNavigate();

    // Steps: 1=Email, 2=Verification, 3=Reset Password
    const [step, setStep] = useState(1);

    // Data State
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Helper to reset error when user types
    const clearError = () => setError('');

    const sanitize = (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF\u200E\u200F]/g, "").trim();
    };

    // ==================== STEP 1: SEND CODE ====================
    const handleSendCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const sanitizedEmail = sanitize(email);

        try {
            await authService.forgotPassword(sanitizedEmail);
            setSuccessMessage('Verification code sent to your email!');
            setTimeout(() => {
                setSuccessMessage('');
                setStep(2);
            }, 1500);
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Failed to send verification code');
        } finally {
            setLoading(false);
        }
    };

    // ==================== STEP 2: VERIFY CODE ====================
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Verify code with backend before moving to password step
            await authService.verifyCode(sanitize(email), code);
            setSuccessMessage('Code verified successfully!');
            setTimeout(() => {
                setSuccessMessage('');
                setStep(3);
            }, 1000);
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Invalid or expired verification code');
        } finally {
            setLoading(false);
        }
    };

    // ==================== STEP 3: RESET PASSWORD ====================
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Password Complexity Regex (matching backend)
        const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/;

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            setLoading(false);
            return;
        }

        if (!passwordRegex.test(newPassword)) {
            setError('Password must contain at least one digit, one lowercase, one uppercase, one special character, and no whitespace');
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            await authService.resetPassword(sanitize(email), code, newPassword);
            setSuccessMessage('Password reset successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.error('Reset password error:', err);
            if (typeof err === 'object' && err !== null) {
                const errorMessages = Object.values(err).join('. ');
                setError(errorMessages || 'Failed to reset password');
            } else {
                setError(typeof err === 'string' ? err : 'Failed to reset password');
            }
        } finally {
            setLoading(false);
        }
    };

    // Render logic based on step
    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <form onSubmit={handleSendCode} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); clearError(); }}
                                    required
                                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 rounded-lg transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Send Verification Code'}
                        </button>
                    </form>
                );

            case 2:
                return (
                    <form onSubmit={handleVerifyCode} className="space-y-6">
                        <div className="text-center mb-4">
                            <span className="text-sm text-gray-400">Code sent to: {email}</span>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="ml-2 text-red-500 text-xs hover:underline"
                            >
                                (Change)
                            </button>
                        </div>
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium mb-2">
                                Verification Code
                            </label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    id="code"
                                    value={code}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setCode(val);
                                        clearError();
                                    }}
                                    required
                                    maxLength={6}
                                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition tracking-widest text-center text-lg font-mono"
                                    placeholder="000000"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 rounded-lg transition transform hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center"
                        >
                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Verify Code'}
                        </button>
                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={handleSendCode}
                                disabled={loading}
                                className="text-sm text-gray-400 hover:text-white flex items-center justify-center mx-auto space-x-1"
                            >
                                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                                <span>Resend Code</span>
                            </button>
                        </div>
                    </form>
                );

            case 3:
                return (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium mb-2">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => { setNewPassword(e.target.value); clearError(); }}
                                    required
                                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-11 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
                                    placeholder="Minimum 6 characters"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); clearError(); }}
                                    required
                                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-11 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
                                    placeholder="Confirm matches"
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 rounded-lg transition transform hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center"
                        >
                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                        </button>
                    </form>
                );
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            {/* Background Image */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-red-900/20 z-10"></div>
                <img
                    src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80"
                    alt="Cinema background"
                    className="w-full h-full object-cover opacity-20"
                />
            </div>

            <div className="relative z-20 w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded flex items-center justify-center">
                            <Play className="w-6 h-6 fill-white" />
                        </div>
                        <span className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                            Streamix
                        </span>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-800 shadow-2xl">
                    <h2 className="text-3xl font-bold mb-2 text-center">
                        {step === 1 ? 'Forgot Password?' : step === 2 ? 'Verify Code' : 'Reset Password'}
                    </h2>
                    <p className="text-gray-400 text-center mb-8">
                        {step === 1 ? 'Enter your email to receive a verification code' :
                            step === 2 ? 'Enter the 6-digit code sent to your email' :
                                'Create a new strong password'}
                    </p>

                    {/* Messages */}
                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm flex flex-col">
                            <span>{error}</span>
                            {/* Resend option if error occurs in step 3 (e.g. expired token) */}
                            {step === 3 && (
                                <button
                                    onClick={() => setStep(1)}
                                    className="text-red-300 underline mt-2 hover:text-white text-xs text-left"
                                >
                                    Resend Verification Code
                                </button>
                            )}
                        </div>
                    )}

                    {/* Form Content */}
                    {renderStep()}

                    {/* Back Link */}
                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-gray-400 hover:text-white transition text-sm flex items-center justify-center space-x-1">
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Login</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
