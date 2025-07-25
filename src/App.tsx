import React, { useState, useEffect } from "react";
import { LandingScreen } from "./components/LandingScreen";
import { UserPreferencesScreen } from "./components/UserPreferencesScreen";
import { FitnessAssessmentScreen } from "./components/FitnessAssessmentScreen";
import { TrainingConstraintsScreen } from "./components/TrainingConstraintsScreen";
import { PlanGenerationScreen } from "./components/PlanGenerationScreen";
import type {
  AppState,
  UnitPreferences,
  FitnessAssessment,
  TrainingConstraints,
  GeneratedPlan,
} from "./types";
import {
  loadUnitPreferences,
  isSessionStorageAvailable,
} from "./utils/sessionStorage";
import {
  createUnitPreferences,
  detectDefaultUnitSystem,
} from "./utils/unitConversion";
import { ExportDownloadScreen } from "./components/ExportDownloadScreen";

/**
 * Main application component handling screen navigation and state management
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

  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(
    null
  );
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
   * Handle completion of user preferences and navigate to fitness assessment
   */
  const handlePreferencesComplete = (preferences: UnitPreferences) => {
    setAppState((prevState) => ({
      ...prevState,
      unitPreferences: preferences,
      currentScreen: "assessment",
    }));
  };

  /**
   * Handle completion of fitness assessment and navigate to constraints screen
   */
  const handleAssessmentComplete = (assessment: FitnessAssessment) => {
    setAppState((prevState) => ({
      ...prevState,
      fitnessAssessment: assessment,
      currentScreen: "constraints",
    }));
  };

  /**
   * Handle completion of training constraints and navigate to plan generation
   */
  const handleConstraintsComplete = (constraints: TrainingConstraints) => {
    setAppState((prevState) => ({
      ...prevState,
      trainingConstraints: constraints,
      currentScreen: "generation",
    }));
  };

  const handleBackToPlanGeneration = () => {
    setAppState((prevState) => ({
      ...prevState,
      currentScreen: "generation",
    }));
  };

  const handleExportComplete = () => {
    // Reset to landing or show completion message
    setAppState((prevState) => ({
      ...prevState,
      currentScreen: "landing",
    }));
    setGeneratedPlan(null);
  };

  /**
   * Handle completion of plan generation and navigate to export
   */
  const handlePlanGenerationComplete = (plan: GeneratedPlan) => {
    setGeneratedPlan(plan);
    setAppState((prevState) => ({
      ...prevState,
      currentScreen: "export",
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
    setGeneratedPlan(null);
  };

  /**
   * Navigate back to preferences screen from assessment
   */
  const handleBackToPreferences = () => {
    setAppState((prevState) => ({
      ...prevState,
      currentScreen: "preferences",
    }));
  };

  /**
   * Navigate back to assessment screen from constraints
   */
  const handleBackToAssessment = () => {
    setAppState((prevState) => ({
      ...prevState,
      currentScreen: "assessment",
    }));
  };

  /**
   * Navigate back to constraints screen from plan generation
   */
  const handleBackToConstraints = () => {
    setAppState((prevState) => ({
      ...prevState,
      currentScreen: "constraints",
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
        return (
          <FitnessAssessmentScreen
            unitPreferences={appState.unitPreferences}
            onComplete={handleAssessmentComplete}
            onBack={handleBackToPreferences}
          />
        );

      case "constraints":
        if (!appState.fitnessAssessment) {
          // Fallback to assessment if no fitness data
          console.warn(
            "Missing fitness assessment data, redirecting to assessment"
          );
          return (
            <FitnessAssessmentScreen
              unitPreferences={appState.unitPreferences}
              onComplete={handleAssessmentComplete}
              onBack={handleBackToPreferences}
            />
          );
        }

        return (
          <TrainingConstraintsScreen
            unitPreferences={appState.unitPreferences}
            fitnessAssessment={appState.fitnessAssessment}
            onComplete={handleConstraintsComplete}
            onBack={handleBackToAssessment}
          />
        );

      case "generation":
        if (!appState.fitnessAssessment || !appState.trainingConstraints) {
          // Fallback to constraints if missing data
          console.warn(
            "Missing required data for plan generation, redirecting to constraints"
          );

          if (!appState.fitnessAssessment) {
            return (
              <FitnessAssessmentScreen
                unitPreferences={appState.unitPreferences}
                onComplete={handleAssessmentComplete}
                onBack={handleBackToPreferences}
              />
            );
          }

          return (
            <TrainingConstraintsScreen
              unitPreferences={appState.unitPreferences}
              fitnessAssessment={appState.fitnessAssessment}
              onComplete={handleConstraintsComplete}
              onBack={handleBackToAssessment}
            />
          );
        }

        return (
          <PlanGenerationScreen
            unitPreferences={appState.unitPreferences}
            fitnessAssessment={appState.fitnessAssessment}
            trainingConstraints={appState.trainingConstraints}
            onComplete={handlePlanGenerationComplete}
            onBack={handleBackToConstraints}
          />
        );

      case "export":
        if (!generatedPlan) {
          // Fallback to generation if no plan data
          console.warn(
            "Missing generated plan data, redirecting to plan generation"
          );
          return (
            <PlanGenerationScreen
              unitPreferences={appState.unitPreferences}
              fitnessAssessment={appState.fitnessAssessment!}
              trainingConstraints={appState.trainingConstraints!}
              onComplete={handlePlanGenerationComplete}
              onBack={handleBackToConstraints}
            />
          );
        }
      
        return (
          <ExportDownloadScreen
            unitPreferences={appState.unitPreferences}
            generatedPlan={generatedPlan}
            onBack={handleBackToPlanGeneration}
            onComplete={handleExportComplete}
          />
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
