import { useState, useMemo, useCallback } from "react";
import {
  Calendar,
  Clock,
  Target,
  Activity,
  Settings,
  AlertTriangle,
  Download,
  Upload,
} from "lucide-react";

export type RaceDistance = "5K" | "10K" | "Half Marathon" | "Marathon";
export type PaceType =
  | "easy"
  | "marathon"
  | "threshold"
  | "interval"
  | "repetition";
export type Units = "km" | "mile";
const RACE_DISTANCES: Record<
  RaceDistance,
  { distance: number; weeks: number; minWeeks: number }
> = {
  "5K": { distance: 5, weeks: 18, minWeeks: 12 },
  "10K": { distance: 10, weeks: 20, minWeeks: 14 },
  "Half Marathon": { distance: 21.1, weeks: 22, minWeeks: 16 },
  Marathon: { distance: 42.2, weeks: 24, minWeeks: 18 },
};
// Race time predictions for each VDOT level
export interface VDOTRaceTimes {
  [vdot: number]: {
    [K in RaceDistance]: string; // Format: "MM:SS" or "H:MM:SS"
  };
}

// Training paces for each VDOT level
export interface VDOTPaces {
  [vdot: number]: {
    [U in Units]: {
      [P in PaceType]: string; // Format: "M:SS" per km/mile
    };
  };
}

// Combined VDOT data structure
export interface VDOTData {
  raceTimes: VDOTRaceTimes;
  paces: VDOTPaces;
}

interface WorkoutDefinition {
  type: string;
  percentage?: number;
  strides?: number;
  raceDistance?: boolean;
  raceDay?: boolean;
}

interface CompositeWorkout {
  type: "composite";
  parts: WorkoutDefinition[];
}

interface PhaseConfig {
  workouts: {
    [day: string]: string | WorkoutDefinition | CompositeWorkout;
  };
  volumeReduction?: number;
}

interface PhaseConfigEarlyLater {
  early: PhaseConfig;
  later: PhaseConfig;
}

interface Phases {
  phase1: number;
  phase2: number;
  phase3: number;
  phase4: number;
}

const WORKOUT_CONFIG = {
  phases: {
    FOUNDATION: {
      name: "Phase I (Foundation)",
      early: {
        workouts: {
          monday: "Rest",
          tuesday: { type: "easy", percentage: 0.15 },
          wednesday: { type: "easy", percentage: 0.15 },
          thursday: { type: "easy", percentage: 0.15 },
          friday: "Rest",
          saturday: { type: "easy", percentage: 0.15 },
          sunday: { type: "long", percentage: 0.25 },
        },
      },
      later: {
        workouts: {
          monday: "Rest",
          tuesday: { type: "easy", percentage: 0.15, strides: 6 },
          wednesday: { type: "easy", percentage: 0.15 },
          thursday: { type: "easy", percentage: 0.15, strides: 6 },
          friday: "Rest",
          saturday: { type: "easy", percentage: 0.15, strides: 6 },
          sunday: { type: "long", percentage: 0.25 },
        },
      },
    },
    EARLY_QUALITY: {
      name: "Phase II (Early Quality - Reps)",
      workouts: {
        monday: "Rest",
        tuesday: {
          type: "composite",
          parts: [
            { type: "easy", percentage: 0.12 },
            { type: "repetition", percentage: 0, raceDistance: true },
            { type: "easy", percentage: 0.08 },
          ],
        },
        wednesday: { type: "easy", percentage: 0.18 },
        thursday: {
          type: "composite",
          parts: [
            { type: "easy", percentage: 0.1 },
            { type: "threshold", percentage: 0.08 },
            { type: "easy", percentage: 0.07 },
          ],
        },
        friday: "Rest",
        saturday: { type: "easy", percentage: 0.15 },
        sunday: { type: "long", percentage: 0.22 },
      },
    },
    TRANSITION_QUALITY: {
      name: "Phase III (Transition Quality - Intervals)",
      workouts: {
        monday: "Rest",
        tuesday: {
          type: "composite",
          parts: [
            { type: "easy", percentage: 0.1 },
            { type: "interval", percentage: 0, raceDistance: true },
            { type: "easy", percentage: 0.08 },
          ],
        },
        wednesday: { type: "easy", percentage: 0.15, strides: 6 },
        thursday: {
          type: "composite",
          parts: [
            { type: "easy", percentage: 0.08 },
            { type: "threshold", percentage: 0.12 },
            { type: "easy", percentage: 0.05 },
          ],
        },
        friday: "Rest",
        saturday: { type: "easy", percentage: 0.12 },
        sunday: { type: "long", percentage: 0.22 },
      },
    },
    FINAL_QUALITY: {
      name: "Phase IV (Final Quality - Racing)",
      volumeReduction: 0.8,
      workouts: {
        monday: "Rest",
        tuesday: {
          type: "composite",
          parts: [
            { type: "easy", percentage: 0.12 },
            { type: "threshold", percentage: 0.15 },
            { type: "easy", percentage: 0.08 },
          ],
        },
        wednesday: { type: "easy", percentage: 0.18 },
        thursday: {
          type: "composite",
          parts: [
            { type: "easy", percentage: 0.1 },
            { type: "raceSpecific", percentage: 0, raceDistance: true },
            { type: "easy", percentage: 0.07 },
          ],
        },
        friday: "Rest",
        saturday: { type: "easy", percentage: 0.12, strides: 4 },
        sunday: { type: "easy", percentage: 0.18, raceDay: true },
      },
    },
  },

  // Race-specific workout definitions
  raceWorkouts: {
    repetition: {
      "5K": "8x200R (200jog) or 6x400R (400jog)",
      "10K": "6x200R (200jog) + 4x400R (400jog)",
      "Half Marathon": "4x200R (200jog) + 3x400R (400jog)",
      Marathon: "6x200R (200jog) + 2x400R (400jog)",
    },
    interval: {
      "5K": "6x800I (2:30r) or 5x1000I (3:00r)",
      "10K": "5x1000I (3:00r) or 4x1200I (3:30r)",
      "Half Marathon": "4x1200I (3:30r) or 3x1600I (4:00r)",
      Marathon: "3x1600I (4:00r) or 2x2000I (5:00r)",
    },
    raceSpecific: {
      "5K": "4x400I (90s) or 6x300R (300jog)",
      "10K": "3x800I (2:30r) + 4x200R (200jog)",
      "Half Marathon": "2x1200I (3:30r) + 4x300R (200jog)",
      Marathon: "8x400T (90s) or 2km T + 4x200R",
    },
  },
};

class WorkoutBuilder {
  private unit: string;

  constructor(units: string) {
    this.unit = units === "metric" ? "km" : "mi";
  }

  buildWorkout(
    workoutDef: string | WorkoutDefinition | CompositeWorkout,
    weeklyVolume: number,
    raceDistance: RaceDistance,
    weekNum: number = 0
  ): string {
    if (typeof workoutDef === "string") {
      return workoutDef;
    }

    if (workoutDef.type === "composite") {
      return this.buildCompositeWorkout(
        (workoutDef as CompositeWorkout).parts,
        weeklyVolume,
        raceDistance
      );
    }

    return this.buildSingleWorkout(
      workoutDef as WorkoutDefinition,
      weeklyVolume,
      raceDistance,
      weekNum
    );
  }

  private buildSingleWorkout(
    workoutDef: WorkoutDefinition,
    weeklyVolume: number,
    raceDistance: RaceDistance,
    weekNum: number
  ): string {
    const {
      type,
      percentage = 0,
      strides,
      raceDistance: isRaceSpecific,
      raceDay,
    } = workoutDef;

    // Handle special cases
    if (raceDay && weekNum === 23) {
      return "RACE DAY!";
    }

    const distance = Math.round(weeklyVolume * percentage);
    let workout = `${this.getWorkoutPrefix(type)} ${distance}${this.unit}`;

    // Add race-specific workouts
    if (
      isRaceSpecific &&
      WORKOUT_CONFIG.raceWorkouts[
        type as keyof typeof WORKOUT_CONFIG.raceWorkouts
      ]
    ) {
      workout =
        WORKOUT_CONFIG.raceWorkouts[
          type as keyof typeof WORKOUT_CONFIG.raceWorkouts
        ][raceDistance];
    }

    // Add strides if specified
    if (strides) {
      workout += ` + ${strides}ST`;
    }

    return workout;
  }

  private buildCompositeWorkout(
    parts: WorkoutDefinition[],
    weeklyVolume: number,
    raceDistance: RaceDistance
  ): string {
    return parts
      .map((part) => {
        if (
          part.raceDistance &&
          WORKOUT_CONFIG.raceWorkouts[
            part.type as keyof typeof WORKOUT_CONFIG.raceWorkouts
          ]
        ) {
          return WORKOUT_CONFIG.raceWorkouts[
            part.type as keyof typeof WORKOUT_CONFIG.raceWorkouts
          ][raceDistance];
        }

        const distance = Math.round(weeklyVolume * (part.percentage || 0));
        return `${this.getWorkoutPrefix(part.type)} ${distance}${this.unit}`;
      })
      .join(" + ");
  }

  private getWorkoutPrefix(type: string): string {
    const prefixes: { [key: string]: string } = {
      easy: "E",
      long: "L",
      marathon: "M",
      threshold: "T",
      interval: "I",
      repetition: "R",
      raceSpecific: "RS",
    };
    return prefixes[type] || "E";
  }
}

// Phase determination logic
class PhaseManager {
  static determinePhase(weekNum: number, phases: Phases): string {
    if (weekNum < phases.phase1) {
      return "FOUNDATION";
    } else if (weekNum < phases.phase1 + phases.phase2) {
      return "EARLY_QUALITY";
    } else if (weekNum < phases.phase1 + phases.phase2 + phases.phase3) {
      return "TRANSITION_QUALITY";
    } else {
      return "FINAL_QUALITY";
    }
  }

  static getPhaseConfig(weekNum: number, phases: Phases): PhaseConfig {
    const phaseType = this.determinePhase(weekNum, phases);
    const config = WORKOUT_CONFIG.phases[phaseType as keyof typeof WORKOUT_CONFIG.phases];

    // Handle foundation phase subdivision
    if (phaseType === "FOUNDATION") {
      const foundationConfig = config as PhaseConfigEarlyLater;
      return weekNum < 3 ? foundationConfig.early : foundationConfig.later;
    }

    return config as PhaseConfig;
  }
}

interface TrainingInputs {
  raceDistance: string;
  raceDate: string;
  currentDate: string;
  timeGoal: string;
  recentRaceTime: string;
  recentRaceDistance: string;
  units: string;
  currentWeeklyVolume: string;
  experienceLevel: string;
}

interface DailyWorkouts {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

interface WeeklyPlan extends DailyWorkouts {
  week: number;
  weekCommencing: string;
  phase: string;
  weeklyVolume: number;
}

interface TrainingPlan {
  plan: WeeklyPlan[];
  phases: Phases;
  actualWeeks: number;
}
const vdotData: VDOTData = {
  raceTimes: {
    30: {
      "5K": "30:40",
      "10K": "63:46",
      "Half Marathon": "2:21:04",
      Marathon: "4:49:17",
    },
    31: {
      "5K": "29:51",
      "10K": "62:03",
      "Half Marathon": "2:17:21",
      Marathon: "4:41:57",
    },
    32: {
      "5K": "29:05",
      "10K": "60:26",
      "Half Marathon": "2:13:49",
      Marathon: "4:34:59",
    },
    33: {
      "5K": "28:21",
      "10K": "58:54",
      "Half Marathon": "2:10:27",
      Marathon: "4:28:22",
    },
    34: {
      "5K": "27:39",
      "10K": "57:26",
      "Half Marathon": "2:07:16",
      Marathon: "4:22:03",
    },
    35: {
      "5K": "27:00",
      "10K": "56:03",
      "Half Marathon": "2:04:13",
      Marathon: "4:16:03",
    },
    36: {
      "5K": "26:22",
      "10K": "54:44",
      "Half Marathon": "2:01:19",
      Marathon: "4:10:19",
    },
    37: {
      "5K": "25:46",
      "10K": "53:29",
      "Half Marathon": "1:58:34",
      Marathon: "4:04:50",
    },
    38: {
      "5K": "25:12",
      "10K": "52:17",
      "Half Marathon": "1:55:55",
      Marathon: "3:59:35",
    },
    39: {
      "5K": "24:39",
      "10K": "51:09",
      "Half Marathon": "1:53:24",
      Marathon: "3:54:34",
    },
    40: {
      "5K": "24:08",
      "10K": "50:03",
      "Half Marathon": "1:50:59",
      Marathon: "3:49:45",
    },
    41: {
      "5K": "23:38",
      "10K": "49:01",
      "Half Marathon": "1:48:40",
      Marathon: "3:45:09",
    },
    42: {
      "5K": "23:09",
      "10K": "48:01",
      "Half Marathon": "1:46:27",
      Marathon: "3:40:43",
    },
    43: {
      "5K": "22:41",
      "10K": "47:04",
      "Half Marathon": "1:44:20",
      Marathon: "3:36:28",
    },
    44: {
      "5K": "22:15",
      "10K": "46:09",
      "Half Marathon": "1:42:17",
      Marathon: "3:32:23",
    },
    45: {
      "5K": "21:50",
      "10K": "45:16",
      "Half Marathon": "1:40:20",
      Marathon: "3:28:26",
    },
    46: {
      "5K": "21:25",
      "10K": "44:25",
      "Half Marathon": "1:38:27",
      Marathon: "3:24:39",
    },
    47: {
      "5K": "21:02",
      "10K": "43:36",
      "Half Marathon": "1:36:38",
      Marathon: "3:21:00",
    },
    48: {
      "5K": "20:39",
      "10K": "42:50",
      "Half Marathon": "1:34:53",
      Marathon: "3:17:29",
    },
    49: {
      "5K": "20:18",
      "10K": "42:04",
      "Half Marathon": "1:33:12",
      Marathon: "3:14:06",
    },
    50: {
      "5K": "19:57",
      "10K": "41:21",
      "Half Marathon": "1:31:35",
      Marathon: "3:10:49",
    },
    51: {
      "5K": "19:36",
      "10K": "40:39",
      "Half Marathon": "1:30:02",
      Marathon: "3:07:39",
    },
    52: {
      "5K": "19:17",
      "10K": "39:59",
      "Half Marathon": "1:28:31",
      Marathon: "3:04:36",
    },
    53: {
      "5K": "18:58",
      "10K": "39:20",
      "Half Marathon": "1:27:04",
      Marathon: "3:01:39",
    },
    54: {
      "5K": "18:40",
      "10K": "38:42",
      "Half Marathon": "1:25:40",
      Marathon: "2:58:47",
    },
    55: {
      "5K": "18:22",
      "10K": "38:06",
      "Half Marathon": "1:24:18",
      Marathon: "2:56:01",
    },
    56: {
      "5K": "18:05",
      "10K": "37:31",
      "Half Marathon": "1:23:00",
      Marathon: "2:53:20",
    },
    57: {
      "5K": "17:49",
      "10K": "36:57",
      "Half Marathon": "1:21:43",
      Marathon: "2:50:45",
    },
    58: {
      "5K": "17:33",
      "10K": "36:24",
      "Half Marathon": "1:20:30",
      Marathon: "2:48:14",
    },
    59: {
      "5K": "17:17",
      "10K": "35:52",
      "Half Marathon": "1:19:18",
      Marathon: "2:45:47",
    },
    60: {
      "5K": "17:03",
      "10K": "35:22",
      "Half Marathon": "1:18:09",
      Marathon: "2:43:25",
    },
    61: {
      "5K": "16:48",
      "10K": "34:52",
      "Half Marathon": "1:17:02",
      Marathon: "2:41:08",
    },
    62: {
      "5K": "16:34",
      "10K": "34:23",
      "Half Marathon": "1:15:57",
      Marathon: "2:38:54",
    },
    63: {
      "5K": "16:20",
      "10K": "33:55",
      "Half Marathon": "1:14:54",
      Marathon: "2:36:44",
    },
    64: {
      "5K": "16:07",
      "10K": "33:28",
      "Half Marathon": "1:13:53",
      Marathon: "2:34:38",
    },
    65: {
      "5K": "15:54",
      "10K": "33:01",
      "Half Marathon": "1:12:53",
      Marathon: "2:32:35",
    },
    66: {
      "5K": "15:42",
      "10K": "32:35",
      "Half Marathon": "1:11:56",
      Marathon: "2:30:36",
    },
    67: {
      "5K": "15:29",
      "10K": "32:11",
      "Half Marathon": "1:11:00",
      Marathon: "2:28:40",
    },
    68: {
      "5K": "15:18",
      "10K": "31:46",
      "Half Marathon": "1:10:05",
      Marathon: "2:26:47",
    },
    69: {
      "5K": "15:06",
      "10K": "31:23",
      "Half Marathon": "1:09:12",
      Marathon: "2:24:57",
    },
    70: {
      "5K": "14:55",
      "10K": "31:00",
      "Half Marathon": "1:08:21",
      Marathon: "2:23:10",
    },
    71: {
      "5K": "14:44",
      "10K": "30:38",
      "Half Marathon": "1:07:31",
      Marathon: "2:21:26",
    },
    72: {
      "5K": "14:33",
      "10K": "30:16",
      "Half Marathon": "1:06:42",
      Marathon: "2:19:44",
    },
    73: {
      "5K": "14:23",
      "10K": "29:55",
      "Half Marathon": "1:05:54",
      Marathon: "2:18:05",
    },
    74: {
      "5K": "14:13",
      "10K": "29:34",
      "Half Marathon": "1:05:08",
      Marathon: "2:16:29",
    },
    75: {
      "5K": "14:03",
      "10K": "29:14",
      "Half Marathon": "1:04:23",
      Marathon: "2:14:55",
    },
    76: {
      "5K": "13:54",
      "10K": "28:55",
      "Half Marathon": "1:03:39",
      Marathon: "2:13:23",
    },
    77: {
      "5K": "13:44",
      "10K": "28:36",
      "Half Marathon": "1:02:56",
      Marathon: "2:11:54",
    },
    78: {
      "5K": "13:35",
      "10K": "28:17",
      "Half Marathon": "1:02:15",
      Marathon: "2:10:27",
    },
    79: {
      "5K": "13:26",
      "10K": "27:59",
      "Half Marathon": "1:01:34",
      Marathon: "2:09:02",
    },
    80: {
      "5K": "13:18",
      "10K": "27:41",
      "Half Marathon": "1:00:54",
      Marathon: "2:07:38",
    },
    81: {
      "5K": "13:09",
      "10K": "27:24",
      "Half Marathon": "1:00:15",
      Marathon: "2:06:17",
    },
    82: {
      "5K": "13:01",
      "10K": "27:07",
      "Half Marathon": "59:38",
      Marathon: "2:04:57",
    },
    83: {
      "5K": "12:53",
      "10K": "26:51",
      "Half Marathon": "59:01",
      Marathon: "2:03:40",
    },
    84: {
      "5K": "12:45",
      "10K": "26:34",
      "Half Marathon": "58:25",
      Marathon: "2:02:24",
    },
    85: {
      "5K": "12:37",
      "10K": "26:19",
      "Half Marathon": "57:50",
      Marathon: "2:01:10",
    },
  },
  paces: {
    30: {
      km: {
        easy: "7:27",
        marathon: "7:03",
        threshold: "6:24",
        interval: "6:22",
        repetition: "6:7",
      },
      mile: {
        easy: "12:00",
        marathon: "11:21",
        threshold: "10:18",
        interval: "10:16",
        repetition: "9:49",
      },
    },
    31: {
      km: {
        easy: "7:16",
        marathon: "6:52",
        threshold: "6:14",
        interval: "6:18",
        repetition: "6:5",
      },
      mile: {
        easy: "11:41",
        marathon: "11:02",
        threshold: "10:02",
        interval: "10:09",
        repetition: "9:47",
      },
    },
    32: {
      km: {
        easy: "7:05",
        marathon: "6:40",
        threshold: "6:05",
        interval: "6:14",
        repetition: "6:3",
      },
      mile: {
        easy: "11:24",
        marathon: "10:44",
        threshold: "9:47",
        interval: "10:02",
        repetition: "9:45",
      },
    },
    33: {
      km: {
        easy: "6:55",
        marathon: "6:30",
        threshold: "5:56",
        interval: "6:11",
        repetition: "6:1",
      },
      mile: {
        easy: "11:07",
        marathon: "10:27",
        threshold: "9:33",
        interval: "9:56",
        repetition: "9:43",
      },
    },
    34: {
      km: {
        easy: "6:45",
        marathon: "6:20",
        threshold: "5:48",
        interval: "6:08",
        repetition: "6:0",
      },
      mile: {
        easy: "10:52",
        marathon: "10:11",
        threshold: "9:20",
        interval: "9:51",
        repetition: "9:41",
      },
    },
    35: {
      km: {
        easy: "6:36",
        marathon: "6:10",
        threshold: "5:40",
        interval: "6:05",
        repetition: "5:8",
      },
      mile: {
        easy: "10:37",
        marathon: "9:56",
        threshold: "9:07",
        interval: "9:45",
        repetition: "8:7",
      },
    },
    36: {
      km: {
        easy: "6:27",
        marathon: "6:01",
        threshold: "5:33",
        interval: "6:02",
        repetition: "5:7",
      },
      mile: {
        easy: "10:23",
        marathon: "9:41",
        threshold: "8:55",
        interval: "9:40",
        repetition: "8:5",
      },
    },
    37: {
      km: {
        easy: "6:19",
        marathon: "5:53",
        threshold: "5:26",
        interval: "5:59",
        repetition: "5:5",
      },
      mile: {
        easy: "10:09",
        marathon: "9:28",
        threshold: "8:44",
        interval: "9:35",
        repetition: "8:3",
      },
    },
    38: {
      km: {
        easy: "6:11",
        marathon: "5:45",
        threshold: "5:19",
        interval: "5:56",
        repetition: "5:4",
      },
      mile: {
        easy: "9:56",
        marathon: "9:15",
        threshold: "8:33",
        interval: "9:30",
        repetition: "8:1",
      },
    },
    39: {
      km: {
        easy: "6:03",
        marathon: "5:37",
        threshold: "5:12",
        interval: "5:54",
        repetition: "5:3",
      },
      mile: {
        easy: "9:44",
        marathon: "9:02",
        threshold: "8:22",
        interval: "9:26",
        repetition: "8:0",
      },
    },
    40: {
      km: {
        easy: "5:56",
        marathon: "5:29",
        threshold: "5:06",
        interval: "5:52",
        repetition: "5:2",
      },
      mile: {
        easy: "9:32",
        marathon: "8:50",
        threshold: "8:12",
        interval: "9:21",
        repetition: "7:8",
      },
    },
    41: {
      km: {
        easy: "5:49",
        marathon: "5:22",
        threshold: "5:00",
        interval: "5:50",
        repetition: "5:1",
      },
      mile: {
        easy: "9:21",
        marathon: "8:39",
        threshold: "8:02",
        interval: "9:17",
        repetition: "7:7",
      },
    },
    42: {
      km: {
        easy: "5:42",
        marathon: "5:16",
        threshold: "4:54",
        interval: "5:48",
        repetition: "5:0",
      },
      mile: {
        easy: "9:10",
        marathon: "8:28",
        threshold: "7:52",
        interval: "9:13",
        repetition: "7:5",
      },
    },
    43: {
      km: {
        easy: "5:35",
        marathon: "5:09",
        threshold: "4:49",
        interval: "5:46",
        repetition: "4:9",
      },
      mile: {
        easy: "9:00",
        marathon: "8:17",
        threshold: "7:42",
        interval: "9:09",
        repetition: "7:4",
      },
    },
    44: {
      km: {
        easy: "5:29",
        marathon: "5:03",
        threshold: "4:43",
        interval: "5:44",
        repetition: "4:8",
      },
      mile: {
        easy: "8:50",
        marathon: "8:07",
        threshold: "7:33",
        interval: "9:05",
        repetition: "7:2",
      },
    },
    45: {
      km: {
        easy: "5:23",
        marathon: "4:57",
        threshold: "4:38",
        interval: "5:42",
        repetition: "4:7",
      },
      mile: {
        easy: "8:40",
        marathon: "7:58",
        threshold: "7:25",
        interval: "9:01",
        repetition: "7:1",
      },
    },
    46: {
      km: {
        easy: "5:17",
        marathon: "4:51",
        threshold: "4:33",
        interval: "5:40",
        repetition: "4:6",
      },
      mile: {
        easy: "8:31",
        marathon: "7:49",
        threshold: "7:17",
        interval: "8:57",
        repetition: "6:9",
      },
    },
    47: {
      km: {
        easy: "5:12",
        marathon: "4:46",
        threshold: "4:29",
        interval: "5:38",
        repetition: "4:5",
      },
      mile: {
        easy: "8:22",
        marathon: "7:40",
        threshold: "7:09",
        interval: "8:53",
        repetition: "6:8",
      },
    },
    48: {
      km: {
        easy: "5:07",
        marathon: "4:41",
        threshold: "4:24",
        interval: "5:36",
        repetition: "4:4",
      },
      mile: {
        easy: "8:13",
        marathon: "7:32",
        threshold: "7:02",
        interval: "8:49",
        repetition: "6:7",
      },
    },
    49: {
      km: {
        easy: "5:01",
        marathon: "4:36",
        threshold: "4:20",
        interval: "5:35",
        repetition: "4:4",
      },
      mile: {
        easy: "8:05",
        marathon: "7:24",
        threshold: "6:56",
        interval: "8:46",
        repetition: "6:6",
      },
    },
    50: {
      km: {
        easy: "4:56",
        marathon: "4:31",
        threshold: "4:15",
        interval: "5:33",
        repetition: "4:3",
      },
      mile: {
        easy: "7:57",
        marathon: "7:17",
        threshold: "6:50",
        interval: "8:42",
        repetition: "6:5",
      },
    },
    51: {
      km: {
        easy: "4:52",
        marathon: "4:27",
        threshold: "4:11",
        interval: "5:32",
        repetition: "4:3",
      },
      mile: {
        easy: "7:49",
        marathon: "7:09",
        threshold: "6:44",
        interval: "8:39",
        repetition: "6:4",
      },
    },
    52: {
      km: {
        easy: "4:47",
        marathon: "4:22",
        threshold: "4:07",
        interval: "5:31",
        repetition: "4:2",
      },
      mile: {
        easy: "7:42",
        marathon: "7:02",
        threshold: "6:38",
        interval: "8:36",
        repetition: "6:4",
      },
    },
    53: {
      km: {
        easy: "4:43",
        marathon: "4:18",
        threshold: "4:04",
        interval: "5:30",
        repetition: "4:2",
      },
      mile: {
        easy: "7:35",
        marathon: "6:56",
        threshold: "6:32",
        interval: "8:33",
        repetition: "6:3",
      },
    },
    54: {
      km: {
        easy: "4:38",
        marathon: "4:14",
        threshold: "4:00",
        interval: "5:28",
        repetition: "4:1",
      },
      mile: {
        easy: "7:28",
        marathon: "6:49",
        threshold: "6:26",
        interval: "8:30",
        repetition: "6:2",
      },
    },
    55: {
      km: {
        easy: "4:34",
        marathon: "4:10",
        threshold: "3:56",
        interval: "5:27",
        repetition: "4:0",
      },
      mile: {
        easy: "7:21",
        marathon: "6:43",
        threshold: "6:20",
        interval: "8:27",
        repetition: "6:1",
      },
    },
    56: {
      km: {
        easy: "4:30",
        marathon: "4:06",
        threshold: "3:53",
        interval: "5:26",
        repetition: "4:0",
      },
      mile: {
        easy: "7:15",
        marathon: "6:37",
        threshold: "6:15",
        interval: "8:24",
        repetition: "6:0",
      },
    },
    57: {
      km: {
        easy: "4:26",
        marathon: "4:03",
        threshold: "3:50",
        interval: "5:25",
        repetition: "3:9",
      },
      mile: {
        easy: "7:08",
        marathon: "6:31",
        threshold: "6:09",
        interval: "8:21",
        repetition: "5:9",
      },
    },
    58: {
      km: {
        easy: "4:22",
        marathon: "3:59",
        threshold: "3:46",
        interval: "5:23",
        repetition: "3:8",
      },
      mile: {
        easy: "7:02",
        marathon: "6:25",
        threshold: "6:04",
        interval: "8:18",
        repetition: "5:8",
      },
    },
    59: {
      km: {
        easy: "4:19",
        marathon: "3:56",
        threshold: "3:43",
        interval: "5:22",
        repetition: "3:8",
      },
      mile: {
        easy: "6:56",
        marathon: "6:19",
        threshold: "5:59",
        interval: "8:15",
        repetition: "5:7",
      },
    },
    60: {
      km: {
        easy: "4:15",
        marathon: "3:52",
        threshold: "3:40",
        interval: "5:21",
        repetition: "3:7",
      },
      mile: {
        easy: "6:50",
        marathon: "6:14",
        threshold: "5:54",
        interval: "8:12",
        repetition: "5:6",
      },
    },
    61: {
      km: {
        easy: "4:11",
        marathon: "3:49",
        threshold: "3:37",
        interval: "5:20",
        repetition: "3:7",
      },
      mile: {
        easy: "6:45",
        marathon: "6:09",
        threshold: "5:50",
        interval: "8:09",
        repetition: "5:5",
      },
    },
    62: {
      km: {
        easy: "4:08",
        marathon: "3:46",
        threshold: "3:34",
        interval: "5:19",
        repetition: "3:6",
      },
      mile: {
        easy: "6:39",
        marathon: "6:04",
        threshold: "5:45",
        interval: "8:06",
        repetition: "5:4",
      },
    },
    63: {
      km: {
        easy: "4:05",
        marathon: "3:43",
        threshold: "3:32",
        interval: "5:18",
        repetition: "5:3",
      },
      mile: {
        easy: "6:34",
        marathon: "5:59",
        threshold: "5:41",
        interval: "8:03",
        repetition: "8:1",
      },
    },
    64: {
      km: {
        easy: "4:02",
        marathon: "3:40",
        threshold: "3:29",
        interval: "5:17",
        repetition: "3:5",
      },
      mile: {
        easy: "6:29",
        marathon: "5:54",
        threshold: "5:36",
        interval: "8:00",
        repetition: "5:2",
      },
    },
    65: {
      km: {
        easy: "3:59",
        marathon: "3:37",
        threshold: "3:26",
        interval: "5:16",
        repetition: "3:5",
      },
      mile: {
        easy: "6:24",
        marathon: "5:49",
        threshold: "5:32",
        interval: "7:57",
        repetition: "5:2",
      },
    },
    66: {
      km: {
        easy: "3:56",
        marathon: "3:34",
        threshold: "3:24",
        interval: "5:15",
        repetition: "3:4",
      },
      mile: {
        easy: "6:19",
        marathon: "5:45",
        threshold: "5:28",
        interval: "7:54",
        repetition: "5:1",
      },
    },
    67: {
      km: {
        easy: "3:53",
        marathon: "3:31",
        threshold: "3:21",
        interval: "5:14",
        repetition: "3:4",
      },
      mile: {
        easy: "6:15",
        marathon: "5:40",
        threshold: "5:24",
        interval: "7:51",
        repetition: "5:1",
      },
    },
    68: {
      km: {
        easy: "3:50",
        marathon: "3:29",
        threshold: "3:19",
        interval: "5:13",
        repetition: "3:3",
      },
      mile: {
        easy: "6:10",
        marathon: "5:36",
        threshold: "5:20",
        interval: "7:48",
        repetition: "5:0",
      },
    },
    69: {
      km: {
        easy: "3:47",
        marathon: "3:26",
        threshold: "3:16",
        interval: "5:12",
        repetition: "3:3",
      },
      mile: {
        easy: "6:06",
        marathon: "5:32",
        threshold: "5:16",
        interval: "7:45",
        repetition: "4:9",
      },
    },
    70: {
      km: {
        easy: "3:44",
        marathon: "3:24",
        threshold: "3:14",
        interval: "5:11",
        repetition: "3:2",
      },
      mile: {
        easy: "6:01",
        marathon: "5:28",
        threshold: "5:13",
        interval: "7:42",
        repetition: "4:8",
      },
    },
    71: {
      km: {
        easy: "3:42",
        marathon: "3:21",
        threshold: "3:12",
        interval: "5:10",
        repetition: "3:2",
      },
      mile: {
        easy: "5:57",
        marathon: "5:24",
        threshold: "5:09",
        interval: "7:39",
        repetition: "4:8",
      },
    },
    72: {
      km: {
        easy: "3:40",
        marathon: "3:19",
        threshold: "3:10",
        interval: "5:09",
        repetition: "3:1",
      },
      mile: {
        easy: "5:53",
        marathon: "5:20",
        threshold: "5:05",
        interval: "7:36",
        repetition: "4:7",
      },
    },
    73: {
      km: {
        easy: "3:37",
        marathon: "3:16",
        threshold: "3:08",
        interval: "5:09",
        repetition: "3:1",
      },
      mile: {
        easy: "5:49",
        marathon: "5:16",
        threshold: "5:02",
        interval: "7:34",
        repetition: "4:7",
      },
    },
    74: {
      km: {
        easy: "3:34",
        marathon: "3:14",
        threshold: "3:06",
        interval: "5:08",
        repetition: "3:1",
      },
      mile: {
        easy: "5:45",
        marathon: "5:12",
        threshold: "4:59",
        interval: "7:31",
        repetition: "4:6",
      },
    },
    75: {
      km: {
        easy: "3:32",
        marathon: "3:12",
        threshold: "3:04",
        interval: "5:07",
        repetition: "3:0",
      },
      mile: {
        easy: "5:41",
        marathon: "5:09",
        threshold: "4:56",
        interval: "7:28",
        repetition: "4:6",
      },
    },
    76: {
      km: {
        easy: "3:30",
        marathon: "3:10",
        threshold: "3:02",
        interval: "5:06",
        repetition: "3:0",
      },
      mile: {
        easy: "5:38",
        marathon: "5:05",
        threshold: "4:52",
        interval: "7:25",
        repetition: "4:5",
      },
    },
    77: {
      km: {
        easy: "3:28",
        marathon: "3:08",
        threshold: "3:00",
        interval: "5:05",
        repetition: "2:9",
      },
      mile: {
        easy: "5:34",
        marathon: "5:02",
        threshold: "4:49",
        interval: "7:22",
        repetition: "4:5",
      },
    },
    78: {
      km: {
        easy: "3:25",
        marathon: "3:06",
        threshold: "2:58",
        interval: "5:04",
        repetition: "2:9",
      },
      mile: {
        easy: "5:30",
        marathon: "4:58",
        threshold: "4:46",
        interval: "7:19",
        repetition: "4:4",
      },
    },
    79: {
      km: {
        easy: "3:23",
        marathon: "3:03",
        threshold: "2:56",
        interval: "5:04",
        repetition: "2:9",
      },
      mile: {
        easy: "5:27",
        marathon: "4:55",
        threshold: "4:43",
        interval: "7:17",
        repetition: "4:4",
      },
    },
    80: {
      km: {
        easy: "3:21",
        marathon: "3:01",
        threshold: "2:54",
        interval: "5:03",
        repetition: "2:9",
      },
      mile: {
        easy: "5:24",
        marathon: "4:52",
        threshold: "4:41",
        interval: "7:14",
        repetition: "4:3",
      },
    },
    81: {
      km: {
        easy: "3:19",
        marathon: "3:00",
        threshold: "2:53",
        interval: "5:02",
        repetition: "2:8",
      },
      mile: {
        easy: "5:20",
        marathon: "4:49",
        threshold: "4:38",
        interval: "7:11",
        repetition: "4:3",
      },
    },
    82: {
      km: {
        easy: "3:17",
        marathon: "2:58",
        threshold: "2:51",
        interval: "5:01",
        repetition: "2:8",
      },
      mile: {
        easy: "5:17",
        marathon: "4:46",
        threshold: "4:35",
        interval: "7:08",
        repetition: "4:2",
      },
    },
    83: {
      km: {
        easy: "3:15",
        marathon: "2:56",
        threshold: "2:49",
        interval: "5:01",
        repetition: "2:8",
      },
      mile: {
        easy: "5:14",
        marathon: "4:43",
        threshold: "4:32",
        interval: "7:05",
        repetition: "4:2",
      },
    },
    84: {
      km: {
        easy: "3:13",
        marathon: "2:54",
        threshold: "2:48",
        interval: "5:00",
        repetition: "2:7",
      },
      mile: {
        easy: "5:11",
        marathon: "4:40",
        threshold: "4:30",
        interval: "7:02",
        repetition: "4:1",
      },
    },
    85: {
      km: {
        easy: "3:11",
        marathon: "2:52",
        threshold: "2:46",
        interval: "4:59",
        repetition: "2:7",
      },
      mile: {
        easy: "5:08",
        marathon: "4:37",
        threshold: "4:27",
        interval: "6:59",
        repetition: "4:1",
      },
    },
  },
};

const raceDistances: {
  [key: string]: { distance: number; weeks: number; minWeeks: number };
} = {
  "5K": { distance: 5, weeks: 18, minWeeks: 12 },
  "10K": { distance: 10, weeks: 20, minWeeks: 14 },
  "Half Marathon": { distance: 21.1, weeks: 22, minWeeks: 16 },
  Marathon: { distance: 42.2, weeks: 24, minWeeks: 18 },
};

type InputKey = keyof TrainingInputs;

interface FormFieldConfig {
  key: InputKey;
  label: string;
  type: "select" | "text" | "date" | "number";
  placeholder?: string;
  options?: { value: string; label: string }[];
}

const formFields: FormFieldConfig[] = [
  {
    key: "raceDistance",
    label: "Race Distance *",
    type: "select",
    options: Object.keys(raceDistances).map((d) => ({ value: d, label: d })),
  },
  {
    key: "raceDate",
    label: "Race Date *",
    type: "date",
  },
  {
    key: "timeGoal",
    label: "Time Goal *",
    type: "text",
    placeholder: "e.g., 45:00 or 1:30:00",
  },
  {
    key: "recentRaceTime",
    label: "Recent Race Time",
    type: "text",
    placeholder: "e.g., 22:30",
  },
  {
    key: "recentRaceDistance",
    label: "Recent Race Distance",
    type: "select",
    options: Object.keys(raceDistances).map((d) => ({ value: d, label: d })),
  },
  {
    key: "experienceLevel",
    label: "Experience Level",
    type: "select",
    options: [
      { value: "beginner", label: "Beginner (0-2 years)" },
      { value: "intermediate", label: "Intermediate (2-5 years)" },
      { value: "advanced", label: "Advanced (5+ years)" },
    ],
  },
  {
    key: "currentWeeklyVolume",
    label: "Current Weekly Volume",
    type: "number",
    placeholder: "km/miles per week",
  },
  {
    key: "units",
    label: "Units",
    type: "select",
    options: [
      { value: "metric", label: "Metric (km)" },
      { value: "imperial", label: "Imperial (miles)" },
    ],
  },
  {
    key: "currentDate",
    label: "Current Date",
    type: "date",
  },
];

const FormField = ({
  field,
  value,
  onChange,
}: {
  field: FormFieldConfig;
  value: string;
  onChange: (key: InputKey, value: string) => void;
}) => {
  const baseClasses =
    "w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
      </label>
      {field.type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={baseClasses}
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.type}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={baseClasses}
        />
      )}
    </div>
  );
};

const TrainingPlanGenerator = () => {


  const [inputs, setInputs] = useState<TrainingInputs>({
    raceDistance: "10K",
    raceDate: "",
    currentDate: new Date().toISOString().split("T")[0],
    timeGoal: "",
    recentRaceTime: "",
    recentRaceDistance: "5K",
    units: "metric",
    currentWeeklyVolume: "",
    experienceLevel: "intermediate",
  });

  const [showPlan, setShowPlan] = useState<boolean>(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [importError, setImportError] = useState<string>("");
  const [importSuccess, setImportSuccess] = useState<string>("");


  // Accurate VDOT table based on Jack Daniels' data
  // Jack Daniels' actual VDOT pace table (minutes:seconds per km and mile)


  const timeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(":").map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1]; // MM:SS
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
    return 0;
  };

  const estimateVDOT = useCallback(
    (
      raceTime: string,
      raceDistance: RaceDistance,
      raceTimes: VDOTRaceTimes
    ): number => {
      const timeInSeconds = timeToSeconds(raceTime);
      let closestVDOT = 40;
      let minDiff = Infinity;

      for (let vdot = 30; vdot <= 85; vdot++) {
        if (raceTimes[vdot] && raceTimes[vdot][raceDistance]) {
          const tableTimeSeconds = timeToSeconds(raceTimes[vdot][raceDistance]);
          const diff = Math.abs(tableTimeSeconds - timeInSeconds);

          if (diff < minDiff) {
            minDiff = diff;
            closestVDOT = vdot;
          }
        }
      }

      return closestVDOT;
    },
    []
  );

  // Get exact training paces from VDOT table
  const getPacesFromVDOT = (
    vdot: number,
    unitsInput: string,
    paceData: VDOTPaces
  ): { [P in PaceType]: string } => {
    // Convert units input to expected format
    const units: Units = unitsInput === "metric" ? "km" : "mile";
    
    const paces = paceData[vdot];

    if (!paces) {
      // Interpolation logic for missing VDOT values
      const lowerVdot = Math.floor(vdot);
      const upperVdot = Math.ceil(vdot);

      if (
        lowerVdot === upperVdot ||
        !paceData[lowerVdot] ||
        !paceData[upperVdot]
      ) {
        // Fallback to closest available VDOT
        for (let v = vdot; v >= 30; v--) {
          if (paceData[v]) return paceData[v][units];
        }
        return paceData[40][units]; // ultimate fallback
      }

      return paceData[lowerVdot][units];
    }

    return paces[units];
  };

  const validateInputs = (): string[] => {
    const newWarnings: string[] = [];

    if (
      !inputs.raceDate ||
      !inputs.timeGoal ||
      (!inputs.recentRaceTime && !inputs.currentWeeklyVolume)
    ) {
      return ["Please fill in all required fields"];
    }

    const currentDate = new Date(inputs.currentDate);
    const raceDate = new Date(inputs.raceDate);
    const weeksDiff = Math.ceil(
      (raceDate.getTime() - currentDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    const minWeeks = raceDistances[inputs.raceDistance].minWeeks;

    if (weeksDiff < minWeeks) {
      newWarnings.push(
        `Insufficient training time. Daniels recommends at least ${minWeeks} weeks for ${inputs.raceDistance}.`
      );
    }

    // Check if goal is realistic based on recent race
    if (inputs.recentRaceTime) {
      const currentVDOT = estimateVDOT(
        inputs.recentRaceTime,
        inputs.recentRaceDistance as RaceDistance,
        vdotData.raceTimes
      );
      const goalVDOT = estimateVDOT(
        inputs.timeGoal,
        inputs.raceDistance as RaceDistance,
        vdotData.raceTimes
      );

      if (goalVDOT > currentVDOT + 3) {
        newWarnings.push(
          `Goal time may be too ambitious. Current VDOT: ${currentVDOT}, Goal requires VDOT: ${goalVDOT}`
        );
      }
    }

    return newWarnings;
  };

  const calculatePhaseWeeks = (totalWeeks: number): Phases => {
    // Using Daniels' priority system approach
    // Phase I gets priority weeks 1,2,3 minimum
    // Phase IV gets at least 3 weeks for taper
    // Remaining weeks split between Phase II (reps) and Phase III (intervals)

    if (totalWeeks <= 12) {
      return { phase1: 3, phase2: 2, phase3: 4, phase4: 3 };
    } else if (totalWeeks <= 18) {
      return { phase1: 6, phase2: 3, phase3: 6, phase4: 3 };
    } else {
      return {
        phase1: 6,
        phase2: 6,
        phase3: 6,
        phase4: Math.min(6, totalWeeks - 18),
      };
    }
  };

  const generateTrainingPlan = useCallback((): TrainingPlan => {
    const raceInfo = RACE_DISTANCES[inputs.raceDistance as RaceDistance];
    const currentDate = new Date(inputs.currentDate);
    const raceDate = new Date(inputs.raceDate);

    const weeksDiff = Math.ceil(
      (raceDate.getTime() - currentDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    const actualWeeks = Math.min(weeksDiff, raceInfo.weeks);
    const phases = calculatePhaseWeeks(actualWeeks);

    const plan: WeeklyPlan[] = [];
    const currentWeek = new Date(currentDate);
    let weeksSinceIncrease = 0;
    let currentVolume = inputs.currentWeeklyVolume
      ? parseInt(inputs.currentWeeklyVolume)
      : getInitialVolume(inputs.experienceLevel, inputs.raceDistance);

    for (let week = 0; week < actualWeeks; week++) {
      const weekCommencing = new Date(currentWeek);
      const weeklyPlan = generateWeeklyPlan(
        week,
        phases,
        currentVolume,
        inputs.raceDistance as RaceDistance,
        inputs.units
      );

      // Apply Daniels' mileage progression rules
      weeksSinceIncrease++;
      if (
        weeksSinceIncrease >= 3 &&
        week < actualWeeks - phases.phase4 &&
        currentVolume < getMaxVolume(inputs.experienceLevel)
      ) {
        currentVolume = Math.min(
          currentVolume + 10,
          getMaxVolume(inputs.experienceLevel)
        ); // Max 10 mile increase every 3rd week
        weeksSinceIncrease = 0;
      }

      plan.push({
        week: week + 1,
        weekCommencing: weekCommencing.toLocaleDateString(),
        phase: getPhaseName(week, phases),
        weeklyVolume: currentVolume,
        ...weeklyPlan,
      });

      currentWeek.setDate(currentWeek.getDate() + 7);
    }

    return { plan, phases, actualWeeks };
  }, [inputs]);

  const getInitialVolume = (experienceLevel: string, raceDistance: string): number => {
    const baseVolumes: { [key: string]: { [key: string]: number } } = {
      beginner: { "5K": 20, "10K": 25, "Half Marathon": 30, Marathon: 35 },
      intermediate: { "5K": 30, "10K": 40, "Half Marathon": 50, Marathon: 60 },
      advanced: { "5K": 40, "10K": 55, "Half Marathon": 70, Marathon: 85 },
    };

    return baseVolumes[experienceLevel]?.[raceDistance] || 40;
  };

  const getMaxVolume = (experienceLevel: string): number => {
    const maxVolumes: { [key: string]: number } = {
      beginner: 50,
      intermediate: 80,
      advanced: 120,
    };

    return maxVolumes[experienceLevel] || 60;
  };

  const generateWeeklyPlan = (
  weekNum: number,
    phases: Phases,
  weeklyVolume: number,
  raceDistance: RaceDistance,
  units: string
): DailyWorkouts => {
    const workoutBuilder = new WorkoutBuilder(units);
    const phaseConfig = PhaseManager.getPhaseConfig(weekNum, phases);

    // Apply volume reduction for final phase
    let adjustedVolume = weeklyVolume;
    if (phaseConfig.volumeReduction) {
      adjustedVolume = Math.round(weeklyVolume * phaseConfig.volumeReduction);
    }

    // Build daily workouts
  const weekPlan: DailyWorkouts = {
    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
    sunday: "",
  };

  const days: Array<keyof DailyWorkouts> = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    days.forEach((day) => {
      const workoutDef = phaseConfig.workouts[day];
      weekPlan[day] = workoutBuilder.buildWorkout(
        workoutDef,
        adjustedVolume,
        raceDistance,
        weekNum
      );
    });

    return weekPlan;
  };

  const getPhaseName = (weekNum: number, phases: Phases): string => {
    const phaseType = PhaseManager.determinePhase(weekNum, phases);
    return WORKOUT_CONFIG.phases[
      phaseType as keyof typeof WORKOUT_CONFIG.phases
    ].name;
  };

  const handleInputChange = (field: InputKey, value: string): void => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = (): void => {
    const validationWarnings = validateInputs();
    setWarnings(validationWarnings);

    if (
      validationWarnings.length === 0 ||
      validationWarnings.every((w) => !w.includes("required fields"))
    ) {
      setShowPlan(true);
    }
  };

  // Export function
  const exportPlan = (): void => {
    const metadata = {
      planName: `${inputs.raceDistance} Training Plan`,
      raceDate: inputs.raceDate,
      goalTime: inputs.timeGoal,
      currentVDOT: vdot,
      totalWeeks: trainingData?.actualWeeks || 0,
      experienceLevel: inputs.experienceLevel,
    };

    const exportObject = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      metadata: metadata,
      inputs: inputs,
      generatedPlan: trainingData,
      vdot: vdot,
      paces: paces,
      warnings: warnings,
    };

    const dataStr = JSON.stringify(exportObject, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `daniels-${inputs.raceDistance
      .replace(" ", "-")
      .toLowerCase()}-${inputs.timeGoal.replace(":", "")}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import function
  const importPlan = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') return;
        
        const importedData = JSON.parse(result);

        if (!importedData.inputs || !importedData.version) {
          throw new Error("Invalid file format");
        }

        setInputs(importedData.inputs);

        if (importedData.generatedPlan) {
          setShowPlan(true);
          setWarnings(importedData.warnings || []);
        }

        setImportError("");
        setImportSuccess(
          `Successfully imported ${
            importedData.metadata?.planName || "training plan"
          }`
        );

        // Clear success message after 3 seconds
        setTimeout(() => setImportSuccess(""), 3000);

        event.target.value = "";
      } catch (error) {
        setImportError(
          `Failed to import plan: Invalid file format or corrupted data. ${error}`
        );
        setImportSuccess("");
      }
    };

    reader.readAsText(file);
  };

  const trainingData = useMemo(() => {
    if (!showPlan) return null;
    return generateTrainingPlan();
  }, [showPlan, generateTrainingPlan]);

  const vdot = useMemo(() => {
    if (inputs.recentRaceTime && inputs.recentRaceDistance) {
      return estimateVDOT(
        inputs.recentRaceTime,
        inputs.recentRaceDistance as RaceDistance,
        vdotData.raceTimes
      );
    }
    return 40;
  }, [inputs.recentRaceTime, inputs.recentRaceDistance, estimateVDOT]);
  
  const paces = useMemo(() => {
    return getPacesFromVDOT(vdot, inputs.units, vdotData.paces);
  }, [vdot, inputs.units]);

  const getPhaseColor = (phase: string): string => {
    if (phase.includes("Phase I")) return "bg-blue-100 text-blue-800";
    if (phase.includes("Phase II")) return "bg-green-100 text-green-800";
    if (phase.includes("Phase III")) return "bg-orange-100 text-orange-800";
    if (phase.includes("Phase IV")) return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Jack Daniels Training Plan Generator
        </h1>
        <p className="text-gray-600">
          Create a scientifically-based training plan using Daniels' Running
          Formula methodology
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Training Plan Inputs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {formFields.map((field) => (
            <FormField
              key={field.key}
              field={field}
              value={inputs[field.key]}
              onChange={handleInputChange}
            />
          ))}
        </div>

        {warnings.length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800">Warnings:</h4>
                <ul className="text-sm text-yellow-700 mt-1">
                  {warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {importError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800">Import Error:</h4>
                <p className="text-sm text-red-700 mt-1">{importError}</p>
              </div>
            </div>
          </div>
        )}

        {importSuccess && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0">
                ✓
              </div>
              <div>
                <h4 className="font-medium text-green-800">
                  Import Successful:
                </h4>
                <p className="text-sm text-green-700 mt-1">{importSuccess}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-6">
          <button
            onClick={handleGenerate}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Generate Training Plan
          </button>

          {/* Export Button */}
          {showPlan && (
            <button
              onClick={exportPlan}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Plan
            </button>
          )}

          {/* Import Button */}
          <label className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            Import Plan
            <input
              type="file"
              accept=".json"
              onChange={importPlan}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Training Plan Output */}
      {showPlan && trainingData && (
        <div className="space-y-8">
          {/* Section 1: Training Phases & Overview */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Section 1: Daniels' 4-Phase Training System
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Phase Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Phase I (Foundation):</span>
                    <span>{trainingData.phases.phase1} weeks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">
                      Phase II (Early Quality):
                    </span>
                    <span>{trainingData.phases.phase2} weeks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">
                      Phase III (Transition Quality):
                    </span>
                    <span>{trainingData.phases.phase3} weeks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">
                      Phase IV (Final Quality):
                    </span>
                    <span>{trainingData.phases.phase4} weeks</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total Weeks:</span>
                      <span>{trainingData.actualWeeks} weeks</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Current VDOT</h3>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{vdot}</div>
                  <div className="text-sm text-gray-600">
                    Based on recent race
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Daniels' Phase Focuses
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-blue-800">Phase I:</span>
                    <span className="text-gray-600 ml-2">
                      Foundation & injury prevention
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-green-800">
                      Phase II:
                    </span>
                    <span className="text-gray-600 ml-2">
                      Repetitions (mechanics & speed)
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-orange-800">
                      Phase III:
                    </span>
                    <span className="text-gray-600 ml-2">
                      Intervals (VO₂ max development)
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-purple-800">
                      Phase IV:
                    </span>
                    <span className="text-gray-600 ml-2">
                      Threshold & race preparation
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">
                Key Daniels' Principles Applied
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>
                  • Maximum 10-mile weekly volume increases every 3rd week only
                </li>
                <li>
                  • Repetitions (Phase II) precede intervals (Phase III) for
                  proper progression
                </li>
                <li>
                  • Long runs capped at 25% of weekly volume (Daniels' rule)
                </li>
                <li>
                  • Phase sequence: Foundation → Early Quality → Transition
                  Quality → Final Quality
                </li>
                <li>
                  • No automatic recovery weeks - progression based on
                  adaptation
                </li>
              </ul>
            </div>
          </div>

          {/* Section 2: Training Plan Table */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Section 2: Weekly Training Plan
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2 text-left">
                      Week
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      W/C
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Phase
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Volume
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Monday
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Tuesday
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Wednesday
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Thursday
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Friday
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Saturday
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Sunday
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {trainingData.plan.map((week, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-2 font-medium">
                        {week.week}
                      </td>
                      <td className="border border-gray-300 p-2 text-sm">
                        {week.weekCommencing}
                      </td>
                      <td className="border border-gray-300 p-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPhaseColor(
                            week.phase
                          )}`}
                        >
                          {week.phase.split(" ")[0] +
                            " " +
                            week.phase.split(" ")[1]}
                        </span>
                      </td>
                      <td className="border border-gray-300 p-2 text-sm">
                        {week.weeklyVolume}
                        {inputs.units === "metric" ? "km" : "mi"}
                      </td>
                      <td className="border border-gray-300 p-2 text-sm">
                        {week.monday}
                      </td>
                      <td className="border border-gray-300 p-2 text-sm">
                        {week.tuesday}
                      </td>
                      <td className="border border-gray-300 p-2 text-sm">
                        {week.wednesday}
                      </td>
                      <td className="border border-gray-300 p-2 text-sm">
                        {week.thursday}
                      </td>
                      <td className="border border-gray-300 p-2 text-sm">
                        {week.friday}
                      </td>
                      <td className="border border-gray-300 p-2 text-sm">
                        {week.saturday}
                      </td>
                      <td className="border border-gray-300 p-2 text-sm">
                        {week.sunday}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Legend */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Section 3: Daniels' Training Legend & Pace Guide
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Workout Abbreviations
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>E</strong> - Easy runs (aerobic base building)
                  </div>
                  <div>
                    <strong>L</strong> - Long runs (max 25% of weekly volume)
                  </div>
                  <div>
                    <strong>M</strong> - Marathon pace runs
                  </div>
                  <div>
                    <strong>T</strong> - Threshold/Tempo runs (comfortably hard)
                  </div>
                  <div>
                    <strong>I</strong> - Interval training (VO₂ max development)
                  </div>
                  <div>
                    <strong>R</strong> - Repetition training (neuromuscular
                    power)
                  </div>
                  <div>
                    <strong>ST</strong> - Strides (20-40 seconds at mile pace)
                  </div>
                  <div>
                    <strong>Rest</strong> - Complete rest day
                  </div>
                  <div>
                    <strong>(200jog)</strong> - 200m recovery jog between reps
                  </div>
                  <div>
                    <strong>(2:30r)</strong> - 2:30 recovery between intervals
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Training Paces (per{" "}
                  {inputs.units === "metric" ? "km" : "mile"})
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>
                      <strong>Easy (E):</strong>
                    </span>
                    <span>{paces.easy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      <strong>Marathon (M):</strong>
                    </span>
                    <span>{paces.marathon}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      <strong>Threshold (T):</strong>
                    </span>
                    <span>{paces.threshold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      <strong>Interval (I):</strong>
                    </span>
                    <span>{paces.interval}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      <strong>Repetition (R):</strong>
                    </span>
                    <span>{paces.repetition}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Daniels' Training Guidelines
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • Easy runs should feel comfortable and conversational
                  </li>
                  <li>• Threshold runs should feel "comfortably hard"</li>
                  <li>• Interval quality limited to 8% of weekly volume</li>
                  <li>• Mileage increases: max 10 miles every 3rd week only</li>
                  <li>• Long runs never exceed 25% of weekly volume</li>
                  <li>• Repetitions prepare muscles for interval training</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">
                  Phase-Specific Focus
                </h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>
                    • <strong>Phase I:</strong> Easy running + strides (weeks
                    4+)
                  </li>
                  <li>
                    • <strong>Phase II:</strong> 200s/400s at R pace for
                    mechanics
                  </li>
                  <li>
                    • <strong>Phase III:</strong> Longer intervals (800s-1600s)
                    at I pace
                  </li>
                  <li>
                    • <strong>Phase IV:</strong> Threshold emphasis + race
                    preparation
                  </li>
                  <li>• Progression: Foundation → Reps → Intervals → Racing</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">
                Workout Examples
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div>
                    <strong>8x200R (200jog)</strong> - 8 × 200m at R pace, 200m
                    jog recovery
                  </div>
                  <div>
                    <strong>5x1000I (3:00r)</strong> - 5 × 1000m at I pace, 3min
                    recovery
                  </div>
                  <div>
                    <strong>T 8km</strong> - 8km continuous at Threshold pace
                  </div>
                </div>
                <div>
                  <div>
                    <strong>6ST</strong> - 6 strides (20-40sec at mile pace)
                  </div>
                  <div>
                    <strong>L 16km</strong> - Long run of 16km at Easy pace
                  </div>
                  <div>
                    <strong>E 8km + 6ST</strong> - Easy run plus strides
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This plan follows Jack Daniels'
                  original 4-phase system. Volume increases strictly follow his
                  "every 3rd week, max 10 miles" rule. Long runs are capped at
                  25% of weekly volume as specified in Daniels' Running Formula.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingPlanGenerator;
