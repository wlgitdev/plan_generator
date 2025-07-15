import { describe, it, expect } from "vitest";

// Type definitions for Phase 1 plan generation
interface PlanStructure {
  totalWeeks: number;
  phases: PhaseStructure[];
}

interface PhaseStructure {
  phaseNumber: number;
  durationWeeks: number;
  focusDescription: string;
}

// Minimal plan generation function for Phase 1
function generatePlan(
  planLevel: "foundation" | "intermediate" | "advanced" | "elite"
): PlanStructure {
  const phaseDurations = [6, 5, 5, 4]; // Fixed durations as per requirements

  const phaseDescriptions = {
    foundation: [
      "Base Building",
      "Introduce Strides",
      "Basic Tempo",
      "Light Intervals",
    ],
    intermediate: [
      "Base Building",
      "Tempo Introduction",
      "Full Integration",
      "Peak & Race Prep",
    ],
    advanced: [
      "Base Building",
      "Tempo Introduction",
      "Full Integration",
      "Peak & Race Prep",
    ],
    elite: [
      "Base Building",
      "Tempo Introduction",
      "Full Integration",
      "Peak & Race Prep",
    ],
  };

  const phases: PhaseStructure[] = phaseDurations.map((duration, index) => ({
    phaseNumber: index + 1,
    durationWeeks: duration,
    focusDescription: phaseDescriptions[planLevel][index],
  }));

  return {
    totalWeeks: phaseDurations.reduce((sum, weeks) => sum + weeks, 0),
    phases,
  };
}

describe("Plan Generation - Phase 1 Core Functionality", () => {
  it("should generate plan with correct structure", () => {
    const plan = generatePlan("intermediate");

    // Test core requirements from FR-028, FR-029
    expect(plan.totalWeeks).toBe(20);
    expect(plan.phases).toHaveLength(4);

    // Test fixed phase durations
    const expectedDurations = [6, 5, 5, 4];
    plan.phases.forEach((phase, index) => {
      expect(phase.durationWeeks).toBe(expectedDurations[index]);
      expect(phase.phaseNumber).toBe(index + 1);
    });
  });

  it("should generate plans for all four levels", () => {
    const levels: Array<"foundation" | "intermediate" | "advanced" | "elite"> =
      ["foundation", "intermediate", "advanced", "elite"];

    levels.forEach((level) => {
      const plan = generatePlan(level);
      expect(plan.totalWeeks).toBe(20);
      expect(plan.phases).toHaveLength(4);
    });
  });
});