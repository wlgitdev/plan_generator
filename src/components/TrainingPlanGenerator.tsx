/* eslint-disable no-console */
import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Globe,
  Play,
  Target,
  Trophy,
  Zap,
  CheckCircle,
} from "lucide-react";

// Types and Interfaces
interface UnitPreferences {
  system: "metric" | "imperial";
  distance: "km" | "miles";
  pace: "min/km" | "min/mile";
  altitude: "meters" | "feet";
}

interface PlanLevel {
  id: "foundation" | "intermediate" | "advanced" | "elite";
  name: string;
  subtitle: string;
  weeklyMileage: {
    metric: string;
    imperial: string;
  };
  description: string;
  qualitySessions: string;
  suitableFor: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Static Data - Plan Levels
const PLAN_LEVELS: PlanLevel[] = [
  {
    id: "foundation",
    name: "Foundation Plan",
    subtitle: "Beginner/Returning",
    weeklyMileage: {
      metric: "0-32 km per week",
      imperial: "0-20 miles per week",
    },
    description:
      "Building running habit and basic fitness with gradual progression",
    qualitySessions: "0-1 per week",
    suitableFor: "New runners or returning after extended break",
    color: "bg-green-500",
    icon: Play,
  },
  {
    id: "intermediate",
    name: "Intermediate Plan",
    subtitle: "Recreational Runner",
    weeklyMileage: {
      metric: "24-56 km per week",
      imperial: "15-35 miles per week",
    },
    description: "Developing aerobic base with light speed work introduction",
    qualitySessions: "1-2 per week",
    suitableFor: "Regular recreational runners",
    color: "bg-blue-500",
    icon: Target,
  },
  {
    id: "advanced",
    name: "Advanced Plan",
    subtitle: "Serious Runner",
    weeklyMileage: {
      metric: "48-88 km per week",
      imperial: "30-55 miles per week",
    },
    description:
      "Structured training with all intensity types and higher volume",
    qualitySessions: "2-3 per week",
    suitableFor: "Committed recreational to sub-elite runners",
    color: "bg-purple-500",
    icon: Zap,
  },
  {
    id: "elite",
    name: "Elite Plan",
    subtitle: "Competitive Runner",
    weeklyMileage: {
      metric: "80-128+ km per week",
      imperial: "50-80+ miles per week",
    },
    description: "High-volume training with sophisticated workout structure",
    qualitySessions: "3+ per week",
    suitableFor: "Competitive runners with significant time commitment",
    color: "bg-red-500",
    icon: Trophy,
  },
];

// Utility Functions
const detectRegionalUnits = (): "metric" | "imperial" => {
  const locale = navigator.language || "en-US";
  const country = locale.split("-")[1]?.toUpperCase();

  // Countries that primarily use imperial system
  const imperialCountries = ["US", "GB", "LR", "MM"];

  return imperialCountries.includes(country || "") ? "imperial" : "metric";
};

// const convertDistance = (value: number, from: string, to: string): number => {
//   if (from === to) return value;
//   const conversions: Record<string, Record<string, number>> = {
//     km: { miles: 0.621371 },
//     miles: { km: 1.609344 },
//     meters: { feet: 3.28084 },
//     feet: { meters: 0.3048 },
//   };
//   return value * (conversions[from]?.[to] || 1);
// };

// const convertPace = (
//   pace: string,
//   fromUnit: string,
//   toUnit: string
// ): string => {
//   if (fromUnit === toUnit) return pace;

//   const [minutes, seconds] = pace.split(":").map(Number);
//   const totalSeconds = minutes * 60 + seconds;

//   const factor = fromUnit === "min/km" ? 1.609344 : 0.621371;
//   const convertedSeconds = Math.round(totalSeconds * factor);

//   const newMinutes = Math.floor(convertedSeconds / 60);
//   const newSecs = convertedSeconds % 60;

//   return `${newMinutes}:${newSecs.toString().padStart(2, "0")}`;
// };

// Reusable Components
const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}> = ({ children, className = "", onClick, hover = false }) => (
  <div
    className={`bg-white rounded-lg border shadow-sm transition-all duration-200 ${
      hover ? "hover:shadow-md hover:scale-105" : ""
    } ${onClick ? "cursor-pointer" : ""} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-b ${className}`}>{children}</div>
);

const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
  disabled?: boolean;
}> = ({
  children,
  onClick,
  className = "",
  variant = "default",
  size = "default",
  disabled = false,
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    default: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
};

// Landing Screen Component
const LandingScreen: React.FC<{ onStartAssessment: () => void }> = ({
  onStartAssessment,
}) => {
  const [selectedView, setSelectedView] = useState<"metric" | "imperial">(
    "metric"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Jack Daniels Training Plan Generator
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Scientific, personalised running plans based on proven methodology
          </p>

          {/* Credibility Indicators */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center space-x-2 text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">
                Research-Based VDOT System
              </span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">
                Proven Olympic Coach Methods
              </span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">
                20-Week Structured Programs
              </span>
            </div>
          </div>

          {/* Unit Toggle for Examples */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 border shadow-sm">
              <button
                onClick={() => setSelectedView("metric")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedView === "metric"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Metric Examples
              </button>
              <button
                onClick={() => setSelectedView("imperial")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedView === "imperial"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Imperial Examples
              </button>
            </div>
          </div>

          <Button
            onClick={onStartAssessment}
            size="lg"
            className="text-xl px-8 py-4"
          >
            Start Assessment
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
        </div>

        {/* Plan Level Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {PLAN_LEVELS.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <Card key={plan.id} hover className="h-full">
                <CardHeader className={`${plan.color} text-white`}>
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-6 h-6" />
                    <div>
                      <CardTitle className="text-white text-base">
                        {plan.name}
                      </CardTitle>
                      <div className="text-sm opacity-90">{plan.subtitle}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      Weekly Volume
                    </div>
                    <div className="text-sm text-gray-600">
                      {plan.weeklyMileage[selectedView]}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      Focus
                    </div>
                    <div className="text-sm text-gray-600">
                      {plan.description}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      Quality Sessions
                    </div>
                    <div className="text-sm text-gray-600">
                      {plan.qualitySessions}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      Best For
                    </div>
                    <div className="text-sm text-gray-600">
                      {plan.suitableFor}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Methodology Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Scientific Training Approach
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Precision Paces
              </h3>
              <p className="text-sm text-gray-600">
                Training paces calculated from your current fitness using
                research-validated VDOT tables
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Progressive Loading
              </h3>
              <p className="text-sm text-gray-600">
                Systematic 20-week progression through base building, tempo,
                intervals, and race preparation
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Goal-Specific
              </h3>
              <p className="text-sm text-gray-600">
                Plans adapted for 5K to marathon distances with appropriate
                training emphasis
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Unit Preferences Screen Component
const UnitPreferenceScreen: React.FC<{
  preferences: UnitPreferences;
  onUpdate: (prefs: UnitPreferences) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ preferences, onUpdate, onNext, onBack }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Auto-detect regional default on component mount
  useEffect(() => {
    const detectedSystem = detectRegionalUnits();
    if (preferences.system !== detectedSystem) {
      handleSystemChange(detectedSystem);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSystemChange = (system: "metric" | "imperial") => {
    const newPrefs: UnitPreferences = {
      system,
      distance: system === "metric" ? "km" : "miles",
      pace: system === "metric" ? "min/km" : "min/mile",
      altitude: system === "metric" ? "meters" : "feet",
    };
    onUpdate(newPrefs);
  };

  const handleCustomUnitChange = (
    type: keyof UnitPreferences,
    value: string
  ) => {
    onUpdate({
      ...preferences,
      [type]: value,
    });
  };

  // Preview examples based on current preferences
  const getPreviewExamples = () => {
    const isMetric = preferences.system === "metric";

    return {
      trainingPace: isMetric ? "5:30/km" : "8:50/mile",
      longRun: isMetric ? "15.0 km" : "9.3 miles",
      intervalPace: isMetric ? "4:15/km" : "6:50/mile",
      elevation: isMetric ? "500 meters" : "1,640 feet",
      weeklyVolume: isMetric ? "45.0 km/week" : "28.0 miles/week",
    };
  };

  const examples = getPreviewExamples();
  const detectedRegion = detectRegionalUnits();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-4">
          <Globe className="w-12 h-12 mx-auto text-blue-600" />
          <h2 className="text-2xl font-bold">Choose Your Unit System</h2>
          <p className="text-gray-600">
            Select your preferred measurement system for training plans
          </p>

          {/* Regional Detection Indicator */}
          <div className="text-sm text-gray-500">
            Auto-detected: {detectedRegion === "metric" ? "Metric" : "Imperial"}{" "}
            system based on your location
          </div>
        </div>

        {/* Primary Unit System Selection */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card
            className={`cursor-pointer transition-all ${
              preferences.system === "metric"
                ? "ring-2 ring-blue-500 bg-blue-50"
                : "hover:shadow-md"
            }`}
            onClick={() => handleSystemChange("metric")}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Metric System
                {preferences.system === "metric" && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600 space-y-1">
                <div>• Distances: kilometers (km)</div>
                <div>• Pace: minutes per kilometer (min/km)</div>
                <div>• Altitude: meters (m)</div>
              </div>
              <div className="bg-gray-100 p-3 rounded text-sm">
                <strong>Example:</strong> 5:30/km pace, 10km run at 500m
                altitude
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${
              preferences.system === "imperial"
                ? "ring-2 ring-blue-500 bg-blue-50"
                : "hover:shadow-md"
            }`}
            onClick={() => handleSystemChange("imperial")}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Imperial System
                {preferences.system === "imperial" && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600 space-y-1">
                <div>• Distances: miles (mi)</div>
                <div>• Pace: minutes per mile (min/mile)</div>
                <div>• Altitude: feet (ft)</div>
              </div>
              <div className="bg-gray-100 p-3 rounded text-sm">
                <strong>Example:</strong> 8:50/mile pace, 6.2mi run at 1,640ft
                altitude
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Advanced Options</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? "Hide" : "Customize"}
              </Button>
            </CardTitle>
          </CardHeader>

          {showAdvanced && (
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Distance Unit
                  </label>
                  <select
                    value={preferences.distance}
                    onChange={(e) =>
                      handleCustomUnitChange("distance", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="km">Kilometers (km)</option>
                    <option value="miles">Miles (mi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pace Unit
                  </label>
                  <select
                    value={preferences.pace}
                    onChange={(e) =>
                      handleCustomUnitChange("pace", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="min/km">
                      Minutes per Kilometer (min/km)
                    </option>
                    <option value="min/mile">
                      Minutes per Mile (min/mile)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Altitude Unit
                  </label>
                  <select
                    value={preferences.altitude}
                    onChange={(e) =>
                      handleCustomUnitChange("altitude", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="meters">Meters (m)</option>
                    <option value="feet">Feet (ft)</option>
                  </select>
                </div>
              </div>

              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                <strong>Note:</strong> Mixed units may cause confusion. We
                recommend staying with standard {preferences.system} system
                settings.
              </div>
            </CardContent>
          )}
        </Card>

        {/* Live Preview */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Training pace:</span>{" "}
                  {examples.trainingPace}
                </div>
                <div>
                  <span className="font-medium">Long run:</span>{" "}
                  {examples.longRun}
                </div>
                <div>
                  <span className="font-medium">Interval pace:</span>{" "}
                  {examples.intervalPace}
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Elevation:</span>{" "}
                  {examples.elevation}
                </div>
                <div>
                  <span className="font-medium">Weekly volume:</span>{" "}
                  {examples.weeklyVolume}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Format Validation */}
        <Card>
          <CardHeader>
            <CardTitle>Format Validation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>
                  Pace format: mm:ss per {preferences.pace.split("/")[1]}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Distance precision: 0.1 {preferences.distance}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>
                  Altitude precision:{" "}
                  {preferences.altitude === "meters" ? "10m" : "50ft"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Unit consistency maintained throughout application</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex space-x-4">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back to Overview
          </Button>
          <Button onClick={onNext} className="flex-1">
            Continue with{" "}
            {preferences.system === "metric" ? "Metric" : "Imperial"} System
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const RunningPlanGenerator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<"landing" | "preferences">(
    "landing"
  );
  const [unitPreferences, setUnitPreferences] = useState<UnitPreferences>({
    system: "metric",
    distance: "km",
    pace: "min/km",
    altitude: "meters",
  });

  // Initialize with detected regional preferences
  useEffect(() => {
    const detectedSystem = detectRegionalUnits();
    setUnitPreferences({
      system: detectedSystem,
      distance: detectedSystem === "metric" ? "km" : "miles",
      pace: detectedSystem === "metric" ? "min/km" : "min/mile",
      altitude: detectedSystem === "metric" ? "meters" : "feet",
    });
  }, []);

  const handleStartAssessment = () => {
    setCurrentScreen("preferences");
  };

  const handleBackToLanding = () => {
    setCurrentScreen("landing");
  };

  const handlePreferencesComplete = () => {
    // Store preferences in session storage for persistence
    try {
      sessionStorage.setItem(
        "unitPreferences",
        JSON.stringify(unitPreferences)
      );
    } catch (error) {
      console.warn("Failed to store preferences in session storage:", error);
    }

    // TODO: Navigate to next screen (Fitness Assessment)
    console.log("Preferences saved:", unitPreferences);
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case "landing":
        return <LandingScreen onStartAssessment={handleStartAssessment} />;
      case "preferences":
        return (
          <UnitPreferenceScreen
            preferences={unitPreferences}
            onUpdate={setUnitPreferences}
            onNext={handlePreferencesComplete}
            onBack={handleBackToLanding}
          />
        );
      default:
        return <LandingScreen onStartAssessment={handleStartAssessment} />;
    }
  };

  return <div className="min-h-screen">{renderCurrentScreen()}</div>;
};

export default RunningPlanGenerator;
