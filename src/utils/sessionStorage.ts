// utils/sessionStorage.ts
import type { UnitPreferences } from "../types";

const STORAGE_KEYS = {
  UNIT_PREFERENCES: "daniels_plan_unit_preferences",
  APP_STATE: "daniels_plan_app_state",
} as const;

/**
 * Safely stores unit preferences in session storage
 */
export const saveUnitPreferences = (preferences: UnitPreferences): void => {
  try {
    const serializedPreferences = JSON.stringify(preferences);
    sessionStorage.setItem(
      STORAGE_KEYS.UNIT_PREFERENCES,
      serializedPreferences
    );
  } catch (error) {
    console.error("Failed to save unit preferences to session storage:", error);
  }
};

/**
 * Safely retrieves unit preferences from session storage
 */
export const loadUnitPreferences = (): UnitPreferences | null => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEYS.UNIT_PREFERENCES);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as UnitPreferences;

    // Validate the loaded data structure
    if (!isValidUnitPreferences(parsed)) {
      console.warn(
        "Invalid unit preferences found in session storage, ignoring"
      );
      return null;
    }

    return parsed;
  } catch (error) {
    console.error(
      "Failed to load unit preferences from session storage:",
      error
    );
    return null;
  }
};

/**
 * Clears all application data from session storage
 */
export const clearSessionData = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      sessionStorage.removeItem(key);
    });
  } catch (error) {
    console.error("Failed to clear session storage:", error);
  }
};

/**
 * Validates unit preferences object structure
 */
const isValidUnitPreferences = (obj: unknown): obj is UnitPreferences => {
  if (typeof obj !== "object" || obj === null) return false;

  const preferences = obj as Record<string, unknown>;

  return (
    typeof preferences.system === "string" &&
    (preferences.system === "metric" || preferences.system === "imperial") &&
    typeof preferences.paceUnit === "string" &&
    typeof preferences.distanceUnit === "string" &&
    typeof preferences.altitudeUnit === "string"
  );
};

/**
 * Checks if session storage is available and functional
 */
export const isSessionStorageAvailable = (): boolean => {
  try {
    const testKey = "__test_session_storage__";
    sessionStorage.setItem(testKey, "test");
    sessionStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};
