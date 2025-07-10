import React, { useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Download,
  Clock,
  Target,
  Activity,
  MapPin,
  Calendar,
  FileText,
} from "lucide-react";

// Type definitions
interface RaceTime {
  distance: string;
  time: string;
}

interface UserProfile {
  experienceLevel: string;
  weeklyMileage: number;
  recentRace?: RaceTime;
  planLevel: string;
  trainingDays: boolean[];
  sessionDuration: number;
  goalRace: string;
  altitude: number;
  fitnessScore: number;
}

interface TrainingPaces {
  easyRecovery: string;
  easyAerobic: string;
  marathon: string;
  tempo: {
    per400m: string;
    perKm: string;
    perMile: string;
  };
  interval: {
    per400m: string;
    per800m: string;
    per1200m: string;
  };
  repetition: {
    per200m: string;
    per300m: string;
    per400m: string;
  };
}

interface PhaseStructure {
  phaseNumber: number;
  duration: number;
  focus: string;
  description: string;
  targetMileage: number;
  qualitySessions: number;
}

interface TrainingPlan {
  metadata: {
    planLevel: string;
    fitnessScore: number;
    generatedDate: string;
  };
  paces: TrainingPaces;
  phases: PhaseStructure[];
  altitudeAdjusted: boolean;
}

// Embedded fitness score tables
const RACE_TO_FITNESS_TABLE: Record<string, Record<string, number>> = {
  "1500m": {
    "4:00": 85,
    "4:15": 82,
    "4:30": 79,
    "4:45": 76,
    "5:00": 73,
    "5:15": 70,
    "5:30": 67,
    "5:45": 64,
    "6:00": 61,
    "6:30": 55,
    "7:00": 50,
    "7:30": 46,
    "8:00": 42,
    "8:30": 39,
    "9:00": 36,
  },
  mile: {
    "4:20": 85,
    "4:35": 82,
    "4:50": 79,
    "5:05": 76,
    "5:20": 73,
    "5:35": 70,
    "5:50": 67,
    "6:05": 64,
    "6:20": 61,
    "6:50": 55,
    "7:20": 50,
    "7:50": 46,
    "8:20": 42,
    "8:50": 39,
    "9:20": 36,
  },
  "5k": {
    "15:00": 85,
    "16:00": 82,
    "17:00": 79,
    "18:00": 76,
    "19:00": 73,
    "20:00": 70,
    "21:00": 67,
    "22:00": 64,
    "23:00": 61,
    "25:00": 55,
    "27:00": 50,
    "29:00": 46,
    "31:00": 42,
    "33:00": 39,
    "35:00": 36,
  },
  "10k": {
    "31:00": 85,
    "33:00": 82,
    "35:00": 79,
    "37:00": 76,
    "39:00": 73,
    "41:00": 70,
    "43:00": 67,
    "45:00": 64,
    "47:00": 61,
    "51:00": 55,
    "55:00": 50,
    "59:00": 46,
    "63:00": 42,
    "67:00": 39,
    "71:00": 36,
  },
  half: {
    "1:08:00": 85,
    "1:12:00": 82,
    "1:16:00": 79,
    "1:20:00": 76,
    "1:24:00": 73,
    "1:28:00": 70,
    "1:32:00": 67,
    "1:36:00": 64,
    "1:40:00": 61,
    "1:48:00": 55,
    "1:56:00": 50,
    "2:04:00": 46,
    "2:12:00": 42,
    "2:20:00": 39,
    "2:28:00": 36,
  },
  marathon: {
    "2:25:00": 85,
    "2:35:00": 82,
    "2:45:00": 79,
    "2:55:00": 76,
    "3:05:00": 73,
    "3:15:00": 70,
    "3:25:00": 67,
    "3:35:00": 64,
    "3:45:00": 61,
    "4:05:00": 55,
    "4:25:00": 50,
    "4:45:00": 46,
    "5:05:00": 42,
    "5:25:00": 39,
    "5:45:00": 36,
  },
};

const FITNESS_TO_PACES_TABLE: Record<number, TrainingPaces> = {
  85: {
    easyRecovery: "6:00-6:30",
    easyAerobic: "5:30-6:00",
    marathon: "5:30",
    tempo: { per400m: "1:18", perKm: "3:15", perMile: "5:15" },
    interval: { per400m: "1:10", per800m: "2:22", per1200m: "3:35" },
    repetition: { per200m: "0:33", per300m: "0:50", per400m: "1:07" },
  },
  82: {
    easyRecovery: "6:15-6:45",
    easyAerobic: "5:45-6:15",
    marathon: "5:45",
    tempo: { per400m: "1:22", perKm: "3:25", perMile: "5:30" },
    interval: { per400m: "1:14", per800m: "2:30", per1200m: "3:47" },
    repetition: { per200m: "0:35", per300m: "0:53", per400m: "1:11" },
  },
  79: {
    easyRecovery: "6:30-7:00",
    easyAerobic: "6:00-6:30",
    marathon: "6:00",
    tempo: { per400m: "1:26", perKm: "3:35", perMile: "5:45" },
    interval: { per400m: "1:18", per800m: "2:38", per1200m: "3:59" },
    repetition: { per200m: "0:37", per300m: "0:56", per400m: "1:15" },
  },
  76: {
    easyRecovery: "6:45-7:15",
    easyAerobic: "6:15-6:45",
    marathon: "6:15",
    tempo: { per400m: "1:30", perKm: "3:45", perMile: "6:00" },
    interval: { per400m: "1:22", per800m: "2:46", per1200m: "4:11" },
    repetition: { per200m: "0:39", per300m: "0:59", per400m: "1:19" },
  },
  73: {
    easyRecovery: "7:00-7:30",
    easyAerobic: "6:30-7:00",
    marathon: "6:30",
    tempo: { per400m: "1:34", perKm: "3:55", perMile: "6:15" },
    interval: { per400m: "1:26", per800m: "2:54", per1200m: "4:23" },
    repetition: { per200m: "0:41", per300m: "1:02", per400m: "1:23" },
  },
  70: {
    easyRecovery: "7:15-7:45",
    easyAerobic: "6:45-7:15",
    marathon: "6:45",
    tempo: { per400m: "1:38", perKm: "4:05", perMile: "6:30" },
    interval: { per400m: "1:30", per800m: "3:02", per1200m: "4:35" },
    repetition: { per200m: "0:43", per300m: "1:05", per400m: "1:27" },
  },
  67: {
    easyRecovery: "7:30-8:00",
    easyAerobic: "7:00-7:30",
    marathon: "7:00",
    tempo: { per400m: "1:42", perKm: "4:15", perMile: "6:45" },
    interval: { per400m: "1:34", per800m: "3:10", per1200m: "4:47" },
    repetition: { per200m: "0:45", per300m: "1:08", per400m: "1:31" },
  },
  64: {
    easyRecovery: "7:45-8:15",
    easyAerobic: "7:15-7:45",
    marathon: "7:15",
    tempo: { per400m: "1:46", perKm: "4:25", perMile: "7:00" },
    interval: { per400m: "1:38", per800m: "3:18", per1200m: "4:59" },
    repetition: { per200m: "0:47", per300m: "1:11", per400m: "1:35" },
  },
  61: {
    easyRecovery: "8:00-8:30",
    easyAerobic: "7:30-8:00",
    marathon: "7:30",
    tempo: { per400m: "1:50", perKm: "4:35", perMile: "7:15" },
    interval: { per400m: "1:42", per800m: "3:26", per1200m: "5:11" },
    repetition: { per200m: "0:49", per300m: "1:14", per400m: "1:39" },
  },
  55: {
    easyRecovery: "8:30-9:00",
    easyAerobic: "8:00-8:30",
    marathon: "8:00",
    tempo: { per400m: "2:00", perKm: "5:00", perMile: "8:00" },
    interval: { per400m: "1:52", per800m: "3:46", per1200m: "5:41" },
    repetition: { per200m: "0:54", per300m: "1:22", per400m: "1:50" },
  },
  50: {
    easyRecovery: "9:00-9:30",
    easyAerobic: "8:30-9:00",
    marathon: "8:30",
    tempo: { per400m: "2:10", perKm: "5:25", perMile: "8:45" },
    interval: { per400m: "2:02", per800m: "4:06", per1200m: "6:11" },
    repetition: { per200m: "0:59", per300m: "1:30", per400m: "2:01" },
  },
  46: {
    easyRecovery: "9:30-10:00",
    easyAerobic: "9:00-9:30",
    marathon: "9:00",
    tempo: { per400m: "2:20", perKm: "5:50", perMile: "9:30" },
    interval: { per400m: "2:12", per800m: "4:26", per1200m: "6:41" },
    repetition: { per200m: "1:04", per300m: "1:38", per400m: "2:12" },
  },
  42: {
    easyRecovery: "10:00-10:30",
    easyAerobic: "9:30-10:00",
    marathon: "9:30",
    tempo: { per400m: "2:30", perKm: "6:15", perMile: "10:15" },
    interval: { per400m: "2:22", per800m: "4:46", per1200m: "7:11" },
    repetition: { per200m: "1:09", per300m: "1:46", per400m: "2:23" },
  },
  39: {
    easyRecovery: "10:30-11:00",
    easyAerobic: "10:00-10:30",
    marathon: "10:00",
    tempo: { per400m: "2:40", perKm: "6:40", perMile: "11:00" },
    interval: { per400m: "2:32", per800m: "5:06", per1200m: "7:41" },
    repetition: { per200m: "1:14", per300m: "1:54", per400m: "2:34" },
  },
  36: {
    easyRecovery: "11:00-11:30",
    easyAerobic: "10:30-11:00",
    marathon: "10:30",
    tempo: { per400m: "2:50", perKm: "7:05", perMile: "11:45" },
    interval: { per400m: "2:42", per800m: "5:26", per1200m: "8:11" },
    repetition: { per200m: "1:19", per300m: "2:02", per400m: "2:45" },
  },
};

const PLAN_STRUCTURES: Record<string, PhaseStructure[]> = {
  foundation: [
    {
      phaseNumber: 1,
      duration: 6,
      focus: "Base Building",
      description: "Establish aerobic foundation with easy running",
      targetMileage: 15,
      qualitySessions: 0,
    },
    {
      phaseNumber: 2,
      duration: 5,
      focus: "Introduce Strides",
      description: "Add basic speed elements",
      targetMileage: 18,
      qualitySessions: 1,
    },
    {
      phaseNumber: 3,
      duration: 5,
      focus: "Basic Tempo",
      description: "Develop lactate threshold",
      targetMileage: 20,
      qualitySessions: 1,
    },
    {
      phaseNumber: 4,
      duration: 4,
      focus: "Light Intervals",
      description: "Peak preparation with speed work",
      targetMileage: 22,
      qualitySessions: 1,
    },
  ],
  intermediate: [
    {
      phaseNumber: 1,
      duration: 6,
      focus: "Base Building",
      description: "Establish aerobic foundation",
      targetMileage: 25,
      qualitySessions: 1,
    },
    {
      phaseNumber: 2,
      duration: 5,
      focus: "Tempo Introduction",
      description: "Add sustained threshold work",
      targetMileage: 28,
      qualitySessions: 1,
    },
    {
      phaseNumber: 3,
      duration: 5,
      focus: "Full Integration",
      description: "Include all intensity types",
      targetMileage: 32,
      qualitySessions: 2,
    },
    {
      phaseNumber: 4,
      duration: 4,
      focus: "Peak Preparation",
      description: "Race-specific training",
      targetMileage: 35,
      qualitySessions: 2,
    },
  ],
  advanced: [
    {
      phaseNumber: 1,
      duration: 6,
      focus: "Base Building",
      description: "High-volume aerobic development",
      targetMileage: 40,
      qualitySessions: 1,
    },
    {
      phaseNumber: 2,
      duration: 5,
      focus: "Tempo Development",
      description: "Structured threshold training",
      targetMileage: 45,
      qualitySessions: 2,
    },
    {
      phaseNumber: 3,
      duration: 5,
      focus: "Full Integration",
      description: "Complete intensity spectrum",
      targetMileage: 50,
      qualitySessions: 3,
    },
    {
      phaseNumber: 4,
      duration: 4,
      focus: "Peak & Taper",
      description: "Race preparation and recovery",
      targetMileage: 52,
      qualitySessions: 3,
    },
  ],
  elite: [
    {
      phaseNumber: 1,
      duration: 6,
      focus: "Base Building",
      description: "Maximum aerobic development",
      targetMileage: 60,
      qualitySessions: 2,
    },
    {
      phaseNumber: 2,
      duration: 5,
      focus: "Tempo Development",
      description: "Advanced threshold training",
      targetMileage: 70,
      qualitySessions: 3,
    },
    {
      phaseNumber: 3,
      duration: 5,
      focus: "Full Integration",
      description: "Sophisticated workout structure",
      targetMileage: 75,
      qualitySessions: 3,
    },
    {
      phaseNumber: 4,
      duration: 4,
      focus: "Peak & Taper",
      description: "Elite race preparation",
      targetMileage: 80,
      qualitySessions: 3,
    },
  ],
};

// Utility functions
const calculateFitnessScore = (race: RaceTime): number => {
  const distanceTable = RACE_TO_FITNESS_TABLE[race.distance];
  if (!distanceTable) return 50;

  const exactMatch = distanceTable[race.time];
  if (exactMatch) return exactMatch;

  // Find closest time for interpolation
  const times = Object.keys(distanceTable).sort();
  const timeToSeconds = (time: string): number => {
    const parts = time.split(":");
    return parts.length === 2
      ? parseInt(parts[0]) * 60 + parseInt(parts[1])
      : parseInt(parts[0]) * 3600 +
          parseInt(parts[1]) * 60 +
          parseInt(parts[2]);
  };

  const raceSeconds = timeToSeconds(race.time);
  let closestTime = times[0];
  let minDiff = Math.abs(timeToSeconds(times[0]) - raceSeconds);

  for (const time of times) {
    const diff = Math.abs(timeToSeconds(time) - raceSeconds);
    if (diff < minDiff) {
      minDiff = diff;
      closestTime = time;
    }
  }

  return distanceTable[closestTime];
};

const applyAltitudeAdjustment = (
  paces: TrainingPaces,
  altitude: number
): TrainingPaces => {
  if (altitude < 3000) return paces;

  // Apply 4-second adjustment for 7000ft baseline
  const adjustTime = (timeStr: string, adjustment: number): string => {
    const [min, sec] = timeStr.split(":").map(Number);
    const totalSeconds = min * 60 + sec + adjustment;
    const newMin = Math.floor(totalSeconds / 60);
    const newSec = totalSeconds % 60;
    return `${newMin}:${newSec.toString().padStart(2, "0")}`;
  };

  const adjustRange = (range: string, adjustment: number): string => {
    const [start, end] = range.split("-");
    return `${adjustTime(start, adjustment)}-${adjustTime(end, adjustment)}`;
  };

  return {
    ...paces,
    easyRecovery: adjustRange(paces.easyRecovery, 4),
    easyAerobic: adjustRange(paces.easyAerobic, 4),
    marathon: adjustTime(paces.marathon, 4),
    tempo: {
      per400m: adjustTime(paces.tempo.per400m, 4),
      perKm: adjustTime(paces.tempo.perKm, 10),
      perMile: adjustTime(paces.tempo.perMile, 16),
    },
    interval: {
      per400m: adjustTime(paces.interval.per400m, 4),
      per800m: adjustTime(paces.interval.per800m, 8),
      per1200m: adjustTime(paces.interval.per1200m, 12),
    },
  };
};

const generatePDF = (plan: TrainingPlan, profile: UserProfile): string => {
  const content = `
Jack Daniels Running Plan
Generated: ${plan.metadata.generatedDate}
Plan Level: ${plan.metadata.planLevel}
Fitness Score: ${plan.metadata.fitnessScore}

TRAINING PACES:
Easy Recovery: ${plan.paces.easyRecovery}
Easy Aerobic: ${plan.paces.easyAerobic}
Marathon: ${plan.paces.marathon}
Tempo: ${plan.paces.tempo.perMile}/mile
Interval: ${plan.paces.interval.per400m}/400m
Repetition: ${plan.paces.repetition.per400m}/400m

PLAN STRUCTURE:
${plan.phases
  .map(
    (phase) => `
Phase ${phase.phaseNumber}: ${phase.focus} (${phase.duration} weeks)
${phase.description}
Target Weekly Mileage: ${phase.targetMileage} miles
Quality Sessions: ${phase.qualitySessions}/week
`
  )
  .join("")}

NOTES:
- Follow the 10% rule for mileage increases
- Take rest days seriously
- Adjust paces based on conditions
- Listen to your body
${
  plan.altitudeAdjusted
    ? `- Paces adjusted for ${profile.altitude}ft altitude`
    : ""
}
  `.trim();

  return `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
};

// Main component
const RunningPlanGenerator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    experienceLevel: "",
    weeklyMileage: 0,
    planLevel: "",
    trainingDays: [false, false, false, false, false, false, false],
    sessionDuration: 30,
    goalRace: "",
    altitude: 0,
    fitnessScore: 50,
  });
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const screens = [
    "Landing",
    "Fitness Assessment",
    "Training Constraints",
    "Plan Generation",
    "Export & Download",
  ];

  const experienceLevels = [
    {
      value: "beginner",
      label: "Beginner/Returning",
      mileage: "0-10 mpw",
      plan: "foundation",
    },
    {
      value: "recreational",
      label: "Recreational",
      mileage: "10-25 mpw",
      plan: "intermediate",
    },
    {
      value: "serious",
      label: "Serious",
      mileage: "25-50 mpw",
      plan: "advanced",
    },
    {
      value: "competitive",
      label: "Competitive",
      mileage: "50+ mpw",
      plan: "elite",
    },
  ];

  const raceDistances = [
    { value: "1500m", label: "1500m" },
    { value: "mile", label: "Mile" },
    { value: "5k", label: "5K" },
    { value: "10k", label: "10K" },
    { value: "half", label: "Half Marathon" },
    { value: "marathon", label: "Marathon" },
  ];

  const goalRaces = [
    { value: "5k", label: "5K" },
    { value: "10k", label: "10K" },
    { value: "half", label: "Half Marathon" },
    { value: "marathon", label: "Marathon" },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: string[] = [];

    switch (step) {
      case 1:
        if (!profile.experienceLevel)
          newErrors.push("Please select your experience level");
        if (profile.weeklyMileage <= 0)
          newErrors.push("Please enter your current weekly mileage");
        break;
      case 2:
        if (profile.trainingDays.filter(Boolean).length < 3) {
          newErrors.push("Please select at least 3 training days");
        }
        if (!profile.goalRace)
          newErrors.push("Please select your goal race distance");
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentScreen)) {
      if (currentScreen === 2) {
        generatePlan();
      }
      setCurrentScreen((prev) => Math.min(prev + 1, screens.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentScreen((prev) => Math.max(prev - 1, 0));
  };

  const generatePlan = () => {
    const fitnessScore = profile.recentRace
      ? calculateFitnessScore(profile.recentRace)
      : 50;
    const basePaces =
      FITNESS_TO_PACES_TABLE[fitnessScore] || FITNESS_TO_PACES_TABLE[50];
    const adjustedPaces = applyAltitudeAdjustment(basePaces, profile.altitude);

    const newPlan: TrainingPlan = {
      metadata: {
        planLevel: profile.planLevel,
        fitnessScore,
        generatedDate: new Date().toISOString().split("T")[0],
      },
      paces: adjustedPaces,
      phases: PLAN_STRUCTURES[profile.planLevel] || PLAN_STRUCTURES.foundation,
      altitudeAdjusted: profile.altitude >= 3000,
    };

    setPlan(newPlan);
  };

  const handleDownload = () => {
    if (!plan) return;

    const pdfContent = generatePDF(plan, profile);
    const link = document.createElement("a");
    link.href = pdfContent;
    link.download = `running-plan-${plan.metadata.planLevel}-${plan.metadata.generatedDate}.txt`;
    link.click();
  };

  const renderLandingScreen = () => (
    <div className="max-w-4xl mx-auto text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Jack Daniels Running Plan Generator
        </h1>
        <p className="text-xl text-gray-600">
          Generate personalised training plans based on scientifically proven
          methodology
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {experienceLevels.map((level) => (
          <div
            key={level.value}
            className="bg-white p-6 rounded-lg shadow-lg border"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {level.label}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{level.mileage}</p>
            <div className="text-sm text-blue-600 font-medium">
              {level.plan} Plan
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Scientific Approach
        </h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium text-gray-900">Research-Based</div>
            <div className="text-gray-600">Proven training methodology</div>
          </div>
          <div>
            <div className="font-medium text-gray-900">Personalised Paces</div>
            <div className="text-gray-600">Calculated from your fitness</div>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              Structured Progression
            </div>
            <div className="text-gray-600">20-week periodised plan</div>
          </div>
        </div>
      </div>

      <button
        onClick={handleNext}
        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
      >
        Start Assessment
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );

  const renderFitnessAssessment = () => (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Fitness Assessment</h2>
        <p className="text-gray-600">
          Help us understand your current running fitness
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Experience Level
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {experienceLevels.map((level) => (
              <button
                key={level.value}
                onClick={() =>
                  setProfile((prev) => ({
                    ...prev,
                    experienceLevel: level.value,
                    planLevel: level.plan,
                  }))
                }
                className={`p-4 rounded-lg border text-left transition-colors ${
                  profile.experienceLevel === level.value
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold text-gray-900">{level.label}</div>
                <div className="text-sm text-gray-600">{level.mileage}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Current Weekly Mileage
          </label>
          <input
            type="number"
            value={profile.weeklyMileage || ""}
            onChange={(e) =>
              setProfile((prev) => ({
                ...prev,
                weeklyMileage: parseInt(e.target.value) || 0,
              }))
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter miles per week"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Recent Race Performance (Optional)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={profile.recentRace?.distance || ""}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  recentRace: e.target.value
                    ? {
                        distance: e.target.value,
                        time: prev.recentRace?.time || "",
                      }
                    : undefined,
                }))
              }
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select distance</option>
              {raceDistances.map((distance) => (
                <option key={distance.value} value={distance.value}>
                  {distance.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="MM:SS or H:MM:SS"
              value={profile.recentRace?.time || ""}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  recentRace: prev.recentRace
                    ? {
                        ...prev.recentRace,
                        time: e.target.value,
                      }
                    : undefined,
                }))
              }
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={!profile.recentRace?.distance}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Race times help calculate more accurate training paces
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">
              Recommended Plan Level
            </span>
          </div>
          <div className="text-sm text-gray-700">
            Based on your inputs:{" "}
            <span className="font-semibold capitalize">
              {profile.planLevel}
            </span>
          </div>
          {profile.experienceLevel && (
            <div className="text-xs text-gray-600 mt-1">
              You can override this recommendation in the next step if needed
            </div>
          )}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-600">
            {errors.map((error, idx) => (
              <div key={idx}>• {error}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderTrainingConstraints = () => (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">
          Training Constraints
        </h2>
        <p className="text-gray-600">Configure your schedule and goals</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Available Training Days
          </label>
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day, idx) => (
                <button
                  key={day}
                  onClick={() =>
                    setProfile((prev) => ({
                      ...prev,
                      trainingDays: prev.trainingDays.map((selected, i) =>
                        i === idx ? !selected : selected
                      ),
                    }))
                  }
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    profile.trainingDays[idx]
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {day}
                </button>
              )
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Select at least 3 days. Rest days are important for recovery.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Typical Session Duration: {profile.sessionDuration} minutes
          </label>
          <input
            type="range"
            min="20"
            max="120"
            step="10"
            value={profile.sessionDuration}
            onChange={(e) =>
              setProfile((prev) => ({
                ...prev,
                sessionDuration: parseInt(e.target.value),
              }))
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>20 min</span>
            <span>120 min</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Goal Race Distance
          </label>
          <div className="grid grid-cols-2 gap-3">
            {goalRaces.map((race) => (
              <button
                key={race.value}
                onClick={() =>
                  setProfile((prev) => ({ ...prev, goalRace: race.value }))
                }
                className={`p-4 rounded-lg border text-center transition-colors ${
                  profile.goalRace === race.value
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold text-gray-900">{race.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Training Altitude (Optional)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={profile.altitude || ""}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  altitude: parseInt(e.target.value) || 0,
                }))
              }
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Feet above sea level"
            />
            <MapPin className="w-5 h-5 text-gray-400" />
          </div>
          {profile.altitude >= 3000 && (
            <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-700">
                <span className="font-medium">
                  Altitude adjustment will be applied.
                </span>
                Training paces will be slowed for altitude above 3,000 feet.
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Plan Summary</span>
          </div>
          <div className="text-sm space-y-1">
            <div>
              Training days: {profile.trainingDays.filter(Boolean).length}/week
            </div>
            <div>Session duration: {profile.sessionDuration} minutes</div>
            <div>
              Goal:{" "}
              {goalRaces.find((r) => r.value === profile.goalRace)?.label ||
                "Not selected"}
            </div>
            <div>
              Plan level:{" "}
              <span className="capitalize">{profile.planLevel}</span>
            </div>
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-600">
            {errors.map((error, idx) => (
              <div key={idx}>• {error}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderPlanGeneration = () => {
    if (!plan) return null;

    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            Your Training Plan
          </h2>
          <p className="text-gray-600">
            {plan.metadata.planLevel} level plan • Fitness Score:{" "}
            {plan.metadata.fitnessScore}
            {plan.altitudeAdjusted && " • Altitude adjusted"}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Training Paces
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="font-medium text-gray-900">Easy Recovery</div>
              <div className="text-lg font-bold text-green-600">
                {plan.paces.easyRecovery}
              </div>
              <div className="text-xs text-gray-600">Post-workout recovery</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="font-medium text-gray-900">Easy Aerobic</div>
              <div className="text-lg font-bold text-green-600">
                {plan.paces.easyAerobic}
              </div>
              <div className="text-xs text-gray-600">
                General fitness building
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="font-medium text-gray-900">Marathon</div>
              <div className="text-lg font-bold text-blue-600">
                {plan.paces.marathon}
              </div>
              <div className="text-xs text-gray-600">
                Comfortably hard effort
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="font-medium text-gray-900">Tempo</div>
              <div className="text-lg font-bold text-orange-600">
                {plan.paces.tempo.perMile}
              </div>
              <div className="text-xs text-gray-600">Lactate threshold</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="font-medium text-gray-900">Interval</div>
              <div className="text-lg font-bold text-red-600">
                {plan.paces.interval.per400m}/400m
              </div>
              <div className="text-xs text-gray-600">VO2max development</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="font-medium text-gray-900">Repetition</div>
              <div className="text-lg font-bold text-purple-600">
                {plan.paces.repetition.per400m}/400m
              </div>
              <div className="text-xs text-gray-600">Speed & economy</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            20-Week Plan Structure
          </h3>
          <div className="space-y-4">
            {plan.phases.map((phase) => (
              <div
                key={phase.phaseNumber}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Phase {phase.phaseNumber}: {phase.focus}
                    </h4>
                    <p className="text-sm text-gray-600">{phase.description}</p>
                  </div>
                  <span className="text-sm font-medium text-blue-600">
                    {phase.duration} weeks
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">
                      Target Weekly Mileage:
                    </span>
                    <span className="ml-2 font-medium">
                      {phase.targetMileage} miles
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Quality Sessions:</span>
                    <span className="ml-2 font-medium">
                      {phase.qualitySessions}/week
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Important Guidelines
          </h3>
          <div className="text-sm text-gray-700 space-y-1">
            <div>
              • Follow the 10% rule: increase weekly mileage by no more than 10%
            </div>
            <div>
              • Take rest days seriously - they're crucial for adaptation
            </div>
            <div>
              • Adjust paces based on weather, terrain, and how you feel
            </div>
            <div>
              • If you miss workouts, don't try to catch up - continue with the
              plan
            </div>
            {plan.altitudeAdjusted && (
              <div>
                • Paces have been adjusted for your training altitude of{" "}
                {profile.altitude} feet
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderExportScreen = () => (
    <div className="max-w-2xl mx-auto space-y-8 text-center">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Export Your Plan</h2>
        <p className="text-gray-600">
          Download your personalised training plan
        </p>
      </div>

      {plan && (
        <div className="bg-white rounded-lg shadow-lg p-6 text-left">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Plan Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Plan Level:</span>{" "}
              <span className="font-medium capitalize">
                {plan.metadata.planLevel}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Fitness Score:</span>{" "}
              <span className="font-medium">{plan.metadata.fitnessScore}</span>
            </div>
            <div>
              <span className="text-gray-600">Goal Race:</span>{" "}
              <span className="font-medium">
                {goalRaces.find((r) => r.value === profile.goalRace)?.label}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Training Days:</span>{" "}
              <span className="font-medium">
                {profile.trainingDays.filter(Boolean).length}/week
              </span>
            </div>
            <div>
              <span className="text-gray-600">Generated:</span>{" "}
              <span className="font-medium">{plan.metadata.generatedDate}</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={handleDownload}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Download Plan (Text)
        </button>

        <div className="text-sm text-gray-600">
          <p>Your plan includes:</p>
          <ul className="mt-2 space-y-1 text-left max-w-md mx-auto">
            <li>• Complete pace tables for all training intensities</li>
            <li>• 20-week structured progression plan</li>
            <li>• Training guidelines and safety notes</li>
            <li>• Phase-by-phase structure breakdown</li>
          </ul>
        </div>
      </div>

      <div className="bg-green-50 p-6 rounded-lg text-left">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Next Steps
        </h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>Now that you have your plan:</p>
          <div className="space-y-1 ml-4">
            <div>
              1. Review the pace guidelines and understand each intensity
            </div>
            <div>2. Start with Phase 1 and follow the progression</div>
            <div>3. Track your progress and adapt as needed</div>
            <div>4. Consider using a GPS watch or training app</div>
            <div>5. Listen to your body and prioritise recovery</div>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          setCurrentScreen(0);
          setProfile({
            experienceLevel: "",
            weeklyMileage: 0,
            planLevel: "",
            trainingDays: [false, false, false, false, false, false, false],
            sessionDuration: 30,
            goalRace: "",
            altitude: 0,
            fitnessScore: 50,
          });
          setPlan(null);
          setErrors([]);
        }}
        className="text-blue-600 hover:text-blue-700 font-medium"
      >
        Generate Another Plan
      </button>
    </div>
  );

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 0:
        return renderLandingScreen();
      case 1:
        return renderFitnessAssessment();
      case 2:
        return renderTrainingConstraints();
      case 3:
        return renderPlanGeneration();
      case 4:
        return renderExportScreen();
      default:
        return renderLandingScreen();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              Jack Daniels Running Plan Generator
            </h1>
            {currentScreen > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                Step {currentScreen} of {screens.length - 1}
              </div>
            )}
          </div>

          {/* Progress bar */}
          {currentScreen > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                {screens.slice(1).map((screen, idx) => (
                  <React.Fragment key={screen}>
                    <span
                      className={
                        currentScreen === idx + 1
                          ? "text-blue-600 font-medium"
                          : ""
                      }
                    >
                      {screen}
                    </span>
                    {idx < screens.length - 2 && <span>•</span>}
                  </React.Fragment>
                ))}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(currentScreen / (screens.length - 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {renderCurrentScreen()}
      </main>

      {/* Navigation */}
      {currentScreen > 0 && currentScreen < screens.length - 1 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
              disabled={currentScreen === 0}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {currentScreen === 2 ? "Generate Plan" : "Continue"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RunningPlanGenerator;
