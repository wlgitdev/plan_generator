# Running Plan Generator - Phase 1 Implementation

A React-based single-page application for generating personalised running training plans.

## Phase 1.1, 1.2 & 1.3 Implementation Complete

This implementation covers the first three screens of the application as specified in the UX design requirements:

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
- **Experience level assessment** with 4 levels and unit-aware mileage ranges
- **Race performance input** (optional) with intelligent time matching
- **Weekly mileage validation** with interactive slider and safety warnings
- **VDOT fitness score calculation** from complete embedded lookup tables
- **Training pace preview** showing all 5 intensity types when fitness calculated
- **Plan recommendation system** with override capability and safety warnings
- **Fuzzy race time matching** for approximate fitness scores with user feedback
- **Real-time validation** with contextual guidance messages

## Project Structure

```
src/
├── components/
│   ├── LandingScreen.tsx              # Phase 1.1 implementation
│   ├── UserPreferencesScreen.tsx      # Phase 1.2 implementation
│   └── FitnessAssessmentScreen.tsx    # Phase 1.3 implementation
├── data/
│   ├── fitnessData.ts                 # VDOT tables, experience levels, validation
│   └── planLevels.ts                  # Static plan level data
├── utils/
│   ├── unitConversion.ts              # Unit conversion utilities
│   └── sessionStorage.ts             # Storage abstraction
├── types.ts                           # TypeScript definitions with VDOT types
├── App.tsx                            # Main application component
├── main.tsx                           # Application entry point
├── index.css                          # Tailwind CSS and custom styles
└── index.html                         # HTML template
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
**Phase 1.4** - Training Constraints Screen (Next)