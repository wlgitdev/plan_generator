# UX Design
## Phase 1

### Screen-by-Screen UX Requirements

#### 1. Landing Screen
**Purpose**: User onboarding and methodology explanation

**Key Elements**:
- Hero section explaining scientific approach
- Plan level overview cards (4 levels)
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

---

#### 2. Fitness Assessment Screen
**Purpose**: Capture running experience and recent performance (FR-001 to FR-008)

**Key Elements**:
- **Experience Level Selector**: 4 clear options with weekly mileage ranges
- **Recent Race Input**: 
  - Distance dropdown (1500m to marathon)
  - Time input with format validation
  - "Skip race input" option
- **Current Weekly Mileage**: Slider with validation against experience level
- **Plan Level Recommendation**: Auto-suggested based on inputs with override option

**User Actions**:
- Select experience level
- Input race time (optional)
- Adjust weekly mileage
- Review/modify suggested plan level

**Validation Requirements**:
- Race time format validation
- Mileage compatibility with experience level
- Plan level safety warnings for mismatches

**Success Criteria**:
- Accurate fitness score calculation
- Appropriate plan level selection
- User understands chosen level implications

**Technical Notes**:
- Real-time fitness score calculation
- Embedded race-to-fitness lookup tables
- Form state management with validation

---

#### 3. Training Constraints Screen
**Purpose**: Capture schedule and goal constraints (FR-009 to FR-015)

**Key Elements**:
- **Training Days**: Interactive weekly calendar selector (3-7 days)
- **Session Duration**: Range slider with plan compatibility indicators
- **Goal Race**: Distance dropdown with brief descriptions
- **Altitude**: Optional elevation input with threshold indicator
- **Constraint Impact Display**: Real-time feedback on plan modifications

**User Actions**:
- Select available training days
- Set session duration preferences
- Choose goal race distance
- Input training altitude (if applicable)

**Validation Requirements**:
- Minimum 3 training days
- Duration compatibility with plan level
- Altitude threshold warnings (3000+ feet)

**Success Criteria**:
- Realistic constraint setting
- Understanding of constraint impacts
- Smooth progression to plan generation

**Technical Notes**:
- Real-time constraint validation
- Plan compatibility checking
- Altitude adjustment preview

---

#### 4. Plan Generation & Review Screen
**Purpose**: Display generated plan with paces and structure (FR-016 to FR-034)

**Key Elements**:
- **Training Paces Table**: All 5 intensities with contextual guidance
- **Plan Structure Overview**: 4 phases with descriptions and timelines
- **Weekly Sample**: Example week from each phase
- **Safety Indicators**: Progression warnings and guidelines
- **Educational Tooltips**: Pace explanations and workout purposes

**User Actions**:
- Review calculated paces
- Explore plan structure
- Access educational content
- Proceed to export

**Success Criteria**:
- Clear pace understanding
- Plan structure comprehension
- Confidence in plan appropriateness

**Technical Notes**:
- Fitness-to-pace table lookup
- Fixed plan structure generation
- Altitude adjustments applied
- Educational content overlay system

---

#### 5. Export & Download Screen
**Purpose**: Generate and deliver training plan (FR-035, FR-037)

**Key Elements**:
- **Export Options**: PDF format (Phase 1 scope)
- **Plan Summary**: Key details preview
- **Download Progress**: Generation status indicator
- **Success Confirmation**: Download completion feedback
- **Next Steps Guidance**: How to use the plan

**User Actions**:
- Initiate PDF generation
- Download completed plan
- Access usage guidance

**Success Criteria**:
- Reliable PDF generation
- Clear download completion
- User knows how to proceed

**Technical Notes**:
- PDF generation with embedded pace tables
- Plan data serialization
- Download progress feedback

---

### Responsive Design Requirements

#### Breakpoints
- **Mobile**: 320px - 768px (single column, simplified inputs)
- **Tablet**: 768px - 1024px (adapted layouts, touch-friendly)
- **Desktop**: 1024px+ (full feature display)

#### Mobile Adaptations
- Simplified pace tables (swipe/accordion)
- Step-by-step calendar selection
- Touch-optimized form controls
- Progressive disclosure for complex information

---

### Accessibility Requirements

#### WCAG 2.1 Compliance
- **Level AA** contrast ratios
- **Keyboard navigation** for all interactions
- **Screen reader** compatible markup
- **Focus management** across steps

#### Specific Requirements
- Form labels and validation messaging
- Alt text for informational graphics
- Logical tab order through assessment
- Error state announcements

---

### Performance Requirements

#### Loading Targets
- **Initial page load**: < 2 seconds
- **Step transitions**: < 500ms
- **Plan generation**: < 3 seconds
- **PDF export**: < 5 seconds

#### Optimization Strategies
- Embedded lookup tables (no API calls)
- Lazy loading for non-critical components
- Optimized bundle splitting
- Progressive enhancement

---

### Error Handling Requirements

#### User Error Categories
1. **Input Validation**: Real-time feedback with correction guidance
2. **Constraint Conflicts**: Warning messages with suggested alternatives
3. **Plan Generation**: Fallback options with explanation
4. **Export Failures**: Retry mechanisms with error explanation

#### Error UX Patterns
- Inline validation with clear messaging
- Summary error display before progression
- Progressive disclosure of error details
- Recovery action suggestions

---

#### Development Phases
1. **Core Flow**: Assessment → Generation → Basic Export
2. **Validation**: Comprehensive error handling
3. **Polish**: Animations, micro-interactions, educational content
4. **Testing**: Usability validation and refinement