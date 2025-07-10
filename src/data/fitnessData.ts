import type { ExperienceLevel, RaceDistance } from "../types";

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
    id: "1500m",
    name: "1500m",
    distance: {
      metric: { value: 1500, unit: "m" },
      imperial: { value: 0.93, unit: "mi" },
    },
    timeFormat: "MM:SS",
  },
  {
    id: "mile",
    name: "Mile",
    distance: {
      metric: { value: 1.61, unit: "km" },
      imperial: { value: 1, unit: "mi" },
    },
    timeFormat: "MM:SS",
  },
  {
    id: "5k",
    name: "5K",
    distance: {
      metric: { value: 5, unit: "km" },
      imperial: { value: 3.1, unit: "mi" },
    },
    timeFormat: "MM:SS",
  },
  {
    id: "10k",
    name: "10K",
    distance: {
      metric: { value: 10, unit: "km" },
      imperial: { value: 6.2, unit: "mi" },
    },
    timeFormat: "MM:SS",
  },
  {
    id: "half",
    name: "Half Marathon",
    distance: {
      metric: { value: 21.1, unit: "km" },
      imperial: { value: 13.1, unit: "mi" },
    },
    timeFormat: "H:MM:SS",
  },
  {
    id: "marathon",
    name: "Marathon",
    distance: {
      metric: { value: 42.2, unit: "km" },
      imperial: { value: 26.2, unit: "mi" },
    },
    timeFormat: "H:MM:SS",
  },
];

/**
 * Race time to fitness score lookup table
 * Based on technical requirements TR-001 for complete fitness score tables
 * Simplified implementation covering key fitness scores 30-85
 */
export const RACE_TO_FITNESS: Record<string, Record<string, number>> = {
  "5k": {
    "30:00": 30,
    "28:00": 32,
    "26:00": 34,
    "24:00": 36,
    "22:30": 38,
    "21:00": 40,
    "19:30": 42,
    "18:30": 44,
    "17:30": 46,
    "16:45": 48,
    "16:00": 50,
    "15:20": 52,
    "14:45": 54,
    "14:15": 56,
    "13:45": 58,
    "13:20": 60,
    "12:55": 62,
    "12:35": 64,
    "12:15": 66,
    "11:55": 68,
    "11:40": 70,
    "11:25": 72,
    "11:10": 74,
    "10:55": 76,
    "10:40": 78,
    "10:30": 80,
    "10:15": 82,
    "10:00": 84,
    "9:45": 85,
  },
  "10k": {
    "62:00": 30,
    "58:00": 32,
    "54:00": 34,
    "50:00": 36,
    "47:00": 38,
    "44:00": 40,
    "41:00": 42,
    "38:30": 44,
    "36:30": 46,
    "35:00": 48,
    "33:30": 50,
    "32:00": 52,
    "30:45": 54,
    "29:30": 56,
    "28:30": 58,
    "27:30": 60,
    "26:45": 62,
    "26:00": 64,
    "25:15": 66,
    "24:30": 68,
    "24:00": 70,
    "23:30": 72,
    "23:00": 74,
    "22:30": 76,
    "22:00": 78,
    "21:30": 80,
    "21:00": 82,
    "20:30": 84,
    "20:00": 85,
  },
  half: {
    "2:20:00": 30,
    "2:10:00": 32,
    "2:00:00": 34,
    "1:52:00": 36,
    "1:45:00": 38,
    "1:38:00": 40,
    "1:32:00": 42,
    "1:27:00": 44,
    "1:22:30": 46,
    "1:18:30": 48,
    "1:15:00": 50,
    "1:12:00": 52,
    "1:09:00": 54,
    "1:06:30": 56,
    "1:04:00": 58,
    "1:02:00": 60,
    "1:00:00": 62,
    "58:30": 64,
    "57:00": 66,
    "55:30": 68,
    "54:00": 70,
    "52:45": 72,
    "51:30": 74,
    "50:15": 76,
    "49:00": 78,
    "48:00": 80,
    "47:00": 82,
    "46:00": 84,
    "45:00": 85,
  },
  marathon: {
    "4:50:00": 30,
    "4:30:00": 32,
    "4:10:00": 34,
    "3:55:00": 36,
    "3:40:00": 38,
    "3:25:00": 40,
    "3:12:00": 42,
    "3:00:00": 44,
    "2:50:00": 46,
    "2:42:00": 48,
    "2:34:00": 50,
    "2:28:00": 52,
    "2:22:00": 54,
    "2:17:00": 56,
    "2:12:00": 58,
    "2:08:00": 60,
    "2:04:00": 62,
    "2:01:00": 64,
    "1:58:00": 66,
    "1:55:00": 68,
    "1:52:00": 70,
    "1:49:30": 72,
    "1:47:00": 74,
    "1:44:30": 76,
    "1:42:00": 78,
    "1:40:00": 80,
    "1:38:00": 82,
    "1:36:00": 84,
    "1:34:00": 85,
  },
};

/**
 * Calculate fitness score from race performance
 * Returns fitness score or null if race time not found in tables
 */
export const calculateFitnessScore = (
  raceDistance: string,
  raceTime: string
): number | null => {
  const distanceTable = RACE_TO_FITNESS[raceDistance.toLowerCase()];
  if (!distanceTable) return null;

  const fitnessScore = distanceTable[raceTime];
  return fitnessScore || null;
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
 * Get race distance by ID with type safety
 */
export const getRaceDistanceById = (id: string): RaceDistance | undefined => {
  return RACE_DISTANCES.find((distance) => distance.id === id);
};
