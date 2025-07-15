# Running Plan Generator - Phase 1 Implementation

A React-based single-page application for generating personalised running training plans.

## Phase 1.1, 1.2 & 1.3 Implementation Complete

This implementation covers all four screens of Phase 1 as specified in the UX design requirements:

### ✅ Phase 1.1 - Landing Screen
- **Hero section** with scientific approach explanation
- **Plan level overview cards** (Foundation, Intermediate, Advanced, Elite)
- **Dual-unit display** showing both metric and imperial measurements
- **Methodology credibility indicators** (Olympic Coach, Research-Based, Proven Results)
- **Responsive design** with hover states and animations
- **Clear call-to-action** to start assessment

### ✅ Phase 1.2 - User Preferences Screen
- **Unit system selector** with metric/imperial toggle
- **Regional auto-detection** based on browser locale
- **Live preview examples** showing how measurements will display
- **Session storage persistence** for user preferences
- **Real-time unit conversion** and preview updates
- **Comprehensive measurement examples** (paces, distances, altitude)

### ✅ Phase 1.3 - Fitness Assessment Screen
- **Experience level selection** with weekly mileage ranges in user's preferred units
- **Race performance input** (optional) with VDOT fitness score calculation
- **Current weekly mileage** slider with validation against experience level
- **Plan level recommendation** with override capability
- **Real-time training pace calculation** when race data provided
- **Form validation** with safety warnings for mismatches
- **Unit-aware validation** and display throughout

### ✅ Phase 1.4 - Training Constraints Screen
- **Training days selection** with interactive weekly calendar
- **Session duration** range slider with plan compatibility indicators
- **Goal race selection** with distance-appropriate descriptions in preferred units
- **Altitude input** with threshold warnings (3000ft/914m) in user's units
- **Real-time constraint validation** and impact preview
- **Comprehensive plan compatibility checking**

### ✅ Phase 1.5 - Plan Generation & Review Screen (Complete)
- **Personalized training paces** calculated from VDOT or estimated from experience
- **20-week plan structure** with 4 progressive phases (Base → Tempo → Integration → Peak)
- **Altitude adjustments** automatically applied when training above thresholds
- **Unit conversion reference** showing equivalent paces in alternate system
- **Interactive plan exploration** with expandable phase details
- **Educational guidance** covering progression principles and safety guidelines
- **Plan validation summary** with recommendations and warnings

## Technical Implementation

### Core Features
- **TypeScript throughout** with comprehensive type definitions
- **Unit conversion system** supporting metric/imperial with accuracy standards
- **VDOT-based fitness calculations** using embedded lookup tables
- **Session storage persistence** with graceful fallback
- **Comprehensive validation** with real-time feedback
- **Responsive design** supporting mobile, tablet, and desktop

### Data Management
- **Static fitness data** with complete VDOT tables (30-85 range)
- **Plan level definitions** with dual-unit specifications
- **Goal race configurations** with training focus areas
- **Experience level mapping** to recommended plans
- **Altitude adjustment thresholds** with unit-aware calculations

### Validation Engine
- **Constraint validation** against plan levels and experience
- **Mileage compatibility** checking with safety warnings
- **Session duration** optimization for plan effectiveness
- **Goal race alignment** with training capacity
- **Altitude impact** assessment and pace adjustment warnings

## 📁 Project Structure

```
src/
├── components/                        # React components
│   ├── LandingScreen.tsx             # Phase 1.1 - Plan overview and methodology
│   ├── UserPreferencesScreen.tsx     # Phase 1.2 - Unit system selection
│   ├── FitnessAssessmentScreen.tsx   # Phase 1.3 - Experience and fitness evaluation
│   ├── TrainingConstraintsScreen.tsx # Phase 1.4 - Schedule and goal constraints
│   └── PlanGenerationScreen.tsx      # Phase 1.5 - Plan display and review
├── data/                             # Static data and configurations
│   ├── planLevels.ts                 # Plan level definitions (Foundation, Intermediate, Advanced, Elite)
│   ├── fitnessData.ts                # Experience levels and VDOT calculation utilities
│   ├── goalRaces.ts                  # Goal race configurations and training focus areas
│   ├── planGeneration.ts             # Core plan generation logic and algorithms
│   └── vdot_map.ts                   # Complete VDOT lookup tables (30-85 scores)
├── utils/                            # Utility functions and helpers
│   ├── __tests__/                    # Utility function tests
│   ├──── unitConversion.ts
│   ├──── sessionStorage.ts
│   └──── constraintValidation.ts
│   ├── unitConversion.ts             # Unit conversion engine with precision handling
│   ├── sessionStorage.ts             # Storage abstraction with error handling
│   └── constraintValidation.ts       # Training constraint validation and safety checks
├── types.ts                          # Comprehensive TypeScript type definitions
├── App.tsx                           # Main application with routing and state management
└── main.tsx                          # Application entry point and setup
```

## Running the Application

### Prerequisites
- **Node.js** v18.0.0 or higher
- **npm** v8.0.0 or higher (or yarn equivalent)

### Installation & Development
```bash
# Clone the repository
git clone <repository-url>
cd running-plan-generator

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Build Commands
```bash
# Development server with hot reload
npm run dev

# Create production build
npm run build

# Preview production build locally
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```


## Browser Compatibility

- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **JavaScript required**: Graceful fallback message for disabled JS
- **Session storage**: Warning displayed if unavailable

## Implementation Status

**Phase 1.1 ✅** - Landing Screen (Complete)  
**Phase 1.2 ✅** - User Preferences Screen (Complete)  
**Phase 1.3 ✅** - Fitness Assessment Screen (Complete)  
**Phase 1.4 ✅** - Training Constraints Screen (Complete)
**Next**: Phase 2 (Plan Generation Screen) implementation