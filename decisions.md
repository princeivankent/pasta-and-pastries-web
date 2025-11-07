# Architectural Decisions

## 2025-11-08

### Technology Stack
- **Framework**: Angular 19.2.0 (latest, with standalone components)
- **Styling**: Tailwind CSS 3.4.18 + DaisyUI 5.4.7
- **Theme**: DaisyUI Cupcake (warm pastel tones for food/pastry business)
- **Rendering**: SSR enabled for better SEO and performance

### Critical Decision: Tailwind CSS Version (2025-11-08)
**Decision**: Downgraded from Tailwind CSS v4.1.17 to v3.4.18

**Rationale**:
- DaisyUI 5.4.7 is NOT compatible with Tailwind CSS v4
- Tailwind v4 uses CSS-based configuration (`@theme` directive), not JavaScript config
- Tailwind v4 doesn't support traditional plugins like DaisyUI
- DaisyUI requires Tailwind v3.x plugin system to load component classes

**Impact**:
- All DaisyUI component classes now work correctly (.hero, .btn, .navbar, .card, etc.)
- Configuration uses traditional `tailwind.config.js` with `module.exports`
- Styles use `@tailwind base/components/utilities` directives instead of `@import 'tailwindcss'`
- Removed `.postcssrc.json` (not needed for Tailwind v3)

**Future Considerations**:
- When DaisyUI releases v4-compatible version, can upgrade to Tailwind v4
- Alternative: Remove DaisyUI and rebuild components with pure Tailwind v4
- Current setup is stable and production-ready

### Component Architecture
- **Pattern**: Standalone components (no NgModules)
- **State Management**: Service-based (ProductsService, TestimonialsService)
- **Data Strategy**: Mock data for initial development, structured for easy replacement

### File Structure
- **Models**: `/src/app/models/` - TypeScript interfaces
- **Services**: `/src/app/services/` - Data providers
- **Components**: Feature-based organization (pages + shared components)
- **Assets**: `/src/assets/images/` - Organized by type (products, logo, hero)

### Styling Decisions
- **Utility-First**: Tailwind CSS for rapid development
- **Component Library**: DaisyUI for pre-built UI components
- **Responsive**: Mobile-first approach with DaisyUI breakpoints
- **Theme Customization**: Using DaisyUI's Cupcake theme without customization

### Routing Strategy
- **Type**: Client-side routing with Angular Router
- **Structure**: Flat routing (Home, Menu, About, Contact)
- **Lazy Loading**: Not implemented initially (can be added later for optimization)

### Data Management
- **Products**: 8 mock products (4 pasta, 4 pastries)
- **Testimonials**: 4 sample testimonials with ratings
- **Best Sellers**: Flag-based selection (isBestSeller property)

### Design System Refinement (2025-11-08)
**Decision**: Aligned design with provided mockup while maintaining DaisyUI Cupcake theme

**Changes Made**:
1. **Color Palette**:
   - Added custom accent-red (#B23A48) for primary buttons and testimonial section
   - Kept DaisyUI Cupcake theme as base for light, warm aesthetic
   - Changed footer to dark (neutral) background for contrast

2. **Visual Elements**:
   - Created SVG illustrations for hero lasagna and product cards
   - Lasagna: Layered rectangles with brown/tan tones
   - Product cards: Category-specific illustrations (layered for pasta, dotted cookie for pastries)
   - All illustrations use consistent color palette (#D4A574, #C9896B, #E8C9A0, #8B6F47)

3. **Button Styling**:
   - Override DaisyUI primary button with custom red (#B23A48)
   - Applied to: hero CTA, navbar button, order CTA, contact form submit
   - Consistent hover effect: 90% opacity

4. **Layout Improvements**:
   - Hero section: Side-by-side layout on desktop (text left, illustration right)
   - Product cards: Increased spacing (gap-8), added border for depth
   - Testimonials: Red background with white text, flexible layout for stars

**Rationale**:
- Maintains warm, inviting feel appropriate for family bakery/restaurant
- Red accent creates strong CTAs while staying cohesive with food theme
- SVG illustrations keep bundle size small while providing visual interest
- Light theme (cupcake) ensures readability and comfort

**Alternative Considered**:
- Creating fully custom DaisyUI theme vs. extending cupcake with overrides
- Chose override approach for faster iteration and maintaining DaisyUI defaults

### Complete UI/UX Redesign (2025-11-08)
**Decision**: Complete overhaul of the design system based on mockup feedback

**Problem Identified**:
- Original implementation had broken layout (mobile menu visible on desktop)
- Hero section had image on right instead of left
- Color scheme too bright/white, didn't match warm mockup tones
- Cards too wide and poorly proportioned
- Typography hierarchy insufficient
- Overall spacing and visual hierarchy poor

**Solution Implemented**:
1. **Custom DaisyUI Theme ("pastahaus")**:
   - Replaced generic cupcake theme with custom warm beige palette
   - base-100: #FFF8F0 (warm cream background)
   - base-200: #F5E6D3 (light beige for cards)
   - base-300: #E8D5BC (medium beige accents)
   - Maintains consistency across all components

2. **Navbar Restructure**:
   - Brand logo/text on left
   - Desktop menu on right (removed center positioning)
   - Mobile-only hamburger menu (hidden on lg+ screens)
   - Cleaner, more professional layout

3. **Hero Section Complete Redesign**:
   - **Image Position**: Moved to left side (from right)
   - **Layout**: Two-column flex with proper order control
   - **Image Enhancement**: Added more detailed lasagna SVG with shading/depth
   - **Typography**: Increased to 6xl on desktop for better hierarchy
   - **Spacing**: Generous py-24 on desktop, proper gaps

4. **Product Card Improvements**:
   - **Proportions**: aspect-square for image containers
   - **Typography**: Increased to 2xl for names, better readability
   - **Hover States**: Border color changes to red on hover
   - **Layout**: Better padding (px-8 pt-8, py-8 for content)
   - **Visual Interest**: Larger SVG illustrations

5. **Grid & Layout Optimization**:
   - Best Sellers: Proper 4-column grid (1/2/4 breakpoints)
   - Consistent max-width containers (max-w-7xl)
   - Improved gap spacing (gap-6 instead of gap-8)

6. **Section Styling**:
   - **About**: Increased heading size (5xl), better spacing (py-20)
   - **Testimonials**: Stars in white rounded badge, better contrast
   - **CTA Section**: Larger text (3xl-4xl), better button sizing
   - **Footer**: 3-column grid, better information hierarchy

**Technical Implementation**:
- Modified `tailwind.config.js` with custom theme definition
- Updated all component templates for new layout structure
- Enhanced SVG graphics with more detail and depth
- Improved responsive breakpoints and mobile ordering

**Rationale**:
- User-provided mockup clearly showed layout issues
- Warm beige palette more appropriate for artisan bakery brand
- Better visual hierarchy improves user experience
- Proper layout matching mockup ensures client satisfaction

**Impact**:
- Dramatically improved visual design matching mockup
- Better responsive behavior across all breakpoints
- Enhanced user experience with clear hierarchy
- Professional appearance suitable for production deployment

### UI Polish & Branding Update (2025-11-08)
**Decision**: Enhanced UI spacing, form UX, and rebranded from "Pasta Haus" to "Pasta & Pastries"

**Changes Made**:
1. **Card Padding Enhancement**:
   - Added `p-8` to all card-body elements on About and Contact pages
   - Improves content breathing room and visual hierarchy
   - Creates more polished, professional appearance

2. **Contact Form UX Improvements**:
   - Increased label font size and weight (`text-base font-semibold`)
   - Made inputs larger with `input-lg` and `textarea-lg` classes
   - Improved form spacing from `space-y-4` to `space-y-6`
   - Better touch targets for mobile users
   - Easier to read and interact with

3. **Brand Name Change**:
   - Changed from "Pasta Haus" to "Pasta & Pastries" throughout entire app
   - Updated in: Navbar, Footer (2 locations), Home page (3 locations), About page (2 locations)
   - Better reflects dual focus on pasta dishes and baked goods
   - More descriptive and clearer brand identity

4. **Button Style Consistency**:
   - Added `rounded-full` class to all buttons across the app
   - Creates softer, more inviting appearance
   - Matches modern design trends for food/restaurant sites
   - Applied to 5 buttons: About CTAs (2), Home CTAs (2), Contact submit (1)

**Rationale**:
- Generous padding improves readability and reduces visual clutter
- Larger form inputs improve accessibility and usability
- "Pasta & Pastries" is more descriptive than "Pasta Haus"
- Rounded buttons feel friendlier and more approachable for food business
- Consistent button styling creates cohesive design language

**Impact**:
- Better UX on contact form (easier to fill out)
- More professional card presentation with breathing room
- Clearer brand identity that describes business offerings
- Modern, friendly button aesthetic throughout site

### Dark Mode Removal (2025-11-08)
**Decision**: Disabled dark mode and forced light theme only

**Rationale**:
- Brand identity requires consistent warm, light color palette (#FFF8F0 cream, beige tones)
- Restaurant/bakery aesthetic depends on warm, inviting colors that don't translate well to dark mode
- Single theme simplifies design and reduces testing surface area
- Custom "pastahaus" theme was specifically designed for light mode with warm colors

**Implementation**:
- Added `data-theme="pastahaus"` to `<html>` element in index.html
- Set `darkTheme: false` in tailwind.config.js DaisyUI configuration
- DaisyUI will no longer respond to system color scheme preferences

**Trade-offs**:
- Users who prefer dark mode won't have that option
- However, the warm, light aesthetic is core to the brand and more important than theme flexibility
