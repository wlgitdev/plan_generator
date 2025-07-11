// components/LandingScreen.tsx
import React from "react";
import { ChevronRight } from "lucide-react";
import { PLAN_LEVELS } from "../data/planLevels";
import type { PlanLevel } from "../types";

interface LandingScreenProps {
  onStartAssessment: () => void;
}

/**
 * Landing screen component displaying methodology overview and plan levels
 * Provides entry point to the assessment process
 */
export const LandingScreen: React.FC<LandingScreenProps> = ({
  onStartAssessment,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Plan Levels Overview */}
      <section className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Available Plans
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLAN_LEVELS.map((plan) => (
            <PlanLevelCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-12 text-white">
          <button
            onClick={onStartAssessment}
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200 text-lg"
          >
            Start Assessment
            <ChevronRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
};

interface PlanLevelCardProps {
  plan: PlanLevel;
}

/**
 * Individual plan level card component with hover effects and dual-unit display
 */
const PlanLevelCard: React.FC<PlanLevelCardProps> = ({ plan }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
        <p className="text-sm text-gray-500 font-medium">{plan.targetGroup}</p>
      </div>

      {/* Weekly Mileage */}
      <div className="mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {plan.weeklyMileageRange.metric.min}-
            {plan.weeklyMileageRange.metric.max}{" "}
            {plan.weeklyMileageRange.metric.unit}
          </div>
          <div className="text-sm text-gray-500">
            {plan.weeklyMileageRange.imperial.min}-
            {plan.weeklyMileageRange.imperial.max}{" "}
            {plan.weeklyMileageRange.imperial.unit}
          </div>
        </div>
      </div>

      {/* Training Details */}
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Training Days:</span>
          <span className="font-medium">{plan.trainingDays}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Quality Sessions:</span>
          <span className="font-medium">{plan.qualitySessions}/week</span>
        </div>
      </div>

      {/* Example Distances */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">
          Example Distances:
        </h4>
        <div className="space-y-1">
          {plan.exampleDistances.metric.map((example, index) => (
            <div key={index} className="flex justify-between text-xs">
              <span className="text-gray-600">{example.description}:</span>
              <div className="text-right">
                <div className="font-medium">
                  {example.value} {example.unit}
                </div>
                <div className="text-gray-500">
                  {plan.exampleDistances.imperial[index].value}{" "}
                  {plan.exampleDistances.imperial[index].unit}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suitable For */}
      <div className="pt-4 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">
          Suitable For:
        </h4>
        <ul className="text-xs text-gray-600 space-y-1">
          {plan.suitableFor.slice(0, 2).map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-500 mr-1">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
