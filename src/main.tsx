// main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * Main entry point for the Jack Daniels Running Plan Generator
 * Initializes React application with proper error boundaries
 */
const initializeApp = (): void => {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    throw new Error(
      'Root element not found. Ensure index.html contains <div id="root"></div>'
    );
  }

  const root = createRoot(rootElement);

  try {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Failed to render application:", error);

    // Fallback error display
    rootElement.innerHTML = `
      <div style="
        min-height: 100vh; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        font-family: system-ui, -apple-system, sans-serif;
        background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
      ">
        <div style="text-align: center; padding: 2rem;">
          <h1 style="color: #dc2626; margin-bottom: 1rem;">Application Error</h1>
          <p style="color: #6b7280;">
            Unable to load the training plan generator. Please refresh the page and try again.
          </p>
          <button 
            onclick="window.location.reload()" 
            style="
              margin-top: 1rem; 
              padding: 0.5rem 1rem; 
              background: #3b82f6; 
              color: white; 
              border: none; 
              border-radius: 0.375rem; 
              cursor: pointer;
            "
          >
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }
};

// Initialize the application when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
