import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Target,
  MapPin,
  Info,
  Download,
  Calendar,
  TrendingUp,
  Zap,
  Heart,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import type {
  UnitPreferences,
  FitnessAssessment,
  TrainingConstraints,
  GeneratedPlan,
} from "../types";
import { generateTrainingPlan } from "../utils/planGeneration";
import { convertPace } from "../utils/unitConversion";

interface Props {
  unitPreferences: UnitPreferences;
  fitnessAssessment: FitnessAssessment;
  trainingConstraints: TrainingConstraints;
  onComplete: (plan: GeneratedPlan) => void;
  onBack: () => void;
}

/**
 * Plan Generation & Review Screen - Phase 1.5 Implementation
 * Displays generated training plan with paces, structure, and guidance
 */
export const PlanGenerationScreen: React.FC<Props> = ({
  unitPreferences,
  fitnessAssessment,
  trainingConstraints,
  onComplete,
  onBack,
}) => {
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(true);
  const [showConversionTable, setShowConversionTable] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<
    "paces" | "structure" | "guidance"
  >("paces");

  /**
   * Generate the training plan on component mount
   */
  useEffect(() => {
    const generatePlan = async () => {
      setIsGenerating(true);

      // Simulate plan generation delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 1500));

      try {
        const plan = generateTrainingPlan(
          fitnessAssessment,
          trainingConstraints,
          unitPreferences
        );
        setGeneratedPlan(plan);
      } catch (error) {
        console.error("Error generating plan:", error);
        // In a real app, you'd handle this error appropriately
      } finally {
        setIsGenerating(false);
      }
    };

    generatePlan();
  }, [fitnessAssessment, trainingConstraints, unitPreferences]);

  /**
   * Handle proceeding to export screen
   */
  const handleContinueToExport = () => {
    if (generatedPlan) {
      onComplete(generatedPlan);
    }
  };

  /**
   * Generate unit conversion table for reference
   */
  const generateConversionTable = () => {
    if (!generatedPlan) return null;

    const otherSystem =
      unitPreferences.system === "metric" ? "imperial" : "metric";
    const otherUnit = otherSystem === "metric" ? "min/km" : "min/mi";

    return {
      easy: convertPace(
        generatedPlan.trainingPaces.easy.value,
        unitPreferences.system,
        otherSystem
      ),
      marathon: convertPace(
        generatedPlan.trainingPaces.marathon.value,
        unitPreferences.system,
        otherSystem
      ),
      threshold: convertPace(
        generatedPlan.trainingPaces.threshold.value,
        unitPreferences.system,
        otherSystem
      ),
      interval: convertPace(
        generatedPlan.trainingPaces.interval.value,
        unitPreferences.system,
        otherSystem
      ),
      repetition: convertPace(
        generatedPlan.trainingPaces.repetition.value,
        unitPreferences.system,
        otherSystem
      ),
      unit: otherUnit,
      system: otherSystem,
    };
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Generating Your Training Plan
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Calculating personalized training paces and creating your 20-week
            periodized training structure...
          </p>
        </div>
      </div>
    );
  }

  if (!generatedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Plan Generation Error
          </h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            We encountered an issue generating your training plan. Please try
            again.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Back to Constraints
          </button>
        </div>
      </div>
    );
  }

  const conversionTable = generateConversionTable();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Constraints
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Your Training Plan
              </h1>
              <p className="text-gray-600">
                Personalized {generatedPlan.metadata.totalWeeks}-week periodized
                training plan
              </p>
            </div>

            <div className="text-right">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="text-sm text-gray-600">Plan Level</div>
                <div className="text-xl font-bold text-green-600 capitalize">
                  {generatedPlan.planLevel}
                </div>
                {generatedPlan.fitnessScore && (
                  <div className="text-sm text-gray-500">
                    VDOT: {generatedPlan.fitnessScore}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Success Indicator */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <h3 className="font-medium text-green-800">
                Plan Successfully Generated
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Your training plan is ready! Review your paces and structure
                below, then proceed to download your complete plan.
              </p>
            </div>
          </div>
        </div>

        {/* Altitude Adjustments Notice */}
        {generatedPlan.altitudeAdjustments && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-orange-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium text-orange-800 mb-1">
                  Altitude Adjustments Applied
                </h3>
                <p className="text-sm text-orange-700 mb-2">
                  Training at{" "}
                  {generatedPlan.altitudeAdjustments.altitude.value.toLocaleString()}{" "}
                  {generatedPlan.altitudeAdjustments.altitude.unit}
                </p>
                <p className="text-sm text-orange-600">
                  {generatedPlan.altitudeAdjustments.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: "paces", label: "Training Paces", icon: Clock },
                { id: "structure", label: "Plan Structure", icon: Calendar },
                { id: "guidance", label: "Guidance", icon: Info },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "paces" && (
              <TrainingPacesTab
                plan={generatedPlan}
                showConversionTable={showConversionTable}
                setShowConversionTable={setShowConversionTable}
                conversionTable={conversionTable}
              />
            )}

            {activeTab === "structure" && (
              <PlanStructureTab
                plan={generatedPlan}
                expandedPhase={expandedPhase}
                setExpandedPhase={setExpandedPhase}
              />
            )}

            {activeTab === "guidance" && <GuidanceTab plan={generatedPlan} />}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Plan generated on{" "}
            {generatedPlan.metadata.generatedAt.toLocaleDateString()}
          </div>

          <button
            onClick={handleContinueToExport}
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 text-lg shadow-lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Export Plan
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Training Paces Tab Component
 */
const TrainingPacesTab: React.FC<{
  plan: GeneratedPlan;
  showConversionTable: boolean;
  setShowConversionTable: (show: boolean) => void;
  conversionTable: any;
}> = ({
  plan,
  showConversionTable,
  setShowConversionTable,
  conversionTable,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Your Training Paces
        </h3>
        <p className="text-gray-600 mb-6">
          These paces are calculated based on your fitness level and will guide
          all your training sessions.
        </p>
      </div>

      {/* Main Paces Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">
                Intensity
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">
                Pace ({plan.trainingPaces.easy.unit})
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">
                Purpose
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">
                Usage
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(plan.trainingPaces).map(([key, pace]) => (
              <PaceRow key={key} intensity={key} pace={pace} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Unit Conversion Reference */}
      <div className="border-t pt-6">
        <button
          onClick={() => setShowConversionTable(!showConversionTable)}
          className="flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200 mb-4"
        >
          {showConversionTable ? (
            <ChevronUp className="w-4 h-4 mr-2" />
          ) : (
            <ChevronDown className="w-4 h-4 mr-2" />
          )}
          {showConversionTable ? "Hide" : "Show"} Unit Conversion Reference
        </button>

        {showConversionTable && conversionTable && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">
              Equivalent Paces in{" "}
              {conversionTable.system === "metric" ? "Metric" : "Imperial"}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(conversionTable)
                .filter(([key]) => key !== "unit" && key !== "system")
                .map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-sm font-medium text-gray-700 mb-1 capitalize">
                      {key}
                    </div>
                    <div className="font-mono text-sm text-gray-900 bg-white px-2 py-1 rounded">
                      {value as string}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {conversionTable.unit}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Plan Structure Tab Component
 */
const PlanStructureTab: React.FC<{
  plan: GeneratedPlan;
  expandedPhase: number | null;
  setExpandedPhase: (phase: number | null) => void;
}> = ({ plan, expandedPhase, setExpandedPhase }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          20-Week Plan Structure
        </h3>
        <p className="text-gray-600 mb-6">
          Your training is divided into four progressive phases, each building
          on the previous one.
        </p>
      </div>

      <div className="space-y-4">
        {plan.planStructure.map((phase) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            expanded={expandedPhase === phase.id}
            onToggle={() =>
              setExpandedPhase(expandedPhase === phase.id ? null : phase.id)
            }
          />
        ))}
      </div>

      {/* Plan Summary */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3">Plan Summary</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Total Duration:</strong> {plan.metadata.totalWeeks} weeks
          </div>
          <div>
            <strong>Weekly Mileage:</strong>{" "}
            {plan.metadata.weeklyMileageRange.min}-
            {plan.metadata.weeklyMileageRange.max}{" "}
            {plan.metadata.weeklyMileageRange.unit}
          </div>
          <div>
            <strong>Time Commitment:</strong>{" "}
            {plan.metadata.estimatedTimeCommitment}
          </div>
          <div>
            <strong>Training Days:</strong>{" "}
            {plan.constraints.availableTrainingDays.filter(Boolean).length}/week
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Guidance Tab Component
 */
const GuidanceTab: React.FC<{ plan: GeneratedPlan }> = ({ plan }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Training Guidance
        </h3>
        <p className="text-gray-600 mb-6">
          Important principles and guidelines for successful plan execution.
        </p>
      </div>

      {/* Progression Principles */}
      <div className="bg-green-50 rounded-lg p-6">
        <h4 className="font-semibold text-green-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Progression Principles
        </h4>
        <ul className="space-y-2">
          {plan.metadata.progressionPrinciples.map((principle, index) => (
            <li key={index} className="flex items-start text-green-800">
              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-600" />
              {principle}
            </li>
          ))}
        </ul>
      </div>

      {/* Safety Guidelines */}
      <div className="bg-yellow-50 rounded-lg p-6">
        <h4 className="font-semibold text-yellow-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Safety Guidelines
        </h4>
        <ul className="space-y-2 text-yellow-800">
          <li className="flex items-start">
            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-yellow-600" />
            Take rest days if you feel overly fatigued or show signs of
            overtraining
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-yellow-600" />
            Adjust paces for weather conditions (heat, cold, wind)
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-yellow-600" />
            Listen to your body and reduce intensity if experiencing pain
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-yellow-600" />
            Gradually increase mileage by no more than 10% per week
          </li>
        </ul>
      </div>

      {/* Implementation Tips */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2" />
          Implementation Tips
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-blue-800 mb-2">Pacing</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • Use the provided paces as guidelines, not absolute rules
              </li>
              <li>• Easy runs should feel conversational</li>
              <li>• Quality sessions require focus and effort</li>
              <li>• Start conservatively and build confidence</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-blue-800 mb-2">Adaptation</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Allow 2-3 weeks to adapt to new training phases</li>
              <li>• Modify workouts based on terrain and conditions</li>
              <li>• Include proper warm-up and cool-down</li>
              <li>• Focus on consistency over perfection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Individual Pace Row Component
 */
const PaceRow: React.FC<{
  intensity: string;
  pace: {
    value: string;
    unit: string;
    description: string;
    purpose: string;
  };
}> = ({ intensity, pace }) => {
  const getIntensityIcon = (intensity: string) => {
    switch (intensity) {
      case "easy":
        return <Heart className="w-4 h-4 text-green-600" />;
      case "marathon":
        return <Target className="w-4 h-4 text-blue-600" />;
      case "threshold":
        return <TrendingUp className="w-4 h-4 text-orange-600" />;
      case "interval":
        return <Zap className="w-4 h-4 text-red-600" />;
      case "repetition":
        return <RotateCcw className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "easy":
        return "text-green-700 bg-green-50";
      case "marathon":
        return "text-blue-700 bg-blue-50";
      case "threshold":
        return "text-orange-700 bg-orange-50";
      case "interval":
        return "text-red-700 bg-red-50";
      case "repetition":
        return "text-purple-700 bg-purple-50";
      default:
        return "text-gray-700 bg-gray-50";
    }
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
      <td className="py-4 px-4">
        <div className="flex items-center">
          {getIntensityIcon(intensity)}
          <span className="ml-2 font-medium text-gray-900 capitalize">
            {intensity}
          </span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div
          className={`inline-block px-3 py-1 rounded-full font-mono font-semibold text-lg ${getIntensityColor(
            intensity
          )}`}
        >
          {pace.value}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="text-sm text-gray-700">{pace.description}</div>
      </td>
      <td className="py-4 px-4">
        <div className="text-sm text-gray-600">{pace.purpose}</div>
      </td>
    </tr>
  );
};

/**
 * Phase Card Component
 */
const PhaseCard: React.FC<{
  phase: any;
  expanded: boolean;
  onToggle: () => void;
}> = ({ phase, expanded, onToggle }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 text-left"
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">{phase.name}</h4>
            <p className="text-sm text-gray-600 mt-1">{phase.focus}</p>
          </div>
          <div className="flex items-center text-gray-500">
            <span className="text-sm mr-2">{phase.duration} weeks</span>
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-6 py-4 bg-white">
          <p className="text-gray-700 mb-4">{phase.description}</p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Phase Characteristics */}
            <div>
              <h5 className="font-medium text-gray-900 mb-3">
                Key Characteristics
              </h5>
              <ul className="space-y-1">
                {phase.characteristics.map((char: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start text-sm text-gray-600"
                  >
                    <CheckCircle className="w-3 h-3 mr-2 mt-1 text-green-500 flex-shrink-0" />
                    {char}
                  </li>
                ))}
              </ul>
            </div>

            {/* Example Week */}
            <div>
              <h5 className="font-medium text-gray-900 mb-3">
                Example Week ({phase.exampleWeek.totalMileage.value}{" "}
                {phase.exampleWeek.totalMileage.unit})
              </h5>
              <div className="space-y-2">
                {phase.exampleWeek.sessions.map(
                  (session: any, index: number) => (
                    <div key={index} className="text-sm">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-gray-900">
                          {session.day}
                        </span>
                        <span className="text-gray-600 text-xs">
                          {session.duration}
                        </span>
                      </div>
                      <div className="text-gray-600">{session.description}</div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
