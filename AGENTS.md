# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains app code: `components/`, `hooks/`, `main/`, `tools/`, `utils/`, `types/`, and `styles/`. Entry points are `src/main.tsx` and `src/App.tsx`.
- `public/` hosts static assets (e.g., `vite.svg`).
- `test/` holds Vitest specs (e.g., `sum.test.ts`, `ReDrawController.test.ts`).
- Top-level files: `index.html`, `vite.config.ts`, `tsconfig*.json`, and `package.json`.

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
- Components: `PascalCase.tsx` under `src/components/...` (e.g., `Toolbar.tsx`).
- Hooks: `useX.ts` (e.g., `useWhiteboard.ts`). Utilities/services: `CamelCase.ts`.
- Styles: SCSS modules as `*.module.scss`; global styles in `src/styles/*.scss` and `src/index.css`.
- Prefer clear named exports where practical; avoid long files—split by concern.

## Testing Guidelines
- Framework: Vitest with Testing Library (`@testing-library/react`).
- Location: `test/` with `*.test.ts[x]` naming. Example: `test/ReDrawController.test.ts`.
- Cover core logic in `src/utils`, hooks in `src/hooks`, and critical UI interactions. Run `npm run coverage` before PRs.

## Commit & Pull Request Guidelines
- Commits: imperative, concise subjects (e.g., "Add whiteboard zoom controls"). Group related changes.
- PRs: include a clear description, linked issues, test plan, and screenshots for UI updates. Ensure CI passes (`lint`, `test`, `build`).

## Security & Configuration Tips
- Configure endpoints and connection details in `src/apis/resources/Environment.ts` and related resources; avoid hardcoding secrets.
- Use Vite environment variables (`import.meta.env`) when needed; do not commit sensitive values.
