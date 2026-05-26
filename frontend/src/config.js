/**
 * Application Configuration
 *
 * This module provides environment-aware configuration for API and Firebase.
 * Environment variables are defined in .env and .env.example files.
 *
 * Usage:
 *   import { getApiUrl, getFirebaseConfig } from './config';
 *   const apiUrl = getApiUrl();
 *   const firebaseConfig = getFirebaseConfig();
 */

/**
 * Get the API base URL based on the current environment
 * @returns {string} The API base URL
 */
export const getApiUrl = () => {
  // Check if VITE_API_URL is explicitly set
  const apiUrl = import.meta.env.VITE_API_URL;

  if (apiUrl) {
    return apiUrl;
  }

  // Fallback based on current environment
  if (import.meta.env.MODE === "production") {
    return "https://api.zeque.in";
  }

  return "http://localhost:8000";
};

/**
 * Get Firebase configuration based on the current environment
 * @returns {Object} Firebase configuration object
 */
export const getFirebaseConfig = () => {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
  };
};

/**
 * Check if running in development mode
 * @returns {boolean} True if in development, false otherwise
 */
export const isDevelopment = () => {
  return import.meta.env.MODE === "development";
};

/**
 * Check if running in production mode
 * @returns {boolean} True if in production, false otherwise
 */
export const isProduction = () => {
  return import.meta.env.MODE === "production";
};

/**
 * Get debug mode status
 * @returns {boolean} True if debug mode is enabled
 */
export const isDebugMode = () => {
  return import.meta.env.VITE_DEBUG === "true";
};

/**
 * Log configuration (useful for debugging)
 */
export const logConfig = () => {
  if (isDevelopment() || isDebugMode()) {
    console.log("=== Application Configuration ===");
    console.log("Mode:", import.meta.env.MODE);
    console.log("API URL:", getApiUrl());
    console.log("Firebase Project:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
    console.log("Debug Mode:", isDebugMode());
    console.log("==================================");
  }
};
