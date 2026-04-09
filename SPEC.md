# Campaign Landing Page - Meta Pixel Test Demo

## Concept & Vision

A distinguished, trust-forward campaign landing page designed for an older demographic. The experience should feel like opening a well-crafted brochure from a respected community leader—warm yet professional, personal yet polished. Every element communicates credibility and approachability, making visitors feel they're engaging with someone genuine who understands their concerns.

## Design Language

### Aesthetic Direction
Inspired by classic American political print materials elevated for digital: think Eisenhower-era dignity meets modern web refinement. Clean typography-forward layouts with generous whitespace. No gimmicks—just substance presented beautifully.

### Color Palette
- **Primary Blue**: `#1e40af` (trust, stability, authority)
- **Secondary Blue**: `#3b82f6` (accessibility, approachability)
- **Warm White**: `#fafafa` (clean, open)
- **Soft Gray**: `#f1f5f9` (subtle depth)
- **Text Gray**: `#334155` (readable, not harsh)
- **Accent**: `#2563eb` (CTAs, emphasis)

### Typography
- **Headlines**: Georgia / Cambria (serif) - Classic, trustworthy, readable
- **Body**: System UI stack - Clean, accessible, modern
- **Scale**: Generous sizing for older eyes (base 18px, headlines 40-56px)

### Spatial System
- Section padding: 96-128px vertical
- Content max-width: 1200px
- Card gaps: 32-48px
- Component spacing: 8px rhythm

### Motion Philosophy
- **Reveals**: Fade up with 0.6s duration, ease-out curve
- **Hover states**: Scale 1.02, subtle shadow lift
- **Transitions**: 0.3s for interactions, 0.6s for reveals
- **Scroll**: Smooth native scrolling with intersection observer triggers
- **Background**: Extremely subtle gradient shift (optional, 20s cycle)

## Layout & Structure

### Section Flow (Top to Bottom)
1. **Hero** - Full viewport, centered message, single clear CTA
2. **Candidate Intro** - Two-column, photo + narrative
3. **Priorities** - Card grid, 3 columns desktop / 1 mobile
4. **Interest Form** - Centered form, trust indicators
5. **Footer** - Minimal, contact info, legal

### Visual Pacing
- Hero: Dramatic entry point with breathing room
- Intro: Warm, personal, slower reveal
- Priorities: Information density balanced with whitespace
- Form: Focused, reassuring, clear next steps

## Features & Interactions

### Navigation
- Fixed top nav with section links
- Smooth scroll on click
- Active state highlighting on scroll
- Nav becomes solid background on scroll (blur initially)

### Hero Section
- Large serif headline
- Subheadline explaining purpose
- Primary CTA: "Learn More" → scrolls to candidate intro
- Subtle animated gradient background (optional, very subtle)

### Candidate Introduction
- Professional photo placeholder
- Personal story paragraph
- Key qualifications as subtle list
- Warm, conversational tone

### Priority Cards
- 3 cards: Healthcare, Education, Economic Security
- Icon + title + brief description
- Hover: lift effect with shadow
- Staggered reveal animation

### Interest Form
- Name, Email, Phone (optional), Zip Code
- Checkbox: "I'm interested in supporting"
- Checkbox: "Please keep me informed"
- Submit button with loading state
- Success message on submit
- Form validation with helpful error messages

### Meta Pixel Events (All clearly commented)
1. **PageView** - On mount
2. **LearnMoreClick** - Hero CTA click
3. **SupportInterest** - "Interested in supporting" checkbox
4. **LeadSubmitted** - Form submission

## Component Inventory

### Button
- States: default (blue), hover (darker + lift), active (pressed), disabled (gray)
- Sizes: primary (large), secondary (medium)
- Smooth transitions, no harsh edges

### Input Field
- States: default, focus (blue ring), error (red ring + message), disabled
- Label above, helper text below
- Clear focus states for accessibility

### Card
- White background, subtle shadow
- Hover: enhanced shadow + slight lift
- Rounded corners (8px)

### Section Container
- Consistent padding
- Max-width constrained
- Centered alignment

## Technical Approach

### Stack
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Framer Motion for animations

### Architecture
- Single page (`app/page.tsx`)
- Client component for interactivity
- Meta Pixel code in script tag (head or body)
- Form state with React useState
- Intersection Observer via Framer Motion's `whileInView`

### Meta Pixel Implementation
- Placeholder Pixel ID: `PLACEHOLDER_PIXEL_ID`
- All events clearly commented with instructions
- fbq function calls with appropriate event names
- Test mode considerations noted

### Performance Considerations
- Minimal JavaScript bundle
- CSS-based animations where possible
- Lazy intersection observer triggers
- Optional background animation is lightweight (CSS only)
