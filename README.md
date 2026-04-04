# My Wallet - Finanzas Personales

Aplicación mobile-first con Vue 3 + Vite + Tailwind + Pinia + Vue Router + Supabase.

## Stack

- Vue 3 (`<script setup>`, JavaScript puro)
- Vite
- Tailwind CSS (componentes base propios)
- Pinia + Vue Router
- ApexCharts (`vue3-apexcharts`)
- Supabase Auth + PostgreSQL
- Exportación Excel con `xlsx`

## Configuración local

1. Instalar dependencias:

```bash
npm install
```

2. Crear `.env` desde el ejemplo:

```bash
cp .env.example .env
```

3. Completar credenciales de Supabase en `.env`.

4. Ejecutar desarrollo:

```bash
npm run dev
```

## Base de datos Supabase

- SQL completo de tablas, RLS y triggers en `supabase/schema.sql`.
- Incluye:
  - Registro con email/password (sin OAuth social)
  - `profiles` + trigger automático al crear usuario
  - Políticas RLS por usuario: `auth.uid() = user_id`
  - Sincronización de balances en `accounts` al crear/editar/eliminar en `transactions`

## Módulos

- Dashboard institucional (grid 2x2 en móvil y fila en desktop)
- Cuentas
- Categorías (filtro Todas/Ingresos/Gastos)
- Transacciones (pestañas Gráficas/Detalle, filtros, modal único add/edit, exportación Excel)
- Inversiones
- Préstamos (incluye "Marcar pagado" con creación automática de ingreso)
- Deudas
- Tarjetas de crédito
- Planificación (`budgets`, `goals`, `subscriptions`)

## Build

```bash
npm run build
```
