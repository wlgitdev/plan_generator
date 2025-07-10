# User Journey Document

## Executive Summary

This document outlines the user journey for a single-page application (SPA) that generates personalised running training plans based on training methodology. The app serves runners from beginner to elite levels, generating structured plans and enabling export for external tracking.

## User Personas

**Beginner Runner (White Plan)**
- New to running or returning after extended break
- Limited running experience
- Seeks structured introduction to training
- Time commitment: 30-45 minutes per session

**Recreational Runner (Red Plan)**
- Some running background
- Interested in recreational racing
- Moderate time availability
- Minimum 4 days/week training capacity

**Serious Runner (Blue Plan)**
- Dedicated to structured training
- Regular race participation
- Higher training volume capacity
- Performance improvement focused

**Elite Runner (Gold Plan)**
- Competitive athlete
- High training volume tolerance
- Advanced training concepts familiarity
- Performance optimisation priority

## User Journey Flow

### 1. Initial Entry & Assessment

**Entry Point**
- User lands on application homepage
- Clear value proposition displayed
- Training methodology overview provided

**User Assessment**
- Running experience questionnaire
- Current fitness level evaluation
- Available training time assessment
- Goal identification (fitness, racing, specific events)

**Persona Assignment**
- System recommends training plan level (White/Red/Blue/Gold)
- User can override recommendation
- Plan characteristics explained

### 2. Profile Configuration

**Basic Information**
- Age and gender selection
- Current running frequency
- Weekly mileage (if applicable)
- Previous race times (for VDOT calculation)

**Goals & Preferences**
- Primary goal selection:
  - General fitness
  - 5K/10K racing
  - Half marathon
  - Marathon
  - Cross country
  - Ultramarathon
  - Triathlon training

**Training Constraints**
- Days per week available
- Session duration preferences
- Equipment access (track, treadmill, trails)
- Seasonal considerations

### 3. Plan Generation

**VDOT Calculation**
- Recent race time input (optional)
- Estimated current fitness level
- Training pace calculations generated

**Plan Customisation**
- Training phase selection
- Weekly structure configuration
- Intensity distribution settings
- Recovery preferences

**Plan Preview**
- Generated plan overview
- Sample week display
- Training type explanations:
  - Easy (E) runs
  - Long (L) runs
  - Threshold (T) runs
  - Interval (I) training
  - Marathon pace (M) runs

### 4. Plan Review & Finalisation

**Plan Validation**
- Training load assessment
- Progression timeline review
- Adjustment opportunities

**Educational Content**
- Training terminology explanations
- Intensity zone guidance
- Pace calculator access
- Recovery importance education

**Final Confirmation**
- Plan acceptance
- Modification options
- Start date selection

### 5. Export & Next Steps

**Export Options**
- PDF download with complete plan
- CSV format for spreadsheet import
- Calendar integration files (.ics)
- Training app compatible formats

**Export Content**
- Complete training schedule
- Pace charts and VDOT tables
- Progress tracking templates
- Educational resources summary

**Follow-up Guidance**
- Plan execution tips
- Progress monitoring advice
- Plan adjustment recommendations
- Return user pathways

## Key User Actions

### Critical Path Actions
1. Complete assessment questionnaire
2. Input current fitness data
3. Select training goals
4. Review generated plan
5. Export plan for tracking

### Secondary Actions
- Access educational content
- Modify plan parameters
- Calculate training paces
- Review methodology information
- Share plan details

## Pain Points & Solutions

### Potential Pain Points
- **Overwhelming options**: Too many configuration choices
  - *Solution*: Progressive disclosure, recommended defaults

- **Unclear terminology**: Complex training concepts
  - *Solution*: Contextual help, glossary integration

- **Plan complexity**: Difficulty understanding structure
  - *Solution*: Visual timeline, sample week preview

- **Export confusion**: Uncertain about format selection
  - *Solution*: Format explanations, preview options

### Success Criteria
- User completes full journey in under 10 minutes
- Generated plan matches user's stated goals
- Export format meets user's tracking needs
- Educational content clarifies methodology

## Technical Considerations

### User Experience Requirements
- Mobile-responsive design for all form factors
- Progressive web app capabilities
- Offline plan access post-generation
- Fast loading and responsive interactions

### Data Persistence
- Session storage for journey completion
- Optional account creation for plan retrieval
- Export history tracking
- Plan modification capabilities

## Success Metrics

### Engagement Metrics
- Journey completion rate
- Time to plan generation
- Export action completion
- Return user frequency

### Quality Metrics
- Plan accuracy assessment
- User satisfaction scores
- Export format utilisation
- Support request frequency
