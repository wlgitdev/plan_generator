import type { PlanLevel } from "../types";

/**
 * Static data for the four plan levels based on methodology
 * Includes examples in both metric and imperial units for universal appeal
 */
export const PLAN_LEVELS: PlanLevel[] = [
  {
    id: "foundation",
    name: "Foundation Plan",
    targetGroup: "Beginner/Returning",
    weeklyMileageRange: {
      metric: { min: 0, max: 32, unit: "km/week" },
      imperial: { min: 0, max: 20, unit: "mi/week" },
    },
    qualitySessions: 1,
    trainingDays: "3-4 days",
    description:
      "Building running habit and basic aerobic fitness with minimal intensity work.",
    suitableFor: [
      "New runners starting their journey",
      "Returning after extended break (6+ months)",
      "Focusing on injury prevention and base building",
      "Limited time availability (3-4 hours/week)",
    ],
    exampleDistances: {
      metric: [
        { value: 3, unit: "km", description: "typical easy run" },
        { value: 5, unit: "km", description: "weekend long run" },
        { value: 400, unit: "m", description: "stride intervals" },
      ],
      imperial: [
        { value: 2, unit: "mi", description: "typical easy run" },
        { value: 3, unit: "mi", description: "weekend long run" },
        { value: 400, unit: "yd", description: "stride intervals" },
      ],
    },
  },
  {
    id: "intermediate",
    name: "Intermediate Plan",
    targetGroup: "Recreational",
    weeklyMileageRange: {
      metric: { min: 24, max: 56, unit: "km/week" },
      imperial: { min: 15, max: 35, unit: "mi/week" },
    },
    qualitySessions: 2,
    trainingDays: "4-5 days",
    description:
      "Developing aerobic base with structured tempo and light interval training.",
    suitableFor: [
      "Regular recreational runners (6+ months consistent)",
      "Comfortable with 4-5 training days per week",
      "Goal times: 5K 25-30min, 10K 52-62min, Half 2:00-2:20",
      "Available 4-6 hours per week for training",
    ],
    exampleDistances: {
      metric: [
        { value: 5, unit: "km", description: "typical easy run" },
        { value: 12, unit: "km", description: "weekend long run" },
        { value: 3, unit: "km", description: "tempo run" },
      ],
      imperial: [
        { value: 3, unit: "mi", description: "typical easy run" },
        { value: 7, unit: "mi", description: "weekend long run" },
        { value: 2, unit: "mi", description: "tempo run" },
      ],
    },
  },
  {
    id: "advanced",
    name: "Advanced Plan",
    targetGroup: "Serious",
    weeklyMileageRange: {
      metric: { min: 48, max: 88, unit: "km/week" },
      imperial: { min: 30, max: 55, unit: "mi/week" },
    },
    qualitySessions: 3,
    trainingDays: "5-6 days",
    description:
      "Structured training with all intensity types for significant performance gains.",
    suitableFor: [
      "Committed runners with 12+ months consistent training",
      "Comfortable with 5-6 training days per week",
      "Goal times: 5K 20-25min, 10K 42-52min, Half 1:30-2:00",
      "Available 6-8 hours per week for training",
    ],
    exampleDistances: {
      metric: [
        { value: 8, unit: "km", description: "typical easy run" },
        { value: 20, unit: "km", description: "weekend long run" },
        { value: 5, unit: "km", description: "tempo run" },
      ],
      imperial: [
        { value: 5, unit: "mi", description: "typical easy run" },
        { value: 12, unit: "mi", description: "weekend long run" },
        { value: 3, unit: "mi", description: "tempo run" },
      ],
    },
  },
  {
    id: "elite",
    name: "Elite Plan",
    targetGroup: "Competitive",
    weeklyMileageRange: {
      metric: { min: 80, max: 128, unit: "km/week" },
      imperial: { min: 50, max: 80, unit: "mi/week" },
    },
    qualitySessions: 3,
    trainingDays: "6-7 days",
    description:
      "High-volume training with sophisticated workout structure for competitive athletes.",
    suitableFor: [
      "Competitive runners with 2+ years consistent high-volume training",
      "Comfortable with 6-7 training days per week",
      "Goal times: 5K sub-20min, 10K sub-42min, Half sub-1:30",
      "Available 8+ hours per week for training",
    ],
    exampleDistances: {
      metric: [
        { value: 12, unit: "km", description: "typical easy run" },
        { value: 32, unit: "km", description: "weekend long run" },
        { value: 8, unit: "km", description: "tempo run" },
      ],
      imperial: [
        { value: 7, unit: "mi", description: "typical easy run" },
        { value: 20, unit: "mi", description: "weekend long run" },
        { value: 5, unit: "mi", description: "tempo run" },
      ],
    },
  },
];

/**
 * Gets plan level by ID with type safety
 */
export const getPlanLevelById = (id: string): PlanLevel | undefined => {
  return PLAN_LEVELS.find((plan) => plan.id === id);
};

/**
 * Gets all plan level IDs for validation purposes
 */
export const getAllPlanLevelIds = (): string[] => {
  return PLAN_LEVELS.map((plan) => plan.id);
};
