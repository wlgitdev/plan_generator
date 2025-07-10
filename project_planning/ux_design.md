# UX Design

only use a limited amount of external libraries for components, if possible only lucide-react.

## Phase 1

### Screen-by-Screen UX Requirements

#### 1. Landing Screen
**Purpose**: User onboarding and methodology explanation

**Key Elements**:
- Hero section explaining scientific approach
- Plan level overview cards (4 levels) with distance examples in both units
- Clear "Start Assessment" CTA
- Brief methodology credibility indicators

**User Actions**:
- Click "Start Assessment"
- Browse plan level information

**Success Criteria**:
- User understands plan differences
- Clear path to begin assessment

**Technical Notes**:
- No data persistence required
- Static content with hover states
- Distance examples display both metric and imperial for universal appeal

---

#### 2. User Preferences Screen
**Purpose**: Capture unit preferences and basic setup (FR-016 to FR-021)

**Key Elements**:
- **Unit System Selector**: Clear toggle between Metric and Imperial
  - Metric: km, m/s pace (mm:ss/km), meters altitude
  - Imperial: miles, mile pace (mm:ss/mi), feet altitude
- **Preview Examples**: Live preview of how paces/distances will display
- **Regional Default**: Auto-detect based on browser locale with override option
- **Preference Persistence**: Maintain selection throughout session

**User Actions**:
- Select preferred unit system
- Preview measurement formats
- Confirm selection to proceed

**Validation Requirements**:
- Clear format examples for each unit system
- Immediate preview updates when selection changes

**Success Criteria**:
- User understands measurement format implications
- Confident unit system selection
- Preview demonstrates consistent formatting

**Technical Notes**:
- Real-time unit conversion preview
- Session storage for preference persistence
- Locale-based intelligent defaults

---

#### 3. Fitness Assessment Screen
**Purpose**: Capture running experience and recent performance (FR-001 to FR-008, FR-022 to FR-027)

**Key Elements**:
- **Experience Level Selector**: 4 clear options with weekly mileage ranges in user's preferred units
- **Recent Race Input**: 
  - Distance dropdown (1500m to marathon) displaying in preferred units
  - Time input with format validation
  - "Skip race input" option
- **Current Weekly Mileage**: Slider with validation against experience level (displayed in preferred units)
- **Plan Level Recommendation**: Auto-suggested based on inputs with override option
- **Unit Consistency Indicator**: Subtle reminder of selected unit system

**User Actions**:
- Select experience level
- Input race time (optional)
- Adjust weekly mileage
- Review/modify suggested plan level

**Validation Requirements**:
- Race time format validation
- Mileage compatibility with experience level
- Plan level safety warnings for mismatches
- Unit-aware validation thresholds

**Success Criteria**:
- Accurate fitness score calculation
- Appropriate plan level selection
- User understands chosen level implications
- All measurements display consistently in preferred units

**Technical Notes**:
- Real-time fitness score calculation
- Embedded race-to-fitness lookup tables
- Form state management with validation
- Unit-aware mileage validation (e.g., 10 mpw = 16 kpw)

---

#### 4. Training Constraints Screen
**Purpose**: Capture schedule and goal constraints (FR-009 to FR-015)

**Key Elements**:
- **Training Days**: Interactive weekly calendar selector (3-7 days)
- **Session Duration**: Range slider with plan compatibility indicators
- **Goal Race**: Distance dropdown with brief descriptions in preferred units
- **Altitude**: Optional elevation input with threshold indicator in preferred units
  - Metric: 914m threshold display
  - Imperial: 3,000ft threshold display
- **Constraint Impact Display**: Real-time feedback on plan modifications

**User Actions**:
- Select available training days
- Set session duration preferences
- Choose goal race distance
- Input training altitude (if applicable)

**Validation Requirements**:
- Minimum 3 training days
- Duration compatibility with plan level
- Altitude threshold warnings (3000ft/914m) with unit-appropriate messaging

**Success Criteria**:
- Realistic constraint setting
- Understanding of constraint impacts
- Smooth progression to plan generation
- Clear altitude threshold understanding in user's units

**Technical Notes**:
- Real-time constraint validation
- Plan compatibility checking
- Altitude adjustment preview with unit conversion
- Unit-aware threshold validation

---

#### 5. Plan Generation & Review Screen
**Purpose**: Display generated plan with paces and structure (FR-022 to FR-037)

**Key Elements**:
- **Training Paces Table**: All 5 intensities with contextual guidance in preferred units
  - Metric: Display as mm:ss/km with meters for track intervals
  - Imperial: Display as mm:ss/mi with yards for track intervals
- **Unit Conversion Reference**: Expandable table showing equivalent paces in both systems
- **Plan Structure Overview**: 4 phases with descriptions and timelines
- **Weekly Sample**: Example week from each phase with distances in preferred units
- **Safety Indicators**: Progression warnings and guidelines
- **Educational Tooltips**: Pace explanations and workout purposes
- **Altitude Adjustments**: Clear indication if altitude adjustments applied with unit-appropriate display

**User Actions**:
- Review calculated paces
- Explore plan structure
- Access educational content
- Toggle unit conversion reference
- Proceed to export

**Success Criteria**:
- Clear pace understanding in preferred units
- Plan structure comprehension
- Confidence in plan appropriateness
- Easy access to unit conversions for reference

**Technical Notes**:
- Fitness-to-pace table lookup with unit conversion
- Fixed plan structure generation
- Altitude adjustments applied with unit-aware display
- Educational content overlay system
- Real-time unit conversion for reference

---

#### 6. Export & Download Screen
**Purpose**: Generate and deliver training plan (FR-044 to FR-050)

**Key Elements**:
- **Export Options**: PDF format (Phase 1 scope) with unit system confirmation
- **Plan Summary**: Key details preview in user's preferred units
- **Unit Reference Option**: Choice to include conversion tables in export
- **Download Progress**: Generation status indicator
- **Success Confirmation**: Download completion feedback
- **Next Steps Guidance**: How to use the plan with unit-specific examples

**User Actions**:
- Confirm unit system for export
- Choose to include conversion reference tables
- Initiate PDF generation
- Download completed plan
- Access usage guidance

**Success Criteria**:
- Reliable PDF generation with correct units
- Clear download completion
- User knows how to proceed
- Optional conversion tables for flexibility

**Technical Notes**:
- PDF generation with embedded pace tables in selected units
- Optional dual-unit conversion tables in export
- Plan data serialization with unit metadata
- Download progress feedback
- Unit-consistent formatting throughout export

---

### Unit System Management

#### Unit Consistency Requirements
- **Single Source of Truth**: User preference drives all displays
- **No Mixed Units**: All measurements on same screen use same system
- **Clear Indicators**: Subtle unit system reminders throughout interface
- **Conversion Access**: Easy reference to alternate units when needed

#### Conversion Accuracy Standards
- **Pace Conversions**: Maintain 1-second precision
- **Distance Conversions**: Appropriate precision for context (0.1km/0.1mi for runs)
- **Altitude Conversions**: 10m/50ft precision for altitude adjustments
- **Validation Thresholds**: Unit-aware validation (3000ft = 914m)

#### Error Prevention
- **Threshold Warnings**: Display thresholds in user's units
- **Input Validation**: Accept input in user's preferred units
- **Confirmation Displays**: Show conversions for critical values
- **Export Consistency**: Maintain unit system in all export formats

---

### Responsive Design Requirements

#### Breakpoints
- **Mobile**: 320px - 768px (single column, simplified inputs)
- **Tablet**: 768px - 1024px (adapted layouts, touch-friendly)
- **Desktop**: 1024px+ (full feature display)

#### Mobile Adaptations
- Simplified pace tables (swipe/accordion) with unit headers
- Step-by-step calendar selection
- Touch-optimized form controls
- Progressive disclosure for complex information
- Compact unit conversion displays

#### Unit Display Adaptations
- **Mobile**: Primary unit only with conversion access
- **Tablet**: Primary unit with inline conversion option
- **Desktop**: Primary unit with expandable conversion tables

---

### Accessibility Requirements

#### WCAG 2.1 Compliance
- **Level AA** contrast ratios
- **Keyboard navigation** for all interactions
- **Screen reader** compatible markup with unit announcements
- **Focus management** across steps

#### Specific Requirements
- Form labels and validation messaging with unit context
- Alt text for informational graphics including unit references
- Logical tab order through assessment
- Error state announcements with unit-appropriate messaging
- Screen reader announcements for unit system changes

#### Unit-Specific Accessibility
- **Clear Unit Labeling**: All measurements include unit abbreviations
- **Conversion Announcements**: Screen reader feedback for unit changes
- **Threshold Explanations**: Accessible explanations of unit-specific thresholds
- **Consistent Terminology**: Same unit terms throughout interface

---

### Performance Requirements

#### Loading Targets
- **Initial page load**: < 2 seconds
- **Step transitions**: < 500ms
- **Plan generation**: < 3 seconds
- **PDF export**: < 5 seconds

#### Optimization Strategies
- Embedded lookup tables (no API calls) with pre-calculated conversions
- Lazy loading for non-critical components
- Optimized bundle splitting
- Progressive enhancement
- Cached conversion calculations

#### Unit Conversion Performance
- **Pre-calculated Tables**: Both unit systems stored to avoid runtime conversion
- **Conversion Caching**: Cache user's preferred conversions
- **Batch Conversions**: Convert all displayed values simultaneously
- **Minimal Recalculation**: Only convert when user changes preference

---

### Error Handling Requirements

#### User Error Categories
1. **Input Validation**: Real-time feedback with correction guidance in user's units
2. **Constraint Conflicts**: Warning messages with suggested alternatives using appropriate units
3. **Plan Generation**: Fallback options with explanation including unit context
4. **Export Failures**: Retry mechanisms with error explanation
5. **Unit Conversion Errors**: Graceful handling of conversion edge cases

#### Error UX Patterns
- Inline validation with clear messaging in user's preferred units
- Summary error display before progression
- Progressive disclosure of error details
- Recovery action suggestions

---

#### Development Phases
1. **Core Flow**: Unit preference → Assessment → Generation → Basic Export
2. **Validation**: Comprehensive error handling
3. **Polish**: Animations, micro-interactions, educational content
4. **Testing**: Usability validation and refinement

#### Conversion Accuracy Standards
- **Pace Precision**: 1-second accuracy for all pace conversions
- **Distance Precision**: Context-appropriate rounding (0.1km for runs, 10m for intervals)
- **Altitude Precision**: 10m/50ft increments for adjustment calculations
- **Validation Consistency**: Same thresholds regardless of input unit system