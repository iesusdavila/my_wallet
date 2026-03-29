# My Wallet

Web app mobile-first de finanzas personales/familiares construida con Vue + Tailwind + Supabase.

## Stack

- Vue 3 + Vite (JavaScript)
- Tailwind CSS (tema dark mate fijo)
- Pinia (estado global)
- Vue Router
- Supabase Auth (Google + Email/Password)
- ApexCharts (gráficas)
- XLSX (exportación a Excel)

## Funcionalidades incluidas

- Autenticación con Google y Email/Password (Supabase)
- Layout mobile-first con drawer lateral
- Botón de privacidad tipo "ojito" para ocultar montos
- Transacciones (gasto/ingreso/transferencia)
- Creación de cuentas y categorías desde UI
- Filtros por fecha, tipo, cuenta, categoría y texto
- Módulos de cuentas, deudas/tarjetas, inversiones, préstamos, planificación y reportes
- Gráficas de patrimonio, gastos por categoría, ingresos vs gastos, deuda por tipo y rendimiento
- Exportación de movimientos a Excel
- Motor básico de transacciones recurrentes

## Configuración

1. Instalar dependencias:

```bash
npm install
```

2. Crear variables de entorno:

```bash
cp .env.example .env
```

3. Completar en `.env`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Si no configuras estas variables, la app abre en modo demo local para explorar UI.

4. En Supabase SQL Editor, ejecuta el esquema base con tablas y políticas RLS:

```sql
-- contenido de supabase/schema.sql
```

El archivo está en `supabase/schema.sql` e incluye tablas por usuario + políticas `auth.uid()`.

## Desarrollo

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

Deploy recomendado: Vercel.

### Checklist de lanzamiento en Vercel

1. Sube el repositorio a GitHub (rama principal actualizada).
2. En Vercel: **Add New Project** → importa el repositorio.
3. En **Build and Output Settings** deja:
	- Framework Preset: `Vite`
	- Build Command: `npm run build`
	- Output Directory: `dist`
4. En **Environment Variables** agrega:
	- `VITE_SUPABASE_URL`
	- `VITE_SUPABASE_ANON_KEY`
5. Haz deploy.

### Importante para rutas internas (Vue Router)

Este proyecto usa `createWebHistory()`. Para evitar error 404 al refrescar páginas como `/transacciones` o `/reportes`, el archivo `vercel.json` ya incluye rewrite hacia `index.html`.

### Verificación rápida post-deploy

- Abrir login y autenticar.
- Navegar directo a una ruta interna (ejemplo: `/transacciones`) y refrescar la página.
- Crear y editar una transacción.
- Confirmar que reportes y gráficas cargan correctamente.

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
