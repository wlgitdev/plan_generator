import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Target,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import type {
  UnitPreferences,
  TrainingConstraints,
  FitnessAssessment,
} from "../types";
import {
  GOAL_RACES,
  getSessionDurationRange,
  getMinTrainingDays,
} from "../data/goalRaces";
import {
  validateTrainingConstraints,
  formatConstraintImpact,
  ALTITUDE_THRESHOLDS,
  isAboveAltitudeThreshold,
  getRecommendedSessionDuration
} from "../utils/constraintValidation";

interface Props {
  unitPreferences: UnitPreferences;
  fitnessAssessment: FitnessAssessment;
  onComplete: (constraints: TrainingConstraints) => void;
  onBack: () => void;
}

const DAYS_OF_WEEK = [
  { id: 0, name: "Sun", fullName: "Sunday" },
  { id: 1, name: "Mon", fullName: "Monday" },
  { id: 2, name: "Tue", fullName: "Tuesday" },
  { id: 3, name: "Wed", fullName: "Wednesday" },
  { id: 4, name: "Thu", fullName: "Thursday" },
  { id: 5, name: "Fri", fullName: "Friday" },
  { id: 6, name: "Sat", fullName: "Saturday" },
];

/**
 * Training Constraints Screen - Phase 1.4 Implementation
 * Captures schedule and goal constraints with real-time validation
 */
export const TrainingConstraintsScreen: React.FC<Props> = ({
  unitPreferences,
  fitnessAssessment,
  onComplete,
  onBack,
}) => {
  const [constraints, setConstraints] = useState<TrainingConstraints>(() => {
    const minDays = getMinTrainingDays(fitnessAssessment.selectedPlanLevel);
    const recommendedDuration = getRecommendedSessionDuration(
      fitnessAssessment.selectedPlanLevel,
      "10K" // Default goal race
    );

    // Initialize with recommended defaults
    const defaultDays = new Array(7).fill(false);
    // Start with minimum required days (skip Sunday for beginners, include it for others)
    const startIndex = fitnessAssessment.experienceLevel === "beginner" ? 1 : 0;
    for (let i = 0; i < minDays; i++) {
      defaultDays[(startIndex + i) % 7] = true;
    }

    return {
      availableTrainingDays: defaultDays,
      sessionDuration: recommendedDuration,
      goalRace: "10K",
      trainingAltitude: undefined,
    };
  });

  const [validation, setValidation] = useState(() =>
    validateTrainingConstraints(
      constraints,
      fitnessAssessment.selectedPlanLevel,
      unitPreferences.system,
      fitnessAssessment
    )
  );

  const [showAltitudeHelp, setShowAltitudeHelp] = useState(false);

  /**
   * Update validation whenever constraints change
   */
  useEffect(() => {
    const newValidation = validateTrainingConstraints(
      constraints,
      fitnessAssessment.selectedPlanLevel,
      unitPreferences.system,
      fitnessAssessment
    );
    setValidation(newValidation);
  }, [
    constraints,
    fitnessAssessment.selectedPlanLevel,
    unitPreferences.system,
    fitnessAssessment,
  ]);

  /**
   * Handle training day selection toggle
   */
  const handleDayToggle = (dayIndex: number) => {
    setConstraints((prev) => {
      const newDays = [...prev.availableTrainingDays];
      newDays[dayIndex] = !newDays[dayIndex];
      return { ...prev, availableTrainingDays: newDays };
    });
  };

  /**
   * Handle session duration change
   */
  const handleDurationChange = (duration: number) => {
    setConstraints((prev) => ({ ...prev, sessionDuration: duration }));
  };

  /**
   * Handle goal race selection
   */
  const handleGoalRaceChange = (raceId: string) => {
    setConstraints((prev) => {
      const newConstraints = { ...prev, goalRace: raceId };

      // Auto-adjust session duration based on new goal race
      const recommendedDuration = getRecommendedSessionDuration(
        fitnessAssessment.selectedPlanLevel,
        raceId
      );

      newConstraints.sessionDuration = recommendedDuration;
      return newConstraints;
    });
  };

  /**
   * Handle altitude input change
   */
  const handleAltitudeChange = (altitude: string) => {
    const numericAltitude =
      altitude === "" ? undefined : parseInt(altitude, 10);
    setConstraints((prev) => ({ ...prev, trainingAltitude: numericAltitude }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    if (validation.isValid || validation.warnings.length === 0) {
      onComplete(constraints);
    }
  };

  const selectedDaysCount =
    constraints.availableTrainingDays.filter(Boolean).length;
  const durationRange = getSessionDurationRange(
    fitnessAssessment.selectedPlanLevel
  );
  const altitudeThreshold = ALTITUDE_THRESHOLDS[unitPreferences.system];
  const impactSummary = formatConstraintImpact(
    constraints,
    fitnessAssessment.selectedPlanLevel,
    unitPreferences.system
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assessment
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Training Constraints
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Set your schedule and goals so we can create a training plan that
            fits your life. Your selections will be used to customize workout
            timing and intensity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Training Days Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Available Training Days
                </h2>
              </div>

              <p className="text-gray-600 mb-6">
                Select the days when you can consistently train. Your{" "}
                {fitnessAssessment.selectedPlanLevel} plan works best with{" "}
                {getMinTrainingDays(fitnessAssessment.selectedPlanLevel)}+ days
                per week.
              </p>

              <div className="grid grid-cols-7 gap-3">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => handleDayToggle(day.id)}
                    className={`
                      p-3 text-center rounded-lg border-2 transition-all duration-200
                      ${
                        constraints.availableTrainingDays[day.id]
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                      }
                    `}
                  >
                    <div className="font-semibold text-sm">{day.name}</div>
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {selectedDaysCount} day{selectedDaysCount !== 1 ? "s" : ""}{" "}
                  selected
                </span>
                {selectedDaysCount < 3 && (
                  <span className="text-amber-600 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Minimum 3 days recommended
                  </span>
                )}
              </div>
            </div>

            {/* Session Duration */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Session Duration
                </h2>
              </div>

              <p className="text-gray-600 mb-6">
                How much time can you typically dedicate to each training
                session, including warm-up and cool-down?
              </p>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="range"
                    min="30"
                    max="180"
                    step="15"
                    value={constraints.sessionDuration}
                    onChange={(e) =>
                      handleDurationChange(parseInt(e.target.value, 10))
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />

                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>30 min</span>
                    <span>105 min</span>
                    <span>180 min</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {constraints.sessionDuration} min
                    </div>
                    <div className="text-sm text-gray-600">
                      Selected duration
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      Recommended for {fitnessAssessment.selectedPlanLevel}:
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {durationRange.min}-{durationRange.max} minutes
                    </div>
                  </div>
                </div>

                {constraints.sessionDuration < durationRange.min && (
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-3">
                    <div className="flex">
                      <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 mr-2" />
                      <p className="text-sm text-amber-700">
                        Sessions may be too short for effective{" "}
                        {fitnessAssessment.selectedPlanLevel} training. Consider
                        longer sessions or a different plan level.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Goal Race */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Target className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Goal Race Distance
                </h2>
              </div>

              <p className="text-gray-600 mb-6">
                What race distance are you primarily training for? This will
                influence your workout structure and emphasis.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GOAL_RACES.map((race) => (
                  <button
                    key={race.id}
                    onClick={() => handleGoalRaceChange(race.id)}
                    className={`
                      p-4 text-left rounded-lg border-2 transition-all duration-200
                      ${
                        constraints.goalRace === race.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-blue-300"
                      }
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {race.name}
                      </h3>
                      <span className="text-sm text-gray-600">
                        {race.distance[unitPreferences.system].value}{" "}
                        {race.distance[unitPreferences.system].unit}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {race.description}
                    </p>
                    <div className="text-xs text-gray-500">
                      Typical time: {race.typicalDuration.intermediate}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Training Altitude */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Training Altitude
                </h2>
                <button
                  onClick={() => setShowAltitudeHelp(!showAltitudeHelp)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>

              <p className="text-gray-600 mb-4">
                Optional: Enter your typical training altitude to receive pace
                adjustments. Significant adjustments apply above{" "}
                {altitudeThreshold.minimum.toLocaleString()}{" "}
                {altitudeThreshold.unit}.
              </p>

              {showAltitudeHelp && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                  <p className="text-sm text-blue-700">
                    <strong>Altitude affects training paces:</strong> At higher
                    altitudes, your body works harder due to reduced oxygen.
                    Training paces should be adjusted to maintain the same
                    physiological effort. Pace adjustments become significant
                    above {altitudeThreshold.minimum.toLocaleString()}{" "}
                    {altitudeThreshold.unit}.
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder={`Enter altitude in ${altitudeThreshold.unit}`}
                    value={constraints.trainingAltitude || ""}
                    onChange={(e) => handleAltitudeChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <span className="text-gray-600 font-medium">
                  {altitudeThreshold.unit}
                </span>
              </div>

              {constraints.trainingAltitude &&
                isAboveAltitudeThreshold(
                  constraints.trainingAltitude,
                  unitPreferences.system
                ) && (
                  <div className="mt-4 bg-orange-50 border-l-4 border-orange-400 p-3">
                    <div className="flex">
                      <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 mr-2" />
                      <p className="text-sm text-orange-700">
                        Training paces will be adjusted for altitude. Expect 4-6
                        seconds per 400m slower than sea level paces for intense
                        sessions.
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Sidebar with validation and impact */}
          <div className="space-y-6">
            {/* Current Plan Impact */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Plan Impact
              </h3>

              <div className="space-y-3">
                {impactSummary.map((impact, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{impact}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Validation Results */}
            {validation.warnings.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recommendations
                </h3>

                <div className="space-y-3">
                  {validation.warnings.map((warning, index) => (
                    <div key={index} className="flex items-start">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{warning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Continue Button */}
            <button
              onClick={handleSubmit}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
            >
              Continue to Plan Generation
            </button>

            {/* Plan Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Current Selection
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  <strong>Plan Level:</strong>{" "}
                  {fitnessAssessment.selectedPlanLevel}
                </div>
                <div>
                  <strong>Training Days:</strong> {selectedDaysCount}/week
                </div>
                <div>
                  <strong>Session Length:</strong> {constraints.sessionDuration}{" "}
                  min
                </div>
                <div>
                  <strong>Goal Race:</strong> {constraints.goalRace}
                </div>
                <div>
                  <strong>Weekly Mileage:</strong>{" "}
                  {fitnessAssessment.currentWeeklyMileage}{" "}
                  {unitPreferences.distanceUnit}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
