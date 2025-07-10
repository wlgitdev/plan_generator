// components/LandingScreen.tsx
import React from "react";
import { ChevronRight, Award, Users, BookOpen, Target } from "lucide-react";
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
      {/* Hero Section */}
      <section className="relative px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Science-Based Training Plans
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
            Generate personalised running training plans based on the proven
            methodology of Dr. Jack Daniels. Trusted by Olympic athletes and
            recreational runners worldwide.
          </p>

          {/* Credibility Indicators */}
          <div className="mt-10 flex justify-center items-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Olympic Coach</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Research-Based</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Proven Results</span>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            The Jack Daniels Approach
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Precise Training Zones
              </h3>
              <p className="text-gray-600 text-sm">
                Five scientifically-defined intensity levels target specific
                physiological adaptations
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Progressive Structure
              </h3>
              <p className="text-gray-600 text-sm">
                20-week periodisation with systematic progression and built-in
                recovery
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Individual Adaptation
              </h3>
              <p className="text-gray-600 text-sm">
                Training paces calculated from your current fitness and
                performance goals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Plan Levels Overview */}
      <section className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Training Level
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Four distinct plans designed for different experience levels and
            time commitments. All distances shown in both metric and imperial
            units.
          </p>
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
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Get your personalised training plan in just a few minutes
          </p>
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
