# Studio HQ — Project Command Center

Studio HQ is the central dashboard for the connected app and game projects.

## AppDeploy project

- Project ID: `studio-hq-project-command-center-itfhnh`
- Live application: https://studio-hq-project-command-center-itfhnh.v2.appdeploy.ai/

## Stack

- React 19
- TypeScript
- Vite 6
- Tailwind CSS 3
- AppDeploy client and backend SDK integrations

## Local development

```bash
npm install
npm run dev
```

Create a production frontend bundle with:

```bash
npm run build
```

The frontend imports `@appdeploy/client` and backend handlers use `@appdeploy/sdk`. These platform integrations must be available in an AppDeploy-compatible runtime. A generic Vite build alone does not verify authentication, database, or realtime behavior.

## Repository layout

- `src/` — dashboard interface and styles
- `backend/` — authenticated task API and realtime handlers
- `tests/tests.json` — AppDeploy UI and behavior test definitions
- `appdeploy.auth-login.json` — login screen presentation configuration
- `docs/` — source synchronization notes

## Source of truth

This branch records a source snapshot retrieved from the existing Studio HQ AppDeploy project on 2026-10-31. The synchronization does not publish a new AppDeploy deployment or change the running website.

Secrets and private environment values are intentionally excluded from this repository.
