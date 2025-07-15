# Running Plan Generator

A React-based single-page application for generating personalised running training plans.

## Phase 1 Implementation Status

This implementation covers all six screens of Phase 1 as specified in the UX design requirements:

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

### ⚠️ Phase 1.5 - Plan Generation & Review Screen (Partial)
- **✅ Personalized training paces** calculated from VDOT or estimated from experience
- **✅ Phase structure overview** with 4 progressive phases (Base → Tempo → Integration → Peak)
- **✅ Altitude adjustments** automatically applied when training above thresholds
- **✅ Unit conversion reference** showing equivalent paces in alternate system
- **✅ Educational guidance** covering progression principles and safety guidelines
- **❌ MISSING: Complete 20-week plan generation** (only shows phase overviews, not 140 daily workouts)
- **❌ MISSING: Week-by-week workout specifications** (sample weeks only, not full progression)
- **❌ MISSING: Daily workout details** (type, pace, distance, duration for each of 140 days)

### ⚠️ Phase 1.6 - Export & Download Screen (Partial)
- **✅ PDF export functionality** with user's preferred unit system
- **✅ Plan summary preview** showing key details before download
- **✅ Unit system confirmation** with optional conversion tables
- **✅ Progress indicator** during PDF generation
- **✅ Download completion feedback** with retry capability
- **✅ Next steps guidance** for plan implementation and tracking
- **✅ Error handling** with graceful retry mechanisms
- **❌ MISSING: Complete plan export** (PDF contains summary only, not full 20-week schedule)

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
│   ├── PlanGenerationScreen.tsx      # Phase 1.5 - Plan display and review (INCOMPLETE)
│   └── ExportDownloadScreen.tsx      # Phase 1.6 - PDF export and download (INCOMPLETE)
├── data/                             # Static data and configurations
│   ├── planLevels.ts                 # Plan level definitions (Foundation, Intermediate, Advanced, Elite)
│   ├── fitnessData.ts                # Experience levels and VDOT calculation utilities
│   ├── goalRaces.ts                  # Goal race configurations and training focus areas
│   ├── planGeneration.ts             # Core plan generation logic (NEEDS EXPANSION)
│   └── vdot_map.ts                   # Complete VDOT lookup tables (30-85 scores)
├── utils/                            # Utility functions and helpers
│   ├── __tests__/                    # Utility function tests
│   ├──── unitConversion.test.ts
│   ├──── sessionStorage.test.ts
│   └──── constraintValidation.test.ts
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

- **Phase 1.1 ✅** - Landing Screen (Complete)  
- **Phase 1.2 ✅** - User Preferences Screen (Complete)  
- **Phase 1.3 ✅** - Fitness Assessment Screen (Complete)  
- **Phase 1.4 ✅** - Training Constraints Screen (Complete)  
- **Phase 1.5 ⚠️** - Plan Generation & Review Screen (UI complete, missing plan generation engine)  
- **Phase 1.6 ⚠️** - Export & Download Screen (UI complete, missing complete plan export)

**Next Steps**: Implement core plan generation engine to create complete 20-week training plans with 140 daily workout specifications as required by FR-028-030.