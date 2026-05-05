
  # DeepSkyn AI Skincare App

  This is a code bundle for DeepSkyn AI Skincare App. The original project is available at https://www.figma.com/design/IztitzX28Tqu44m6diF3Ra/DeepSkyn-AI-Skincare-App.

  ## Project Reports

  - [Performance and accessibility review](PERFORMANCE_AND_ACCESSIBILITY_REVIEW.md)
  - [Accessibility features reference](ACCESSIBILITY.md)
  - [Navigation and accessibility update](README_NAVIGATION_ACCESSIBILITY.md)
  - [Advanced accessibility features](ADVANCED_ACCESSIBILITY_FEATURES.md) - Focus management, reduced motion, text-to-speech

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.


## Deployment & Production Guide

This project has been updated to use Keycloak and Vite environment variables for production. Add the following `VITE_` env vars (Vite will inline them into the client bundle):

```
VITE_KEYCLOAK_URL=https://keycloak-production-7ec8.up.railway.app
VITE_KEYCLOAK_REALM=deepskyn
VITE_KEYCLOAK_CLIENT_ID=frontend
VITE_API_URL=https://your-backend.example.com
```

Commands:

```bash
npm install
npm run dev
npm run build
```

Vercel (frontend) environment variables to set:
- `VITE_KEYCLOAK_URL`
- `VITE_KEYCLOAK_REALM`
- `VITE_KEYCLOAK_CLIENT_ID`
- `VITE_API_URL`

Railway / Backend (server-side) environment variables (do not put these in frontend):
- `DATABASE_URL`=postgresql://USER:PASSWORD@postgres-production-3a94.up.railway.app:5432/DB_NAME
- `KEYCLOAK_URL`=https://keycloak-production-7ec8.up.railway.app
- `KEYCLOAK_REALM`=deepskyn
- `KEYCLOAK_CLIENT_ID`=<backend client id>
- `KEYCLOAK_CLIENT_SECRET`=<secret> (server-side only)

Testing Keycloak login/logout:
1. Set the `.env` (or Vercel envs) as above.
2. Run `npm run dev` and open the app.
3. Use the login action — you should be redirected to Keycloak and return to the app after auth.
4. Protected API calls will include the `Authorization: Bearer <token>` header injected by the axios client.
5. Use logout to call Keycloak logout and confirm session termination.

Security reminder: never expose `DATABASE_URL` or Keycloak client secrets in frontend environment variables.

If you want, I can also:
- unify/remove the duplicate `frontend/` copy or fully sync remaining source files to use the central axios client, and run a final pass to remove leftover hardcoded URLs.

  