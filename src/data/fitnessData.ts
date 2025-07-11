import type {
  ExperienceLevel,
  RaceDistance,
  RaceTimes,
  TrainingPaces,
} from "../types";
import { vdot_map } from "../data/vdot_map";

/**
 * Experience levels with weekly mileage ranges and plan recommendations
 * Based on FR-001 requirements for training plan mapping
 */
export const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  {
    id: "beginner",
    name: "Beginner/Returning",
    description: "New to running or returning after extended break",
    weeklyMileageRange: {
      metric: { min: 0, max: 16 }, // 0-10 mpw
      imperial: { min: 0, max: 10 },
    },
    recommendedPlan: "foundation",
    trainingDays: "3-4 days",
    characteristics: [
      "Starting running journey or returning after 6+ months break",
      "Focus on building running habit and preventing injury",
      "Comfortable with 3-4 training sessions per week",
      "Looking to establish aerobic base safely",
    ],
  },
  {
    id: "recreational",
    name: "Recreational",
    description: "Regular runner with moderate weekly volume",
    weeklyMileageRange: {
      metric: { min: 16, max: 40 }, // 10-25 mpw
      imperial: { min: 10, max: 25 },
    },
    recommendedPlan: "intermediate",
    trainingDays: "4-5 days",
    characteristics: [
      "Running consistently for 6+ months",
      "Comfortable with 4-5 training days per week",
      "Ready for structured tempo and light interval work",
      "Goal times: 5K 25-30min, 10K 52-62min, Half 2:00-2:20",
    ],
  },
  {
    id: "serious",
    name: "Serious",
    description: "Committed runner with higher training volume",
    weeklyMileageRange: {
      metric: { min: 40, max: 80 }, // 25-50 mpw
      imperial: { min: 25, max: 50 },
    },
    recommendedPlan: "advanced",
    trainingDays: "5-6 days",
    characteristics: [
      "Consistent training for 12+ months",
      "Comfortable with 5-6 training days per week",
      "Ready for all intensity types and higher volume",
      "Goal times: 5K 20-25min, 10K 42-52min, Half 1:30-2:00",
    ],
  },
  {
    id: "competitive",
    name: "Competitive",
    description: "High-volume competitive athlete",
    weeklyMileageRange: {
      metric: { min: 80, max: 160 }, // 50+ mpw
      imperial: { min: 50, max: 100 },
    },
    recommendedPlan: "elite",
    trainingDays: "6-7 days",
    characteristics: [
      "Competitive runner with 2+ years high-volume training",
      "Comfortable with 6-7 training days per week",
      "Experienced with sophisticated workout structures",
      "Goal times: 5K sub-20min, 10K sub-42min, Half sub-1:30",
    ],
  },
];

/**
 * Available race distances for fitness assessment
 * Supports both metric and imperial display with appropriate time formats
 */
export const RACE_DISTANCES: RaceDistance[] = [
  {
    id: "5K",
    name: "5K",
    distance: {
      metric: { value: 5, unit: "km" },
      imperial: { value: 3.1, unit: "mi" },
    },
    timeFormat: "MM:SS",
  },
  {
    id: "10K",
    name: "10K",
    distance: {
      metric: { value: 10, unit: "km" },
      imperial: { value: 6.2, unit: "mi" },
    },
    timeFormat: "MM:SS",
  },
  {
    id: "Half Marathon",
    name: "Half Marathon",
    distance: {
      metric: { value: 21.1, unit: "km" },
      imperial: { value: 13.1, unit: "mi" },
    },
    timeFormat: "H:MM:SS",
  },
  {
    id: "Marathon",
    name: "Marathon",
    distance: {
      metric: { value: 42.2, unit: "km" },
      imperial: { value: 26.2, unit: "mi" },
    },
    timeFormat: "H:MM:SS",
  },
];

/**
 * Calculate fitness score from race performance using vdot_map
 * Returns fitness score or null if race time not found
 */
export const calculateFitnessScore = (
  raceDistance: string,
  raceTime: string
): number | null => {
  // Search through all VDOT scores to find matching race time
  for (const [vdotScore, raceTimes] of Object.entries(vdot_map.raceTimes)) {
    const raceTimeForDistance = raceTimes[raceDistance as keyof RaceTimes];
    if (raceTimeForDistance === raceTime) {
      return parseInt(vdotScore);
    }
  }
  return null;
};

/**
 * Get training paces for a given fitness score
 * Returns pace object or null if fitness score not found
 */
export const getTrainingPaces = (
  fitnessScore: number
): TrainingPaces | null => {
  return vdot_map.paces[fitnessScore.toString()] || null;
};

/**
 * Get all available race times for a specific distance
 * Useful for validation and suggestions
 */
export const getAvailableRaceTimes = (raceDistance: string): string[] => {
  const times: string[] = [];
  for (const [, raceTimes] of Object.entries(vdot_map.raceTimes)) {
    const raceTimeForDistance = raceTimes[raceDistance as keyof RaceTimes];
    if (raceTimeForDistance) {
      times.push(raceTimeForDistance);
    }
  }
  return times.sort();
};

/**
 * Find closest race time in vdot_map for a given input
 * Useful for approximate fitness score calculation
 */
export const findClosestRaceTime = (
  raceDistance: string,
  inputTime: string
): { time: string; fitnessScore: number } | null => {
  const availableTimes = getAvailableRaceTimes(raceDistance);
  if (availableTimes.length === 0) return null;

  // Convert time strings to seconds for comparison
  const timeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(":").map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1]; // MM:SS
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]; // H:MM:SS
    return 0;
  };

  const inputSeconds = timeToSeconds(inputTime);
  let closestTime = availableTimes[0];
  let smallestDiff = Math.abs(timeToSeconds(availableTimes[0]) - inputSeconds);

  for (const time of availableTimes) {
    const diff = Math.abs(timeToSeconds(time) - inputSeconds);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestTime = time;
    }
  }

  const fitnessScore = calculateFitnessScore(raceDistance, closestTime);
  return fitnessScore ? { time: closestTime, fitnessScore } : null;
};

/**
 * Get plan recommendation based on experience level and fitness score
 */
export const getRecommendedPlan = (
  experienceLevel: string,
  fitnessScore?: number
): string => {
  const experience = EXPERIENCE_LEVELS.find(
    (level) => level.id === experienceLevel
  );
  if (!experience) return "foundation";

  // Use base recommendation from experience level
  // In a full implementation, fitness score could fine-tune this recommendation
  return experience.recommendedPlan;
};

/**
 * Validate weekly mileage against experience level
 */
export const validateMileageForExperience = (
  experienceLevel: string,
  weeklyMileage: number,
  unitSystem: "metric" | "imperial"
): { isValid: boolean; warning?: string } => {
  const experience = EXPERIENCE_LEVELS.find(
    (level) => level.id === experienceLevel
  );
  if (!experience) return { isValid: false };

  const range = experience.weeklyMileageRange[unitSystem];
  const unit = unitSystem === "metric" ? "km" : "mi";

  if (weeklyMileage < range.min) {
    return {
      isValid: true,
      warning: `Your current mileage (${weeklyMileage} ${unit}/week) is below the typical ${experience.name.toLowerCase()} range. Consider the Foundation plan if you're just starting out.`,
    };
  }

  if (weeklyMileage > range.max * 1.5) {
    return {
      isValid: true,
      warning: `Your current mileage (${weeklyMileage} ${unit}/week) is significantly above the typical ${experience.name.toLowerCase()} range. Consider a higher level plan for better progression.`,
    };
  }

  return { isValid: true };
};

/**
 * Format race time based on distance requirements
 */
export const formatRaceTime = (
  time: string,
  timeFormat: "MM:SS" | "H:MM:SS"
): string => {
  if (timeFormat === "MM:SS") {
    // Ensure MM:SS format
    const parts = time.split(":");
    if (parts.length === 2) return time;
    if (parts.length === 3 && parts[0] === "0")
      return `${parts[1]}:${parts[2]}`;
  }

  if (timeFormat === "H:MM:SS") {
    // Ensure H:MM:SS format
    const parts = time.split(":");
    if (parts.length === 3) return time;
    if (parts.length === 2) return `0:${time}`;
  }

  return time;
};

/**
 * Get experience level by ID with type safety
 */
export const getExperienceLevelById = (
  id: string
): ExperienceLevel | undefined => {
  return EXPERIENCE_LEVELS.find((level) => level.id === id);
};

/**
 * Get race time for a specific VDOT score and distance
 * Returns race time string or null if not found
 */
export const getRaceTimeForVDOT = (
  vdotScore: number,
  raceDistance: string
): string | null => {
  const raceTimes = vdot_map.raceTimes[vdotScore.toString()];
  if (!raceTimes) return null;

  return raceTimes[raceDistance as keyof RaceTimes] || null;
};

/**
 * Get example race times for display purposes
 * Returns object with beginner, intermediate, and advanced examples
 */
export const getExampleRaceTimes = (raceDistance: string) => {
  return {
    beginner: getRaceTimeForVDOT(40, raceDistance),
    intermediate: getRaceTimeForVDOT(50, raceDistance),
    advanced: getRaceTimeForVDOT(60, raceDistance),
  };
};

/**
 * Get race distance by ID with type safety
 */
export const getRaceDistanceById = (id: string): RaceDistance | undefined => {
  return RACE_DISTANCES.find((distance) => distance.id === id);
};
