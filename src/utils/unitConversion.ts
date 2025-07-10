// utils/unitConversion.ts
import type { UnitSystem, UnitPreferences, ConversionFactors } from "../types";

export const CONVERSION_FACTORS: ConversionFactors = {
  kmToMiles: 0.621371,
  milesToKm: 1.609344,
  metersToFeet: 3.28084,
  feetToMeters: 0.3048,
  paceKmToMile: 1.609344, // multiply km pace by this to get mile pace
  paceMileToKm: 0.621371, // multiply mile pace by this to get km pace
};

/**
 * Creates unit preferences based on selected unit system
 */
export const createUnitPreferences = (system: UnitSystem): UnitPreferences => ({
  system,
  paceUnit: system === "metric" ? "min/km" : "min/mi",
  distanceUnit: system === "metric" ? "km" : "mi",
  altitudeUnit: system === "metric" ? "m" : "ft",
});

/**
 * Converts distance between metric and imperial systems
 */
export const convertDistance = (
  value: number,
  fromUnit: "km" | "mi" | "m" | "ft",
  toUnit: "km" | "mi" | "m" | "ft"
): number => {
  if (fromUnit === toUnit) return value;

  // Convert to meters first, then to target unit
  let meters: number;

  switch (fromUnit) {
    case "km":
      meters = value * 1000;
      break;
    case "mi":
      meters = value * CONVERSION_FACTORS.milesToKm * 1000;
      break;
    case "m":
      meters = value;
      break;
    case "ft":
      meters = value * CONVERSION_FACTORS.feetToMeters;
      break;
    default:
      throw new Error(`Unknown distance unit: ${fromUnit}`);
  }

  switch (toUnit) {
    case "km":
      return meters / 1000;
    case "mi":
      return (meters / 1000) * CONVERSION_FACTORS.kmToMiles;
    case "m":
      return meters;
    case "ft":
      return meters * CONVERSION_FACTORS.metersToFeet;
    default:
      throw new Error(`Unknown distance unit: ${toUnit}`);
  }
};

/**
 * Converts pace between metric and imperial systems
 * Pace format expected as "MM:SS" string
 */
export const convertPace = (
  paceString: string,
  fromSystem: UnitSystem,
  toSystem: UnitSystem
): string => {
  if (fromSystem === toSystem) return paceString;

  const [minutes, seconds] = paceString.split(":").map(Number);
  if (isNaN(minutes) || isNaN(seconds)) {
    throw new Error(`Invalid pace format: ${paceString}`);
  }

  const totalSeconds = minutes * 60 + seconds;

  const convertedSeconds =
    fromSystem === "metric"
      ? totalSeconds * CONVERSION_FACTORS.paceKmToMile
      : totalSeconds * CONVERSION_FACTORS.paceMileToKm;

  const convertedMinutes = Math.floor(convertedSeconds / 60);
  const remainingSeconds = Math.round(convertedSeconds % 60);

  return `${convertedMinutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

/**
 * Formats distance with appropriate precision and unit
 */
export const formatDistance = (
  value: number,
  unit: string,
  precision: number = 1
): string => {
  const formattedValue =
    value % 1 === 0 ? value.toString() : value.toFixed(precision);
  return `${formattedValue} ${unit}`;
};

/**
 * Detects user's preferred unit system based on browser locale
 */
export const detectDefaultUnitSystem = (): UnitSystem => {
  try {
    const locale = navigator.language || "en-US";
    const country = locale.split("-")[1]?.toUpperCase();

    // Countries that primarily use imperial system
    const imperialCountries = ["US", "LR", "MM"];

    return imperialCountries.includes(country || "") ? "imperial" : "metric";
  } catch {
    // Fallback to metric if locale detection fails
    return "metric";
  }
};

/**
 * Generates preview examples for pace and distance formatting
 */
export const generatePreviewExamples = (unitSystem: UnitSystem) => {
  const isMetric = unitSystem === "metric";

  return {
    easyPace: isMetric ? "5:30 min/km" : "8:51 min/mi",
    tempoPace: isMetric ? "4:15 min/km" : "6:50 min/mi",
    shortDistance: isMetric ? "400 m" : "400 yd",
    mediumDistance: isMetric ? "5.0 km" : "3.1 mi",
    longDistance: isMetric ? "21.1 km" : "13.1 mi",
    altitude: isMetric ? "1,500 m" : "4,921 ft",
    weeklyMileage: isMetric ? "50 km/week" : "31 mi/week",
  };
};
