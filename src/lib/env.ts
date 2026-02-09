import dotenv from 'dotenv/config';

export const env = {
  // Backend API URL

  BACKEND_URL: process.env.BACKEND_URL || 'https://pos-ci9g.onrender.com/api/v2',

  // Client-side backend URL (for browser)
  CLIENT_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,

  // Razorpay key
  NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

  // PayPal Client ID
  NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,

  // Environment
  NODE_ENV: process.env.NODE_ENV,
  // NextAuth Secret
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,

  // Check if we're in development
  isDevelopment: process.env.NODE_ENV,

  // Check if we're in production
  isProduction: process.env.NODE_ENV
} as const;

// Validate required environment variables
export function validateEnv() {
  const required = ['BACKEND_URL'];
  const missing = required.filter(key => !env[key as keyof typeof env]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
} 