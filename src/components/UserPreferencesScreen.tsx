import React, { useState, useEffect } from "react";
import { ChevronRight, Globe, Check } from "lucide-react";
import type { UnitSystem, UnitPreferences } from "../types";
import {
  createUnitPreferences,
  detectDefaultUnitSystem,
  generatePreviewExamples,
} from "../utils/unitConversion";
import { saveUnitPreferences } from "../utils/sessionStorage";

interface UserPreferencesScreenProps {
  initialPreferences?: UnitPreferences;
  onComplete: (preferences: UnitPreferences) => void;
}

/**
 * User preferences screen for unit system selection with live preview
 * Includes locale-based defaults and session storage persistence
 */
export const UserPreferencesScreen: React.FC<UserPreferencesScreenProps> = ({
  initialPreferences,
  onComplete,
}) => {
  const [selectedSystem, setSelectedSystem] = useState<UnitSystem>(() => {
    if (initialPreferences) return initialPreferences.system;
    return detectDefaultUnitSystem();
  });

  const [detectedSystem] = useState<UnitSystem>(detectDefaultUnitSystem());
  const [previewExamples, setPreviewExamples] = useState(
    generatePreviewExamples(selectedSystem)
  );

  // Update preview examples when unit system changes
  useEffect(() => {
    setPreviewExamples(generatePreviewExamples(selectedSystem));
  }, [selectedSystem]);

  const handleSystemChange = (system: UnitSystem) => {
    setSelectedSystem(system);
  };

  const handleContinue = () => {
    const preferences = createUnitPreferences(selectedSystem);
    saveUnitPreferences(preferences);
    onComplete(preferences);
  };

  const isSystemSelected = (system: UnitSystem) => selectedSystem === system;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Measurement System
          </h1>
          <p className="text-lg text-gray-600">
            Select your preferred units for distances, paces, and measurements.
            All training plans will be displayed consistently in your chosen
            system.
          </p>
        </div>

        {/* Regional Detection Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center space-x-2 text-blue-700">
            <Globe className="h-5 w-5" />
            <span className="font-medium">
              Regional Detection: We've suggested {detectedSystem} units based
              on your location
            </span>
          </div>
        </div>

        {/* Unit System Selection */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Unit System
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {/* Metric Option */}
            <button
              onClick={() => handleSystemChange("metric")}
              className={`relative p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                isSystemSelected("metric")
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {isSystemSelected("metric") && (
                <div className="absolute top-4 right-4">
                  <Check className="h-5 w-5 text-blue-500" />
                </div>
              )}

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Metric System
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>• Distances in kilometres and metres</p>
                <p>• Paces in minutes per kilometre (min/km)</p>
                <p>• Altitude in metres above sea level</p>
                <p>• Track intervals in metres</p>
              </div>
            </button>

            {/* Imperial Option */}
            <button
              onClick={() => handleSystemChange("imperial")}
              className={`relative p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                isSystemSelected("imperial")
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {isSystemSelected("imperial") && (
                <div className="absolute top-4 right-4">
                  <Check className="h-5 w-5 text-blue-500" />
                </div>
              )}

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Imperial System
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>• Distances in miles and yards</p>
                <p>• Paces in minutes per mile (min/mi)</p>
                <p>• Altitude in feet above sea level</p>
                <p>• Track intervals in yards</p>
              </div>
            </button>
          </div>

          {/* Live Preview Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Preview: How your measurements will appear
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Pace Examples */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Training Paces
                </h4>
                <div className="space-y-2">
                  <PreviewItem
                    label="Easy pace"
                    value={previewExamples.easyPace}
                    description="Comfortable, conversational effort"
                  />
                  <PreviewItem
                    label="Tempo pace"
                    value={previewExamples.tempoPace}
                    description="Comfortably hard, sustained effort"
                  />
                </div>
              </div>

              {/* Distance Examples */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Training Distances
                </h4>
                <div className="space-y-2">
                  <PreviewItem
                    label="Track intervals"
                    value={previewExamples.shortDistance}
                    description="Speed work repetitions"
                  />
                  <PreviewItem
                    label="5K race distance"
                    value={previewExamples.mediumDistance}
                    description="Popular race distance"
                  />
                  <PreviewItem
                    label="Half marathon"
                    value={previewExamples.longDistance}
                    description="Long race distance"
                  />
                </div>
              </div>
            </div>

            {/* Additional Examples */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid md:grid-cols-2 gap-6">
                <PreviewItem
                  label="Weekly training volume"
                  value={previewExamples.weeklyMileage}
                  description="Total distance per week"
                />
                <PreviewItem
                  label="High altitude threshold"
                  value={previewExamples.altitude}
                  description="Pace adjustment required above this elevation"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 text-lg"
          >
            Continue to Assessment
            <ChevronRight className="ml-2 h-5 w-5" />
          </button>

          <p className="mt-4 text-sm text-gray-500">
            You can change your unit preferences later if needed
          </p>
        </div>
      </div>
    </div>
  );
};

interface PreviewItemProps {
  label: string;
  value: string;
  description: string;
}

/**
 * Individual preview item component for displaying measurement examples
 */
const PreviewItem: React.FC<PreviewItemProps> = ({
  label,
  value,
  description,
}) => {
  return (
    <div className="flex justify-between items-center py-2">
      <div>
        <div className="font-medium text-gray-900 text-sm">{label}</div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
      <div className="font-mono text-sm font-semibold text-blue-600 bg-white px-3 py-1 rounded">
        {value}
      </div>
    </div>
  );
};
