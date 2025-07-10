# Requirements Analysis Report
## Jack Daniels Running Plan Generator SPA

### Executive Summary

This report provides functional and technical requirements for a single-page application generating personalised running training plans based on Jack Daniels' methodology. The system captures user profiles, calculates training paces using complete VDOT tables, generates structured 24-week plans with flexible phases, and exports them in multiple formats.

---

## User Stories & Functional Requirements

### Epic 1: User Assessment (US-001 to US-004)

**US-001**: As a runner, I want to provide my current fitness level so that I receive an appropriate training plan.
- **FR-001**: System captures running experience with clear mapping to training plans:
  - Beginner/Returning (0-10 mpw) → Foundation Plan
  - Recreational (10-25 mpw, 2-4 days) → Intermediate Plan  
  - Serious (25-50 mpw, 4-6 days) → Advanced Plan
  - Competitive (50+ mpw, 6-7 days) → Elite Plan
- **FR-002**: System captures current weekly mileage and validates against plan compatibility
- **FR-003**: System provides plan override with safety warnings for inappropriate selections
- **FR-004**: System explains plan characteristics with sample training weeks

**US-002**: As a runner, I want to input my recent race performance so that my training paces are accurately calculated.
- **FR-005**: System accepts race times for multiple distances with validation
- **FR-006**: System calculates fitness score using embedded conversion tables
- **FR-007**: System generates five training intensity paces from fitness score
- **FR-008**: System provides pace context and purpose explanations

**US-003**: As a runner, I want to specify my training constraints so that my plan fits my schedule and goals.
- **FR-009**: System captures available training days (3-7) with rest day distribution
- **FR-010**: System captures session duration preferences with plan compatibility checks
- **FR-011**: System captures goal race with distance-specific plan modifications
- **FR-012**: System captures altitude for pace adjustments (3,000+ feet threshold)

**US-004**: As a runner, I want to understand how my constraints affect my plan recommendations.
- **FR-013**: System shows impact of constraint changes on plan structure
- **FR-014**: System provides safety warnings for constraint conflicts
- **FR-015**: System suggests alternative constraints for better plan fit

### Epic 2: Plan Generation (US-005 to US-008)

**US-005**: As a runner with a fitness score, I want accurate training paces with contextual guidance.
- **FR-016**: System uses complete embedded fitness-to-pace lookup tables
- **FR-017**: System provides multiple easy pace options with selection guidance:
  - Easy recovery: Post-workout/race recovery days
  - Easy aerobic: General fitness development days  
- **FR-018**: System applies altitude adjustments above 3,000 feet using research baseline
- **FR-019**: System provides pace ranges and approximation guidance for different fitness levels

**US-006**: As a runner selecting a plan level, I want a structured program based on proven methodology.
- **FR-020**: System generates fixed 4-phase structure with predetermined phase lengths:
  - Phase I: 6 weeks base building
  - Phase II: 5 weeks tempo introduction  
  - Phase III: 5 weeks full intensity integration
  - Phase IV: 4 weeks peak and race preparation
- **FR-021**: System maintains consistent 20-week duration regardless of user inputs
- **FR-022**: System applies proven progression principles without deviation

**US-007**: As a runner with specific goals, I want distance-appropriate training emphasis.
- **FR-023**: System applies goal-distance modifications to base plan template:
  - 5K/10K: Higher speed work frequency, moderate mileage, track emphasis
  - Half Marathon: Balanced tempo/marathon work, moderate-high mileage  
  - Marathon: High mileage priority, long run emphasis, marathon pace focus
- **FR-024**: System scales weekly structure based on plan level and distance goals
- **FR-025**: System provides race-specific workout progressions in final phases

**US-008**: As a runner reviewing my plan, I want comprehensive workout guidance.
- **FR-026**: System provides detailed workout descriptions with purpose explanations
- **FR-027**: System includes warm-up/cool-down protocols for each session type
- **FR-028**: System explains progression rationale and adaptation markers

### Epic 3: Plan Safety & Integrity (US-009 to US-010)

**US-009**: As a runner concerned about injury risk, I want built-in safety controls.
- **FR-029**: System enforces volume progression limits (10% weekly increase maximum)
- **FR-030**: System validates workout volumes against multiple safety constraints
- **FR-031**: System provides overtraining warning indicators and rest recommendations

**US-010**: As a runner wanting to understand my plan, I want educational guidance.
- **FR-032**: System explains why specific workouts are scheduled at particular times
- **FR-033**: System provides guidance on plan adherence and what to do when workouts are missed
- **FR-034**: System includes progression monitoring guidelines

### Epic 4: Plan Export & Integration (US-011 to US-012)

**US-011**: As a runner using training apps, I want seamless data export.
- **FR-035**: System exports detailed CSV with pace bands, workout codes, and notes
- **FR-036**: System generates calendar file with pre-workout reminders and instructions
- **FR-037**: System creates comprehensive PDF with embedded pace tables and methodology

**US-012**: As a runner wanting ongoing guidance, I want reference materials included.
- **FR-038**: Export includes complete pace conversion tables for plan adjustments  
- **FR-039**: Export includes training load monitoring guidelines and effort scales
- **FR-040**: Export includes troubleshooting guide for common training issues

---

## Training Methodology Overview

### Core Training Principles

**Progressive Overload**: Training stress increases gradually to stimulate adaptation while preventing injury. Weekly mileage increases by maximum 10% with recovery weeks every fourth week.

**Training Intensities**: Five distinct effort levels each target specific physiological adaptations:
- **Easy**: Aerobic base development (conversational pace)
- **Marathon**: Race-specific endurance (comfortably hard)
- **Tempo**: Lactate threshold development (sustained hard effort)
- **Interval**: VO2max improvement (hard with recovery)
- **Repetition**: Speed and running economy (very fast with full recovery)

**Periodisation**: Training phases build systematically:
1. **Base Building**: Establish aerobic foundation with easy running
2. **Tempo Introduction**: Add sustained tempo efforts
3. **Full Integration**: Include all intensity types
4. **Peak/Taper**: Race-specific preparation and recovery

### Plan Levels

**Foundation Plan (Beginner)**
- Target: 0-20 miles per week
- Focus: Building running habit and basic fitness
- Quality sessions: 0-1 per week
- Suitable for: New runners or returning after extended break

**Intermediate Plan (Recreational)**
- Target: 15-35 miles per week
- Focus: Developing aerobic base with light speed work
- Quality sessions: 1-2 per week
- Suitable for: Regular recreational runners

**Advanced Plan (Serious)**
- Target: 30-55 miles per week
- Focus: Structured training with all intensity types
- Quality sessions: 2-3 per week
- Suitable for: Committed recreational to sub-elite runners

**Elite Plan (Competitive)**
- Target: 50-80+ miles per week
- Focus: High-volume training with sophisticated workout structure
- Quality sessions: 3 per week
- Suitable for: Competitive runners with significant time commitment

### Fitness Score System

The system uses race performance to calculate a fitness score that determines training paces:

**Race Time Conversion**: Recent race times from 1500m to marathon are converted to standardised fitness scores using research-based tables.

**Pace Calculation**: Fitness scores generate specific training paces for each intensity level, ensuring workouts target appropriate physiological systems.

**Altitude Adjustment**: Paces are adjusted for training altitudes above 3,000 feet based on physiological research.

---

## Technical Requirements Specification

### Core Data Requirements

**TR-001: Complete Fitness Score Tables**
```
RACE_TO_FITNESS_TABLE:
  structure: MAP[race_distance][time_string] -> fitness_score
  required_distances: [1500m, mile, 5k, 10k, half_marathon, marathon]
  fitness_range: 30 to 85 (complete coverage required)
  time_format: "MM:SS" for shorter distances, "H:MM:SS" for longer
  data_source: Research-based conversion tables (embedded)

FITNESS_TO_PACES_TABLE:
  structure: MAP[fitness_score] -> training_pace_set
  training_pace_set:
    easy_recovery: time_range_string     // Post-workout recovery
    easy_aerobic: time_range_string      // General aerobic base  
    marathon: time_string
    tempo: {per_400m, per_km, per_mile}
    interval: {per_400m, per_800m, per_1200m}  
    repetition: {per_200m, per_300m, per_400m}
  data_source: Research-based pace tables (exact embedded values)

EASY_PACE_SELECTION_RULES:
  recovery_context: use easy_recovery range
  aerobic_context: use easy_aerobic range
  long_run_progression: start aerobic, finish recovery
  post_quality_day: always recovery
```
```

**TR-002: Workout Volume Constraints Engine**
```
VOLUME_CONSTRAINTS:
  repetition_limits:
    max_weekly_percentage: 5% of weekly_mileage
    max_weekly_absolute: 5 miles  
    max_session_percentage: 2.5% of weekly_mileage
    max_individual_effort: 2 minutes
    recovery_ratio: 2.5 * work_time
    
  interval_limits:
    max_weekly_percentage: 8% of weekly_mileage
    max_weekly_absolute: 6.2 miles
    max_session_percentage: 4% of weekly_mileage  
    max_individual_effort: 5 minutes
    recovery_ratio: 1.0 * work_time
    
  tempo_limits:
    max_weekly_percentage: 10% of weekly_mileage
    max_weekly_absolute: 15 miles
    min_session_distance: 3 miles (effectiveness threshold)
    max_session_percentage: 6% of weekly_mileage
    max_segment_duration: 15 minutes
    recovery_for_segments: MAX(work_time * 0.2, 60 seconds)
    
  quality_session_limits:
    max_per_week: FUNCTION(plan_level) -> {foundation: 1, intermediate: 2, advanced: 3, elite: 3}
    min_recovery_between: 1 day
    consecutive_prohibition: true
    
VALIDATION_FUNCTION:
  input: workout_specification, weekly_mileage, plan_level
  process: check_all_applicable_constraints
  output: {valid: boolean, violations: list_of_constraint_failures}
```
```

**TR-003: Altitude Adjustment Engine**
```
ALTITUDE_ADJUSTMENT_RULES:
  baseline_altitude: 7000 feet (research baseline)
  min_adjustment_threshold: 3000 feet
  
  KNOWN_ADJUSTMENTS_7000FT:
    repetition_pace: 0 seconds (no adjustment)
    interval_pace: +4 seconds per 400m
    tempo_pace: +4 seconds per 400m
    marathon_pace: +4 seconds per 400m  
    easy_pace: +4 seconds per 400m
    
  ADJUSTMENT_FUNCTION:
    input: sea_level_paces, current_altitude
    IF altitude < 3000 THEN return original_paces
    IF altitude = 7000 THEN apply known_adjustments
    ELSE return original_paces WITH advisory_note
    output: adjusted_pace_table OR advisory_message
```
```

**TR-004: Plan Structure Engine**
```
PLAN_STRUCTURES:
  foundation_plan:
    target_weekly_mileage: calculated_from_current_fitness
    phase_durations: FIXED [6, 5, 5, 4] weeks
    total_duration: 20 weeks (fixed)
    
    PHASE_DEFINITIONS:
      phase_1: {duration: 6_weeks, focus: base_building, quality_sessions: 0}
      phase_2: {duration: 5_weeks, focus: introduce_strides, quality_sessions: 1}
      phase_3: {duration: 5_weeks, focus: basic_tempo, quality_sessions: 1}
      phase_4: {duration: 4_weeks, focus: light_intervals, quality_sessions: 1}
      
  intermediate_plan:
    target_weekly_mileage: calculated_from_current_fitness
    phase_durations: FIXED [6, 5, 5, 4] weeks
    total_duration: 20 weeks (fixed)
    quality_sessions_progression: [1, 1, 2, 2]
    
  advanced_plan:
    target_weekly_mileage: calculated_from_current_fitness
    phase_durations: FIXED [6, 5, 5, 4] weeks
    total_duration: 20 weeks (fixed)
    quality_sessions_progression: [1, 2, 3, 3]
    
  elite_plan:
    target_weekly_mileage: calculated_from_current_fitness
    phase_durations: FIXED [6, 5, 5, 4] weeks
    total_duration: 20 weeks (fixed)
    quality_sessions_progression: [2, 3, 3, 3]

DISTANCE_MODIFICATIONS:
  5k_emphasis: {primary: [interval, repetition], long_run_max: 120_min}
  10k_emphasis: {primary: [interval, tempo], long_run_max: 120_min}
  half_emphasis: {primary: [tempo, marathon], long_run_max: 150_min}
  marathon_emphasis: {primary: [marathon, easy, long], long_run_max: 180_min}
  
MILEAGE_CALCULATION:
  input: current_weekly_mileage, plan_level, goal_distance
  output: appropriate_target_mileage (following proven progression)
  constraint: no_user_modification_allowed
```

**TR-005: Pace Approximation System**
```
PACE_APPROXIMATION:
  purpose: pace_estimation_when_tables_unavailable
  accuracy_varies_by_fitness:
    fitness_60_plus: 6_seconds_difference
    fitness_50_to_59: 7_seconds_difference  
    fitness_below_50: 8_seconds_difference
    
  PACE_RELATIONSHIPS:
    repetition_400m: current_mile_pace / 4
    interval_400m: repetition_pace + seconds_difference
    tempo_400m: interval_pace + seconds_difference
    
  USAGE_CONTEXT:
    primary: emergency_fallback_only
    preferred: use_embedded_fitness_tables
    note: approximation_accuracy_decreases_with_lower_fitness
```

**TR-006:  Workout Progression Engine**
```
PROGRESSION_RULES:
  volume_progression:
    weekly_increase_limit: 10%
    progression_pattern: gradual (vs step_increases)
    recovery_weeks: every_4th_week with 20%_reduction
    
  intensity_progression:
    phase_1: {volume_focus, easy_pace_only}
    phase_2: {tempo_introduction, weekly_frequency}
    phase_3: {full_intensity_spectrum, bi_weekly_new_additions}
    phase_4: {race_specific_emphasis, taper_initiation}
    
  PROGRESSION_VALIDATION:
    check: previous_phase_completion
    ensure: adaptation_time_adequate
    prevent: intensity_jumps_without_base
```

**TR-007: Plan Integrity System**
```
SAFETY_CHECKS:
  overtraining_indicators:
    quality_sessions_per_week > 3: generate_warning
    weekly_mileage_increase > 15%: block_progression
    consecutive_hard_days > 2: block_schedule
```
```

### Data Models

**User Profile Model**
```
USER_PROFILE:
  demographics: {age, gender, experience_years}
  current_fitness: {
    weekly_mileage: number
    training_days_per_week: number  
    longest_recent_run: distance
    recent_races: LIST[{distance, time, date}]
    estimated_fitness_score: calculated_from_best_race
  }
  goals: {
    primary_race: {distance, target_date, goal_time}
    secondary_goals: LIST[objective_strings]
    available_time: {weekday_minutes, weekend_minutes}
  }
  constraints: {
    available_days: BOOLEAN_ARRAY[7] // days of week
    equipment_access: {track, treadmill, hills}
    altitude_feet: number
    injury_history: LIST[condition_strings]
  }
```

**Training Plan Model**
```
TRAINING_PLAN:
  metadata: {
    plan_id: unique_identifier
    generated_date: timestamp
    plan_level: {foundation | intermediate | advanced | elite}
    fitness_score: integer
  }
  
  pace_specifications: {
    easy_recovery: time_range
    easy_aerobic: time_range
    marathon: time_string
    tempo: {per_400m, per_km, per_mile}
    interval: {per_400m, per_800m, per_1200m}
    repetition: {per_200m, per_300m, per_400m}
  }
  
  altitude_data: {
    applied: boolean
    altitude_feet: number
    adjustments_made: MAP[intensity -> adjustment_seconds]
  }
  
  plan_structure: {
    total_weeks: 20
    phases: LIST[PHASE_STRUCTURE] (immutable)
  }
  
  validation_results: {
    safety_checks: LIST[{check_name, status, warnings}]
    constraint_violations: LIST[violation_descriptions]
  }
```

**Phase Structure Model**
```
PHASE_STRUCTURE:
  phase_metadata: {
    phase_number: integer
    duration_weeks: integer
    focus_description: string
    target_weekly_mileage: number (calculated)
    quality_sessions_per_week: number (predetermined)
  }
  
  weekly_plans: LIST[WEEK_STRUCTURE] (immutable)
```

**Week Structure Model**
```
WEEK_STRUCTURE:
  week_metadata: {
    week_number: integer
    total_planned_mileage: number (calculated)
    quality_session_count: number (predetermined)
  }
  
  daily_workouts: LIST[WORKOUT_SPECIFICATION] (immutable)
```

**Workout Specification Model**
```
WORKOUT_SPECIFICATION:
  scheduling: {
    day_of_week: integer
    estimated_duration: minutes
  }
  
  workout_details: {
    type: {easy | long | tempo | interval | repetition | marathon | rest}
    description: detailed_workout_string
    target_pace: pace_specification
    distance_or_time: workout_volume
    effort_level: subjective_description
  }
  
  guidance: {
    purpose: training_adaptation_explanation
    execution_notes: LIST[instruction_strings]
    safety_considerations: LIST[warning_strings]
  }
```

---

## Implementation Priorities

### Phase 1 (Core Functionality)
1. Complete fitness score table embedding and lookup system
2. Fixed plan generation for all four levels  
3. Volume constraint validation
4. Simple PDF export

### Phase 2 (Enhanced Features)
1. Altitude adjustments and advanced pace guidance
2. Distance-specific plan modifications
3. CSV and calendar export formats
4. Educational guidance system

### Phase 3 (Polish & Documentation)  
1. Comprehensive user guidance and education
2. Integration guides for popular training apps
3. Advanced troubleshooting documentation

---

## Critical Success Factors

**Data Completeness**: System requires complete, accurate fitness score tables. Incomplete data renders system non-functional.

**Plan Integrity**: Generated plans must strictly follow proven methodology without modification capability. User education on proper plan selection is critical.

**Methodology Fidelity**: Plan generation must strictly follow Daniels' progression principles. Modifications should preserve core training philosophy.

**User Guidance**: System must educate users on proper implementation, not just provide workouts. Include contextual help throughout interface.
