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

## Project Structure

```
src/
├── components/
│   ├── LandingScreen.tsx              # Phase 1.1 - Plan overview and entry
│   ├── UserPreferencesScreen.tsx      # Phase 1.2 - Unit system selection
│   ├── FitnessAssessmentScreen.tsx    # Phase 1.3 - Experience and fitness
│   └── TrainingConstraintsScreen.tsx  # Phase 1.4 - Schedule and goals
├── data/
│   ├── planLevels.ts                  # Plan level definitions and characteristics
│   ├── fitnessData.ts                 # Experience levels and VDOT calculations
│   ├── goalRaces.ts                   # Goal race configurations and focus areas
│   └── vdot_map.ts                    # Complete VDOT lookup tables
├── utils/
│   ├── unitConversion.ts              # Unit conversion utilities and validation
│   ├── sessionStorage.ts              # Storage abstraction with error handling
│   └── constraintValidation.ts        # Training constraint validation engine
├── types.ts                           # Comprehensive TypeScript definitions
├── App.tsx                            # Main application with state management
└── main.tsx                           # Application entry point
```

## Running the Application

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn package manager

### Installation & Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Build for Production
```bash
# Create production build
npm run build

# Preview production build
npm run preview
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