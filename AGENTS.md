# Repository Guidelines

## Project Structure & Module Organization
- **Feature-based architecture**: Code organized by feature in `src/features/` (whiteboard, draft, text-editor, playground)
- **Shared resources**: Common code in `src/shared/` (api, components, contexts, hooks, types, utils, services, lib)
- **App entry**: `src/app/` contains `main.tsx` and `App.tsx`
- **Configuration**: `src/config/` for constants and environment settings
- **Assets**: `src/assets/` for fonts and images
- **Styles**: `src/styles/` for global SCSS and CSS
- **Pages**: `src/pages/` for top-level page components
- **Tests**: `test/` holds Vitest specs (e.g., `sum.test.ts`, `ReDrawController.test.ts`)
- **Path aliases**: Use `@app/*`, `@features/*`, `@shared/*`, `@config/*`, `@assets/*`, `@styles/*`, `@pages/*`

## Build, Test, and Development Commands
- `npm run dev` — Start Vite dev server with HMR.
- `npm run build` — Type-check (`tsc`) and produce production build.
- `npm run preview` — Serve the built app locally.
- `npm run test` — Run unit/component tests via Vitest.
- `npm run coverage` — Execute tests and report coverage.
- `npm run lint` — Lint TypeScript/TSX with ESLint.

## Coding Style & Naming Conventions
- Language: TypeScript + React 18; bundler: Vite.
- Indentation: 2 spaces; keep imports sorted and unused code removed (ESLint will flag).
- Components: `PascalCase.tsx` in feature or shared components folders.
- Hooks: `useX.ts` (e.g., `useWhiteboard.ts`) in feature or shared hooks folders.
- Utilities/services: `CamelCase.ts`.
- Styles: SCSS modules as `*.module.scss`; global styles in `src/styles/*.scss`.
- Prefer clear named exports where practical; avoid long files—split by concern.
- Use path aliases for imports (e.g., `@shared/utils/CommonUtils` instead of relative paths).

## Testing Guidelines
- Framework: Vitest with Testing Library (`@testing-library/react`).
- Location: `test/` with `*.test.ts[x]` naming. Example: `test/ReDrawController.test.ts`.
- Cover core logic in `src/shared/utils`, hooks, and critical UI interactions. Run `npm run coverage` before PRs.

## Commit & Pull Request Guidelines
- Commits: imperative, concise subjects (e.g., "Add whiteboard zoom controls"). Group related changes.
- PRs: include a clear description, linked issues, test plan, and screenshots for UI updates. Ensure CI passes (`lint`, `test`, `build`).

## Security & Configuration Tips
- Configure endpoints and connection details in `src/config/environment/Environment.ts`; avoid hardcoding secrets.
- Use Vite environment variables (`import.meta.env`) when needed; do not commit sensitive values.

## Agent Guidelines
- **Do not create unnecessary documentation**: Avoid generating markdown files to document fixes, summaries, or work progress unless explicitly requested by the user.
- **Focus on code changes**: Make the necessary code changes directly without creating supporting documentation files.
- **Existing docs only**: Only update or create documentation when it's part of the actual project requirements (e.g., README updates, API docs, architecture diagrams explicitly requested).
