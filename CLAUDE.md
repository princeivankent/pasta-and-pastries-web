# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pasta Haus is a restaurant/bakery website built with Angular 19, Tailwind CSS 4, and DaisyUI 5. The site showcases homemade pasta and freshly baked pastries with features for menu browsing, company information, and contact.

## Development Commands

### Running the Application
```bash
npm start              # Start dev server on http://localhost:4200
ng serve              # Alternative to npm start
```

### Building
```bash
npm run build         # Production build (outputs to dist/)
npm run watch         # Development build with file watching
```

### Testing
```bash
npm test              # Run unit tests with Karma
ng test               # Alternative test command
```

### SSR (Server-Side Rendering)
```bash
npm run build                                    # Build first
npm run serve:ssr:pasta-and-pastries-web        # Run SSR server
```

### Code Generation
```bash
ng generate component component-name --standalone --skip-tests
ng generate service services/service-name
```

## Architecture

### Component Pattern
This project uses **Angular 19 standalone components** exclusively - no NgModules. All components must:
- Import dependencies directly in the `imports` array
- Use `standalone: true` in the component decorator
- Be generated with `--standalone` flag

### Styling Architecture
- **Tailwind CSS 4.x**: Utility-first styling via `src/styles.scss`
- **DaisyUI 5.x**: Component library with "cupcake" theme
- **SCSS**: Component-level styles (default via angular.json)
- **Important**: Use HTML entity `&#64;` instead of `@` in templates to avoid Angular block syntax errors

### File Organization
```
src/app/
├── components/          # Shared UI components
│   ├── navbar/         # Responsive navigation with mobile menu
│   ├── footer/         # Footer with contact info, social links
│   └── product-card/   # Reusable product display card
├── pages/              # Route-level page components
│   ├── home/          # Homepage with hero, best sellers, testimonials
│   ├── menu/          # Product catalog with category filtering
│   ├── about/         # Company story and mission
│   └── contact/       # Contact form and business info
├── models/            # TypeScript interfaces (Product, Testimonial)
├── services/          # Data services (ProductsService, TestimonialsService)
└── app.routes.ts      # Routing configuration
```

### Data Management
- **Services**: Injectable services in `src/app/services/` provide mock data
- **Models**: TypeScript interfaces in `src/app/models/` define data structures
- **Current Data**: 8 mock products (4 pasta, 4 pastries), 4 testimonials
- **Future**: Replace mock data in services with real API calls or CMS integration

### Routing
- Flat routing structure: `/`, `/menu`, `/about`, `/contact`
- Wildcard redirect (`**`) sends to homepage
- SSR enabled for all routes

### State Management
Simple service-based state management:
- `ProductsService`: Product catalog and filtering
- `TestimonialsService`: Customer testimonials

No complex state management (NgRx, Akita) is used.

### Key Technical Constraints

1. **Template @ Symbol**: Must use `&#64;` HTML entity for email addresses in templates (e.g., `hello&#64;pastahaus.com`) to avoid Angular 19 block syntax conflicts.

2. **Tailwind Import Warning**: `@import 'tailwindcss'` in `styles.scss` shows deprecation warning - this is expected and non-blocking until Dart Sass 3.0.0.

3. **SSR Configuration**: Server-side rendering is enabled by default. Build outputs both browser and server bundles.

4. **DaisyUI Theme**: Currently using "cupcake" theme. To change, edit `tailwind.config.js` `daisyui.themes` array.

## Project-Specific Patterns

### Adding New Products
Edit `src/app/services/products.service.ts` and add to the `products` array following the `Product` interface.

### Adding New Pages
1. Generate: `ng generate component pages/page-name --standalone --skip-tests`
2. Add route to `src/app/app.routes.ts`
3. Add navigation link to `src/app/components/navbar/navbar.component.html`

### DaisyUI Components
This project uses DaisyUI component classes extensively:
- Cards: `card`, `card-body`, `card-title`
- Buttons: `btn`, `btn-primary`, `btn-ghost`
- Navigation: `navbar`, `menu`, `dropdown`
- Forms: `input`, `textarea`, `form-control`, `label`

Reference: https://daisyui.com/components/

### Responsive Design
Mobile-first with DaisyUI/Tailwind breakpoints:
- Base: mobile styles
- `md:`: tablet (768px+)
- `lg:`: desktop (1024px+)
- `xl:`: large desktop (1280px+)

## Documentation Files

- `decisions.md`: Architectural decisions and rationale
- `progress.md`: Implementation progress and feature checklist
- `bugs.md`: Known issues and future improvements
- Follow the coding standard for maintainable code and always check if there's an existing component available in Tailwind and DaisyUI before creating a new one. And always follow the coding/pattern of these UI framework.