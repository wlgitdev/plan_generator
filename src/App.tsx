// App.tsx
import React, { useState, useEffect } from "react";
import { LandingScreen } from "./components/LandingScreen";
import { UserPreferencesScreen } from "./components/UserPreferencesScreen";
import type { AppState, UnitPreferences } from "./types";
import {
  loadUnitPreferences,
  isSessionStorageAvailable,
} from "./utils/sessionStorage";
import {
  createUnitPreferences,
  detectDefaultUnitSystem,
} from "./utils/unitConversion";

/**
 * Main application component handling screen navigation and state management
 * Implements Phase 1.1 (Landing) and 1.2 (User Preferences) functionality
 */
export const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(() => {
    // Initialize with default preferences
    const defaultSystem = detectDefaultUnitSystem();
    const defaultPreferences = createUnitPreferences(defaultSystem);

    return {
      currentScreen: "landing",
      unitPreferences: defaultPreferences,
    };
  });

  const [isLoading, setIsLoading] = useState(true);
  const [storageAvailable] = useState(isSessionStorageAvailable());

  /**
   * Load saved preferences from session storage on component mount
   */
  useEffect(() => {
    const loadSavedPreferences = () => {
      try {
        if (!storageAvailable) {
          console.warn("Session storage not available, using defaults");
          setIsLoading(false);
          return;
        }

        const savedPreferences = loadUnitPreferences();

        if (savedPreferences) {
          setAppState((prevState) => ({
            ...prevState,
            unitPreferences: savedPreferences,
          }));
        }
      } catch (error) {
        console.error("Error loading saved preferences:", error);
        // Continue with default preferences on error
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedPreferences();
  }, [storageAvailable]);

  /**
   * Navigate to the user preferences screen
   */
  const handleStartAssessment = () => {
    setAppState((prevState) => ({
      ...prevState,
      currentScreen: "preferences",
    }));
  };

  /**
   * Handle completion of user preferences and navigate to next screen
   */
  const handlePreferencesComplete = (preferences: UnitPreferences) => {
    setAppState((prevState) => ({
      ...prevState,
      unitPreferences: preferences,
      currentScreen: "assessment", // Will be implemented in next phase
    }));
  };

  /**
   * Navigate back to landing screen
   */
  const handleBackToLanding = () => {
    setAppState((prevState) => ({
      ...prevState,
      currentScreen: "landing",
    }));
  };

  /**
   * Render loading state while initializing
   */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Loading your training plan generator...
          </p>
        </div>
      </div>
    );
  }

  /**
   * Render current screen based on app state
   */
  const renderCurrentScreen = () => {
    switch (appState.currentScreen) {
      case "landing":
        return <LandingScreen onStartAssessment={handleStartAssessment} />;

      case "preferences":
        return (
          <UserPreferencesScreen
            initialPreferences={appState.unitPreferences}
            onComplete={handlePreferencesComplete}
          />
        );

      case "assessment":
        // Placeholder for next phase implementation
        return (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Fitness Assessment
              </h1>
              <p className="text-gray-600 mb-6">
                This screen will be implemented in the next phase.
              </p>
              <button
                onClick={handleBackToLanding}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Back to Landing
              </button>

              {/* Display current preferences for verification */}
              <div className="mt-8 p-4 bg-white rounded-lg shadow text-left">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Current Preferences:
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>System: {appState.unitPreferences.system}</p>
                  <p>Pace Unit: {appState.unitPreferences.paceUnit}</p>
                  <p>Distance Unit: {appState.unitPreferences.distanceUnit}</p>
                  <p>Altitude Unit: {appState.unitPreferences.altitudeUnit}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        // Fallback to landing screen for unknown states
        console.warn(
          `Unknown screen: ${appState.currentScreen}, falling back to landing`
        );
        return <LandingScreen onStartAssessment={handleStartAssessment} />;
    }
  };

  return (
    <div className="App">
      {/* Storage warning for users without session storage */}
      {!storageAvailable && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> Your preferences cannot be saved in this
                browser session. Please ensure cookies and local storage are
                enabled for the best experience.
              </p>
            </div>
          </div>
        </div>
      )}

      {renderCurrentScreen()}
    </div>
  );
};

export default App;
