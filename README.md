# Portfolio Frontend (`portfolio_fe`)

Frontend SPA en **Vue 3 + Vite + TypeScript + Pinia + Vue Router**, conectado al backend Django REST (`portfolio_be`) y desplegado en **Netlify**.

## Autenticación (basada en `lxia_fe`)
- `src/lib/http.ts`: Axios singleton con inyección automática de `Authorization: Token <token>` y manejo de `401` en rutas `/admin`.
- `src/lib/storage.ts` + `src/stores/authStore.ts` + `src/services/authService.ts`.
- Guards en `src/router/index.ts` protegiendo `/admin/*`.

## Scripts
```bash
npm install
npm run dev
npm run build
```
