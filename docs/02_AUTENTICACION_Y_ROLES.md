# 🔐 Módulo 02: Autenticación y Control de Acceso (RBAC)

## 1. Visión General
El sistema de identidad de FIRME STUDIO combina **Google Identity Services (GIS)** para alumnas con un esquema estricto de **Roles Basados en Permisos (RBAC)** para el personal administrativo y del estudio.

---

## 2. Métodos de Autenticación

### A. Google Identity Services (GIS) — Autenticación en 1 Clic
* **Flujo Nativo:** No redirige la página completa hacia subdominios externos. Despliega un popup nativo de Google sobre la web (irme-estudio.vercel.app o localhost:3000).
* **Credencial Google:** 56417271650-kpuge3mfsrdsnqafjn2qv3hubt2o6tve.apps.googleusercontent.com
* **Método Supabase:** supabase.auth.signInWithIdToken({ provider: 'google', token: response.credential }).
* **Sincronización:** Si la alumna no existe en la base de datos, el sistema sincroniza automáticamente su nombre, correo y avatar en la tabla clients e inicializa sus puntos EXP en 0.

### B. Registro y Login Manual (Email + Contraseña)
* Validaciones en cliente con hashing y almacenamiento en Supabase Auth (uth.users).
* Recuperación de contraseña mediante correo transaccional de Supabase (supabase.auth.resetPasswordForEmail).

---

## 3. Matriz de Roles y Permisos (RBAC)

El rol del usuario se calcula automáticamente mediante la función determineUserRole(name, email, dni) definida en src/types.ts:

| Rol | Título | Identificadores Oficiales | Accesos y Permisos |
| :--- | :--- | :--- | :--- |
| **owner_dev** | Owner / Lead Dev | Valentino (	inoykz@gmail.com) | **Acceso Total.** Módulo Backend & APIs, consola técnica, conmutador de cuentas para testing, métricas financieras globales. |
| **dmin** | Administradora | Soni (soni@firmestudio.pe), Keyla (keyla@firmestudio.pe) | Control operativo total: Tótem SJL, Modo Instructora, Agenda de Camas, CRM de Leads, Control de Caja POS, Envíos WhatsApp, Reportes. |
| **eceptionist** | Recepción Mostrador | Camila (ecepcion@firmestudio.pe) | Acceso enfocado: Terminal de Recepción SJL, Check-in por DNI, Venta de boutique en efectivo y cobro de clases sueltas. |
| **instructor** | Instructora | Valeria Soler, Mateo Arismendi, Clara Domínguez | Visualización de la sala en vivo (Modo Instructora), nombres de alumnas en cada reformer y alertas de salud (lesiones/embarazo). |
| **client** | Alumna | Registro libre con Google o Email | Reserva de clases, selección de reformer (1 al 8), historial de asistencia, puntos EXP, compras en boutique y perfil personal. |

---

## 4. Persistencia de Sesiones

* **Alumna:** Datos de sesión guardados en localStorage.getItem('firme_auth_user').
* **Personal Staff / Admin:** Flag de seguridad en sessionStorage.getItem('firme_admin_logged') o irme_staff_logged.
* **Bloqueo Estricto:** Las rutas administrativas (#admin) están estrictamente bloqueadas para usuarios con rol client. Si intentan ingresar, son redirigidos inmediatamente al portal de alumnas.
