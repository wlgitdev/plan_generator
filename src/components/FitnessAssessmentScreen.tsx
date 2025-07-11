import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Info,
  Calculator,
  Clock,
} from "lucide-react";
import type {
  UnitPreferences,
  FitnessAssessment,
  RaceInput,
  TrainingPaces,
} from "../types";
import {
  EXPERIENCE_LEVELS,
  RACE_DISTANCES,
  calculateFitnessScore,
  getRecommendedPlan,
  validateMileageForExperience,
  getExperienceLevelById,
  getRaceDistanceById,
  getTrainingPaces,
  findClosestRaceTime,
  getExampleRaceTimes,
} from "../data/fitnessData";
import { PLAN_LEVELS } from "../data/planLevels";

interface FitnessAssessmentScreenProps {
  unitPreferences: UnitPreferences;
  onComplete: (assessment: FitnessAssessment) => void;
  onBack: () => void;
}

/**
 * Fitness Assessment Screen - Phase 1.3 Implementation
 * Captures user experience, race performance, and calculates fitness scores
 * Implements FR-001 to FR-008 for user assessment requirements
 */
export const FitnessAssessmentScreen: React.FC<
  FitnessAssessmentScreenProps
> = ({ unitPreferences, onComplete, onBack }) => {
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [weeklyMileage, setWeeklyMileage] = useState<number>(0);
  const [raceInput, setRaceInput] = useState<RaceInput>({
    distance: "",
    time: "",
  });
  const [includeRace, setIncludeRace] = useState<boolean>(false);
  const [selectedPlanLevel, setSelectedPlanLevel] = useState<string>("");
  const [calculatedFitnessScore, setCalculatedFitnessScore] = useState<
    number | null
  >(null);
  const [trainingPaces, setTrainingPaces] = useState<TrainingPaces | null>(
    null
  );
  const [raceTimeWarning, setRaceTimeWarning] = useState<string>("");
  const [validationMessages, setValidationMessages] = useState<string[]>([]);

  const isMetric = unitPreferences.system === "metric";
  const mileageUnit = isMetric ? "km" : "mi";

  // Calculate recommended plan and fitness score
  useEffect(() => {
    if (!experienceLevel) return;

    let fitnessScore = null;
    let paces = null;
    let timeWarning = "";

    if (includeRace && raceInput.distance && raceInput.time) {
      // Try exact match first
      fitnessScore = calculateFitnessScore(raceInput.distance, raceInput.time);

      if (!fitnessScore) {
        // Try fuzzy matching for approximate fitness score
        const closest = findClosestRaceTime(raceInput.distance, raceInput.time);
        if (closest) {
          fitnessScore = closest.fitnessScore;
          timeWarning = `No exact match found. Using closest time ${closest.time} (VDOT ${fitnessScore}) for pace calculations.`;
        }
      }

      if (fitnessScore) {
        paces = getTrainingPaces(fitnessScore);
      }
    }

    const recommendedPlan = getRecommendedPlan(
      experienceLevel,
      fitnessScore || undefined
    );

    if (!selectedPlanLevel) {
      setSelectedPlanLevel(recommendedPlan);
    }

    setCalculatedFitnessScore(fitnessScore);
    setTrainingPaces(paces);
    setRaceTimeWarning(timeWarning);
  }, [experienceLevel, raceInput, includeRace, selectedPlanLevel]);

  // Validate inputs and generate warnings
  useEffect(() => {
    const messages: string[] = [];

    if (experienceLevel && weeklyMileage > 0) {
      const validation = validateMileageForExperience(
        experienceLevel,
        weeklyMileage,
        unitPreferences.system
      );
      if (validation.warning) {
        messages.push(validation.warning);
      }
    }

    if (selectedPlanLevel && experienceLevel) {
      const experience = getExperienceLevelById(experienceLevel);
      const plan = PLAN_LEVELS.find((p) => p.id === selectedPlanLevel);

      if (
        experience &&
        plan &&
        selectedPlanLevel !== experience.recommendedPlan
      ) {
        messages.push(
          `You've selected the ${plan.name} which differs from the recommended ${experience.recommendedPlan} plan for your experience level. Ensure you're comfortable with the training demands.`
        );
      }
    }

    if (
      includeRace &&
      raceInput.distance &&
      raceInput.time &&
      !calculatedFitnessScore &&
      !raceTimeWarning
    ) {
      messages.push(
        "Unable to calculate fitness score from the provided race time. Please check the time format matches the expected format for this distance."
      );
    }

    setValidationMessages(messages);
  }, [
    experienceLevel,
    weeklyMileage,
    selectedPlanLevel,
    includeRace,
    raceInput,
    calculatedFitnessScore,
    unitPreferences.system,
  ]);

  const handleExperienceLevelChange = (levelId: string) => {
    setExperienceLevel(levelId);
    const level = getExperienceLevelById(levelId);
    if (level) {
      // Set default mileage to middle of range
      const range = level.weeklyMileageRange[unitPreferences.system];
      setWeeklyMileage(Math.round((range.min + range.max) / 2));
      setSelectedPlanLevel(""); // Reset to trigger new recommendation
    }
  };

  const handleRaceInputChange = (field: keyof RaceInput, value: string) => {
    setRaceInput((prev) => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    if (!experienceLevel || !selectedPlanLevel) return;

    const assessment: FitnessAssessment = {
      experienceLevel: experienceLevel as any,
      currentWeeklyMileage: weeklyMileage,
      raceInput:
        includeRace && raceInput.distance && raceInput.time
          ? raceInput
          : undefined,
      calculatedFitnessScore: calculatedFitnessScore || undefined,
      recommendedPlanLevel: getRecommendedPlan(
        experienceLevel,
        calculatedFitnessScore || undefined
      ),
      selectedPlanLevel,
    };

    onComplete(assessment);
  };

  const canContinue = experienceLevel && weeklyMileage > 0 && selectedPlanLevel;

  const selectedExperience = getExperienceLevelById(experienceLevel);
  const maxMileage = selectedExperience
    ? selectedExperience.weeklyMileageRange[unitPreferences.system].max * 2
    : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Fitness Assessment
          </h1>
        </div>

        {/* Unit System Indicator */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-8">
          <div className="flex items-center space-x-2 text-blue-700">
            <Info className="h-4 w-4" />
            <span className="text-sm font-medium">
              Using {unitPreferences.system} system: distances in {mileageUnit},
              paces in {unitPreferences.paceUnit}, altitude in{" "}
              {unitPreferences.altitudeUnit}
            </span>
          </div>
        </div>

        <div className="space-y-8">
          {/* Experience Level Selection */}
          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              1. What's your running experience level?
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {EXPERIENCE_LEVELS.map((level) => (
                <ExperienceLevelCard
                  key={level.id}
                  level={level}
                  selected={experienceLevel === level.id}
                  unitSystem={unitPreferences.system}
                  onClick={() => handleExperienceLevelChange(level.id)}
                />
              ))}
            </div>
          </section>

          {/* Weekly Mileage */}
          {experienceLevel && (
            <section className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                2. What's your current weekly training volume?
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weekly mileage ({mileageUnit}/week)
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0"
                      max={maxMileage}
                      step={isMetric ? 5 : 2}
                      value={weeklyMileage}
                      onChange={(e) => setWeeklyMileage(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="min-w-[80px] text-right">
                      <span className="text-2xl font-bold text-blue-600">
                        {weeklyMileage}
                      </span>
                      <span className="text-gray-500 ml-1">{mileageUnit}</span>
                    </div>
                  </div>

                  {selectedExperience && (
                    <div className="mt-2 text-sm text-gray-600">
                      Typical {selectedExperience.name.toLowerCase()} range:{" "}
                      {
                        selectedExperience.weeklyMileageRange[
                          unitPreferences.system
                        ].min
                      }
                      -
                      {
                        selectedExperience.weeklyMileageRange[
                          unitPreferences.system
                        ].max
                      }{" "}
                      {mileageUnit}/week
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Race Performance (Optional) */}
          {experienceLevel && (
            <section className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    3. Recent race performance (optional)
                  </h2>
                  <p className="text-gray-600">
                    Adding a recent race result helps us calculate more accurate
                    training paces
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeRace"
                    checked={includeRace}
                    onChange={(e) => setIncludeRace(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="includeRace"
                    className="text-sm font-medium text-gray-700"
                  >
                    Include race result
                  </label>
                </div>
              </div>

              {includeRace && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Race distance
                    </label>
                    <select
                      value={raceInput.distance}
                      onChange={(e) =>
                        handleRaceInputChange("distance", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select distance</option>
                      {RACE_DISTANCES.map((distance) => (
                        <option key={distance.id} value={distance.id}>
                          {distance.name} (
                          {distance.distance[unitPreferences.system].value}{" "}
                          {distance.distance[unitPreferences.system].unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Finish time
                    </label>
                    <input
                      type="text"
                      placeholder={
                        getRaceDistanceById(raceInput.distance)?.timeFormat ===
                        "H:MM:SS"
                          ? "H:MM:SS (e.g., 1:45:30)"
                          : "MM:SS (e.g., 22:30)"
                      }
                      value={raceInput.time}
                      onChange={(e) =>
                        handleRaceInputChange("time", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {raceInput.distance && (
                      <div className="text-xs text-gray-500 mt-1">
                        <div>
                        Format:{" "}
                        {getRaceDistanceById(raceInput.distance)?.timeFormat}
                        </div>
                        {(() => {
                          const examples = getExampleRaceTimes(
                            raceInput.distance
                          );
                          if (
                            examples.beginner &&
                            examples.intermediate &&
                            examples.advanced
                          ) {
                            return (
                              <div className="mt-1">
                                Example times: {examples.beginner} (beginner) •{" "}
                                {examples.intermediate} (intermediate) •{" "}
                                {examples.advanced} (advanced)
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {raceTimeWarning && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-yellow-700">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">Approximate Match</span>
                  </div>
                  <p className="text-sm text-yellow-600 mt-1">
                    {raceTimeWarning}
                  </p>
                </div>
              )}

              {calculatedFitnessScore && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-700">
                    <Calculator className="h-5 w-5" />
                    <span className="font-medium">
                      Fitness Score (VDOT): {calculatedFitnessScore}
                    </span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    This score will be used to calculate your personalized
                    training paces
                  </p>

                  {trainingPaces && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-700 mb-1">
                          Easy
                        </div>
                        <div className="font-mono text-sm font-semibold text-green-700 bg-white px-2 py-1 rounded">
                          {trainingPaces.easy}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-700 mb-1">
                          Marathon
                        </div>
                        <div className="font-mono text-sm font-semibold text-green-700 bg-white px-2 py-1 rounded">
                          {trainingPaces.marathon}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-700 mb-1">
                          Threshold
                        </div>
                        <div className="font-mono text-sm font-semibold text-green-700 bg-white px-2 py-1 rounded">
                          {trainingPaces.threshold}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-700 mb-1">
                          Interval
                        </div>
                        <div className="font-mono text-sm font-semibold text-green-700 bg-white px-2 py-1 rounded">
                          {trainingPaces.interval}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-700 mb-1">
                          Repetition
                        </div>
                        <div className="font-mono text-sm font-semibold text-green-700 bg-white px-2 py-1 rounded">
                          {trainingPaces.repetition}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Plan Recommendation */}
          {experienceLevel && (
            <section className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                4. Recommended training plan
              </h2>

              {selectedPlanLevel && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {PLAN_LEVELS.map((plan) => (
                      <PlanSelectionCard
                        key={plan.id}
                        plan={plan}
                        selected={selectedPlanLevel === plan.id}
                        recommended={
                          plan.id ===
                          getRecommendedPlan(
                            experienceLevel,
                            calculatedFitnessScore || undefined
                          )
                        }
                        unitSystem={unitPreferences.system}
                        onClick={() => setSelectedPlanLevel(plan.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Validation Messages */}
          {validationMessages.length > 0 && (
            <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800 mb-2">
                    Assessment Notes
                  </h3>
                  <ul className="space-y-1">
                    {validationMessages.map((message, index) => (
                      <li key={index} className="text-sm text-yellow-700">
                        • {message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={onBack}
              className="px-6 py-3 text-gray-600 font-medium hover:text-gray-800 transition-colors duration-200"
            >
              ← Back to Preferences
            </button>

            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className={`inline-flex items-center px-8 py-4 font-semibold rounded-lg transition-colors duration-200 text-lg ${
                canContinue
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Continue to Training Constraints
              <ChevronRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ExperienceLevelCardProps {
  level: any;
  selected: boolean;
  unitSystem: "metric" | "imperial";
  onClick: () => void;
}

const ExperienceLevelCard: React.FC<ExperienceLevelCardProps> = ({
  level,
  selected,
  unitSystem,
  onClick,
}) => {
  const range = level.weeklyMileageRange[unitSystem];
  const unit = unitSystem === "metric" ? "km" : "mi";

  return (
    <button
      onClick={onClick}
      className={`relative p-6 rounded-lg border-2 transition-all duration-200 text-left ${
        selected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {selected && (
        <div className="absolute top-4 right-4">
          <CheckCircle className="h-5 w-5 text-blue-500" />
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{level.name}</h3>

      <div className="mb-3">
        <div className="text-2xl font-bold text-blue-600">
          {range.min}-{range.max} {unit}
        </div>
        <div className="text-sm text-gray-500">per week</div>
      </div>

      <div className="space-y-1 text-sm text-gray-600 mb-4">
        <p>Training days: {level.trainingDays}</p>
        <p>Plan: {level.recommendedPlan}</p>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">
        {level.description}
      </p>
    </button>
  );
};

interface PlanSelectionCardProps {
  plan: any;
  selected: boolean;
  recommended: boolean;
  unitSystem: "metric" | "imperial";
  onClick: () => void;
}

const PlanSelectionCard: React.FC<PlanSelectionCardProps> = ({
  plan,
  selected,
  recommended,
  unitSystem,
  onClick,
}) => {
  const range = plan.weeklyMileageRange[unitSystem];

  return (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left ${
        selected
          ? "border-blue-500 bg-blue-50"
          : recommended
          ? "border-green-400 bg-green-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {recommended && !selected && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            Recommended
          </span>
        </div>
      )}

      {selected && (
        <div className="absolute top-2 right-2">
          <CheckCircle className="h-4 w-4 text-blue-500" />
        </div>
      )}

      <h4 className="font-semibold text-gray-900 mb-1 text-sm">{plan.name}</h4>

      <div className="text-xs text-gray-500 mb-2">
        {range.min}-{range.max} {range.unit}
      </div>

      <div className="text-xs text-gray-600">
        {plan.qualitySessions} quality sessions/week
      </div>
    </button>
  );
};
