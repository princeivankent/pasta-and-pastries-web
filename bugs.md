# Bug Reports

## Known Issues

### Non-Blocking Warnings
1. **DaisyUI Selector Warning** (Low Priority)
   - **Location**: DaisyUI v5.4.7 CSS generation
   - **Issue**: `.tabs-bottom>+.tab-content -> Did not expect successive traversals`
   - **Impact**: Non-blocking, does not affect functionality
   - **Status**: Known DaisyUI issue, tabs component works correctly
   - **Note**: Can be ignored, will be resolved in future DaisyUI release

## Resolved Issues

### ✅ Mobile Hamburger Menu Not Working (2025-11-08)
- **Issue**: Hamburger menu button visible on mobile but non-functional
- **Root Cause**:
  - Button had no click event handler
  - No mobile menu dropdown markup existed
  - Component had no state management for menu open/closed
  - Missing CommonModule import for *ngIf directive
- **Resolution**: Implemented complete mobile menu functionality
- **Changes Made**:
  - Added `isMobileMenuOpen` boolean property to track menu state
  - Added `toggleMobileMenu()` method to handle button clicks
  - Added `closeMobileMenu()` method to close menu after navigation
  - Imported CommonModule for *ngIf support
  - Created mobile navigation dropdown with conditional rendering
  - Added icon toggle between hamburger and close (X) icons
  - Added click handlers to close menu when navigating
  - Applied proper responsive classes (lg:hidden)
- **Files Modified**:
  - `src/app/components/navbar/navbar.component.ts` (added state + methods)
  - `src/app/components/navbar/navbar.component.html` (added mobile menu dropdown)
- **Result**: Mobile menu now fully functional with smooth open/close behavior

## Resolved Issues

### ✅ Tailwind CSS v4 Incompatibility (2025-11-08)
- **Issue**: No styles were being applied to the application
- **Root Cause**:
  - Tailwind CSS v4.1.17 incompatible with DaisyUI 5.4.7
  - DaisyUI requires Tailwind v3.x plugin system
  - Tailwind v4 uses CSS-based configuration, not JavaScript
- **Resolution**: Downgraded to Tailwind CSS v3.4.18
- **Changes Made**:
  - Updated `package.json`: `tailwindcss: ^3.4.18`
  - Removed `@tailwindcss/cli` and `@tailwindcss/postcss` packages
  - Updated `src/styles.scss` to use `@tailwind` directives
  - Removed `.postcssrc.json` (not needed for v3)
- **Result**: All styles now loading correctly, DaisyUI components working

### ✅ Sass @import Deprecation Warning (2025-11-08)
- **Issue**: `@import 'tailwindcss'` triggered Sass deprecation warning
- **Resolution**: Changed to `@tailwind base/components/utilities` directives
- **Status**: Resolved with Tailwind v3 migration

## Future Improvements
- Consider migrating to Sass @use syntax when Tailwind CSS supports it
- Add lazy loading for routes to improve initial load time
- Implement image optimization for product photos
