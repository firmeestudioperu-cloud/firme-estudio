# ⚙️ Módulo 08: Backend Express & APIs

## 1. Visión General
El backend de FIRME STUDIO está construido sobre **Node.js + Express 4 con TypeScript** (server.ts). Opera como una arquitectura híbrida que atiende tanto los endpoints REST para automatizaciones internas como el middleware de desarrollo de Vite en local o el hosting estático de producción en Vercel.

---

## 2. Arquitectura del Servidor (server.ts)

`mermaid
graph TD
    Client["Navegador Web / Tablet SJL"] --> Router["Express Server (:3000)"]
    Router -->|Ruta /api/*| API["Controladores REST (server/routes/)"]
    Router -->|Rutas Web /| Vite["Vite Middleware (Dev) / dist/ (Prod)"]
    API --> Store["In-Memory Store (server/data/store.ts)"]
    API --> Gemini["Google Gemini 2.5 Flash API"]
    Client -.->|Conexión Directa| Supabase["Supabase Cloud (PostgreSQL + Realtime)"]
`

---

## 3. Catálogo de Rutas REST (/api/*)

| Prefijo de Ruta | Archivo Controlador | Métodos | Propósito |
| :--- | :--- | :--- | :--- |
| **/api/health** | server/routes/health.ts | GET | Health check del servidor, uptime, métricas en vivo (clientes, clases, reservas, balance). |
| **/api/classes** | server/routes/classes.ts | GET, POST | Catálogo de clases semanales, cálculo de aforo disponible y filtro por día. |
| **/api/bookings** | server/routes/bookings.ts | GET, POST, PUT, DELETE | Creación de reservas, check-in en recepción, asignación de camas (1 al 8) y cancelaciones. |
| **/api/clients** | server/routes/clients.ts | GET, POST, PUT | Búsqueda rápida de clientas por DNI para el tótem, consulta de saldo de clases y nivel EXP. |
| **/api/finance** | server/routes/finance.ts | GET, POST | Libro de ingresos de caja, cuadre por método de pago (POS, Yape, Efectivo) y egresos de sede. |
| **/api/leads** | server/routes/leads.ts | GET, POST, PUT | Captación de prospectos desde landing pages y actualización de estados del embudo. |
| **/api/whatsapp** | server/routes/whatsapp.ts | POST | Despacho de alertas: recordatorio de clase a 3 horas, confirmación de reserva y aviso de bienvenida. |
| **/api/ai** | server/routes/ai.ts | POST | Motor de Concierge y consultor biomecánico interactivo conectado con Google Gemini. |

---

## 4. Integración con Google Gemini 2.5 Flash (/api/ai)

El endpoint /api/ai/concierge utiliza la librería oficial @google/genai con el modelo **Gemini 2.5 Flash**.

* **System Prompt:** Configurado con la identidad de marca de FIRME STUDIO (San Juan de Lurigancho), conocimiento anatómico de Pilates Reformer, indicaciones biomecánicas de los resortes y protocolos de seguridad física.
* **Casos de Uso:**
  * Alumnas que preguntan si pueden hacer Reformer con dolor lumbar o tras una cesárea.
  * Recomendación inteligente de tipo de clase (Align, Flow, Suspensión) según el nivel de experiencia de la persona.
  * Asistencia para dudas de horarios, tarifas y ubicación en Jr. Akapana 1261.

---

## 5. Middleware y Resiliencia

* **Logging de Peticiones:** Cada solicitud a /api/* se registra en consola con marca de tiempo en hora local de Lima (es-PE).
* **Manejo Centralizado de Errores (errorHandler.ts):** Captura cualquier excepción en las rutas REST y devuelve una respuesta estructurada en formato JSON ({ error: string, timestamp: string }), evitando caídas del servidor.
