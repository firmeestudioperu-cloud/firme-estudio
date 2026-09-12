# 🏗️ Módulo 01: Arquitectura General del Sistema

## 1. Visión General
**FIRME ESTUDIO** es una aplicación Web Full-Stack progresiva diseñada específicamente para gestionar un estudio boutique de Pilates Reformer con 8 camas de alta precisión en San Juan de Lurigancho (Lima, Perú).

A diferencia de los sistemas tradicionales basados en WordPress y widgets externos (como Mindbody o Fitco), FIRME opera sobre una arquitectura moderna de **cero redirecciones**, con renderizado instantáneo y sincronización en tiempo real vía WebSockets.

---

## 2. Stack Tecnológico

| Capa | Tecnologías | Propósito |
| :--- | :--- | :--- |
| **Frontend UI** | React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons | Interfaz fluida, estética boutique, diseño responsive móvil y tablet. |
| **Gráficos y Métricas** | Recharts | Métricas de ocupación, horas pico y finanzas en el panel administrativo. |
| **Build Tool & Bundler** | Vite 6, esbuild | Hot Module Replacement (HMR) ultrarrápido y empaquetado optimizado. |
| **Backend API** | Node.js, Express 4, TypeScript (	sx) | Servidor backend para rutas REST, automatizaciones y pasarela con IA. |
| **Base de Datos & Auth** | Supabase Cloud (PostgreSQL 15 + GoTrue Auth) | Autenticación segura, almacenamiento relacional, triggers y canales Realtime. |
| **Autenticación Nativa** | Google Identity Services (GIS) | Modal emergente oficial de Google con signInWithIdToken (sin URLs de terceros). |
| **Inteligencia Artificial** | Google Gemini 2.5 Flash (@google/genai) | Asistente concierge, evaluación biomecánica y resolución de consultas anatómicas. |

---

## 3. Estructura de Directorios

`plaintext
d:\estudio-reforma\
├── docs/                       # Documentación modular del sistema
├── public/                     # Archivos estáticos servidos directamente
│   ├── assets/                 # Fotos de sala, instructores y catálogo boutique
│   ├── favicon.svg             # Favicon vectorial
│   ├── firme-studio-logo.svg   # Isotipo oficial
│   ├── privacidad.html         # Política de privacidad para Google OAuth
│   └── google72a62c85dcac61a7.html # Token activo de verificación de dominio
├── server/                     # Backend Express
│   ├── data/store.ts           # Almacén en memoria de respaldo
│   ├── middleware/             # Middleware de seguridad y error handling
│   └── routes/                 # 8 controladores REST (classes, bookings, etc.)
├── src/                        # Código fuente Frontend React
│   ├── components/             # 45 componentes organizados por vista y funcionalidad
│   │   └── admin/              # Módulos especializados del Panel de Control
│   ├── data/                   # Datos estructurados y mockups de contingencia
│   ├── lib/supabase.ts         # Inicializador y cliente Supabase
│   ├── services/               # Clientes HTTP (api.ts) y Base de Datos (supabaseService.ts)
│   ├── types.ts                # Contratos y tipos TypeScript compartidos
│   ├── App.tsx                 # Enrutador de estado y controlador de vistas
│   ├── main.tsx                # Punto de entrada del cliente React
│   └── index.css               # Estilos globales y tokens de diseño
├── server.ts                   # Servidor HTTP híbrido (Express + Vite)
├── supabase_schema_v2.sql      # Script DDL/DML de base de datos oficial
├── package.json                # Manifiesto de dependencias y scripts
└── .env                        # Variables de entorno sensibles (excluido de git)
`

---

## 4. Variables de Entorno (.env)

`ash
# Variables del Frontend (prefijo VITE_)
VITE_SUPABASE_URL=https://tcotfpzymrjyvwrlnskf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...

# Variables del Backend
SUPABASE_URL=https://tcotfpzymrjyvwrlnskf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
PORT=3000
NODE_ENV=development
`

---

## 5. Scripts de Ejecución (package.json)

* 
pm run dev: Inicia el servidor dual Express + Vite en http://localhost:3000 con recarga en caliente.
* 
pm run build: Compila los assets estáticos con Vite y genera el bundle del backend en dist/server.cjs con esbuild.
* 
pm run start: Ejecuta el bundle de producción compilado (
ode dist/server.cjs).
* 
pm run lint: Ejecuta el compilador de TypeScript (	sc --noEmit) para validar tipado estricto.
* 
pm run preview: Previsualiza la compilación de producción.

---

## 6. Sistema de Diseño Visual y Estética Boutique (Actualización)

Para preservar la imagen de marca de alta gama y evitar la saturación cognitiva del usuario, la interfaz se rige por los siguientes principios minimalistas:

1. **Fotografía como Protagonista:** Las salas de Reformer Allegro 2 y los productos de boutique se presentan de forma limpia, sin marcos pesados ni insignias superpuestas que tapen las imágenes.
2. **Jerarquía Tipográfica Serena:** Empleo de la tipografía serif *Fraunces* para encabezados y sans-serif *Inter* para lectura ligera. Textos concisos y directos (máximo 2 líneas en subtítulos).
3. **Eliminación de Cajas Redundantes:** Se eliminan cuadros de navegación duplicados y badges tipo SaaS (estrellas masivas, contadores repetidos, botones discordantes). La paleta se mantiene estricta en tonos Arena (#FAF8F5), Negro Mate (#1A1815) y Terracota (#B5654A).
4. **Espacio Negativo (Breathing Room):** Márgenes amplios y transiciones fluidas que transmiten la atmósfera de calma y concentración propia de una sesión de Pilates.
