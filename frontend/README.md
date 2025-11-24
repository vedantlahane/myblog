# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Design System Overview

The application ships with a minimalist, content-first design language focused on readability and progressive learning. Key building blocks include:

- **Typography and Layout** – All headings and body copy use the Inter/Poppins family pairings with predefined sizes (`h1`, `h2`, `h3`, `body`) exposed through Tailwind utilities. Layout is constrained to a `max-width` of 1200px with fluid padding via the `.container-responsive` helper.
- **Color Tokens** – Light and dark themes are driven by CSS custom properties (see `src/styles.css`). Primary accent colors are deep navy `#1F2937`, mint `#10B981`, and coral `#EF4444`, with neutral shades for surfaces and typography.
- **Cards & Utilities** – Use the `.blog-card` class for content summaries, `.grid-responsive` for auto-fit grids, `.btn-primary` / `.btn-secondary` for CTAs, and `.btn-pill` for category filters.
- **Animations & Interactions** – Elements with `data-animate="fade"` or the `.blog-card` class animate in via Intersection Observer. Touch targets default to at least 44px, and the design respects `prefers-reduced-motion`.
- **Code Blocks** – `pre > code` blocks get a built-in “Copy” button, a dark surface, and rounded corners. To opt-out of lazy loading for specific media, add `data-priority="true"` to the `<img>` element.

### Theming

- A theme toggle is available in the header; the current theme is persisted to `localStorage` (`motherworld:theme`).
- Global CSS variables provide the light/dark palettes. To override or extend colors, adjust the token definitions in `src/styles.css`.
- Tailwind is configured for both themes with semantic color aliases (`primary`, `success`, `danger`, etc.) that reference the CSS variables.

### Performance Enhancements

- A reading progress indicator appears at the top of the viewport based on scroll position.
- Images automatically opt into `loading="lazy"` and `decoding="async"` unless explicitly marked as priority.
- Intersection Observer powers on-scroll reveals. When adding custom sections, include `data-animate="fade"` to participate in the animation sequence.
