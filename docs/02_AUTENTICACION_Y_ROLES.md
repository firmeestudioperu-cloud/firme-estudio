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
* Validaciones en cliente con hashing y almacenamiento en Supabase Auth ( uth.users).
* Recuperación de contraseña mediante correo transaccional de Supabase (supabase.auth.resetPasswordForEmail).

### C. Acceso de Personal y Staff (Directorio Corporativo Protegido)
* **Credenciales Corporativas Requeridas:** El ingreso administrativo requiere obligatoriamente correo/usuario/DNI y contraseña corporativa mediante la función `findStaffByCredential(identifier)`.
* **Cuenta Única de Dirección:** Únicamente existe la cuenta de **Owner / Lead Developer** (`tino@firme.com`), con clave de acceso predeterminada `30092023`.
* **Cero Accesos Directos:** No existen botones de autocompletado ni listados públicos de personal expuestos en las pantallas de acceso (`AdminPanel.tsx` ni `GoogleAuthModal.tsx`).
* **Seguridad y Cifrado:** El formulario valida la clave contra la configuración local o remota cifrada, protegiendo la identidad del propietario y el acceso al panel general.

---

## 3. Matriz de Roles y Permisos (RBAC)

El rol del usuario se calcula automáticamente mediante la función `determineUserRole(name, email, dni)` definida en `src/types.ts`:

| Rol | Título | Identificadores Oficiales | Accesos y Permisos |
| :--- | :--- | :--- | :--- |
| **owner_dev** | Owner / Lead Dev | Valentino (`tino@firme.com`, DNI `70112233`) | **Acceso Total:** Infraestructura, base de datos Supabase, módulo Backend & APIs, gestión integral de usuarios, consola técnica, balance financiero global, configuración y operaciones de sede. |
| **admin** | Administrador | Asignable desde Gestión de Usuarios | Operación total de caja, gastos, agenda, alumnas, reportes y configuración de banners (sin consola técnica de base de datos directa). |
| **receptionist**| Recepción & Ventas | Recepcionistas de sede | Operación de mostrador POS, caja diaria, check-in de alumnas, registro de asistencia y CRM de leads. |
| **instructor** | Instructora | Valeria Soler, Mateo Arismendi, Clara Domínguez | Visualización de la sala en vivo (Modo Instructora), nombres de alumnas en cada reformer y alertas de salud (lesiones/embarazo). |
| **client** | Alumna | Registro libre con Google o Email | Reserva de clases, selección de reformer (1 al 8), historial de asistencia, puntos EXP, compras en boutique y perfil personal. |

---

## 4. Módulo de Administración de Usuarios (`AdminUsersTab.tsx`)

Ubicado en el grupo **ADMINISTRACIÓN & SISTEMA** del panel, este submódulo proporciona:
1. **Directorio de Colaboradores Staff:** Listado del personal con su rol, correo, DNI, teléfono y estado activo.
2. **Alta de Nuevo Colaborador (`+ Nuevo Colaborador`):** Modal interactivo para registrar nuevos miembros del staff, asignando su rol jerárquico (`admin`, `receptionist`, `instructor`, `owner_dev`), credenciales y datos de contacto. Se sincroniza con `public.staff_profiles` en Supabase y respaldo local.
3. **Padrón de Instructoras:** Vista especializada del equipo pedagógico, certificaciones y clases asignadas.
4. **Directorio de Clientas:** Búsqueda en tiempo real por nombre, DNI o email, filtro por estado (`activo`, `en_riesgo`, `inactivo`) y consulta de créditos de reformer.
5. **Auditoría de Permisos (RBAC Matrix):** Comparativa detallada de capacidades por cada rol para mantener la trazabilidad de accesos.
6. **Sincronización Bidireccional:** Botón de sincronización directa con Supabase Cloud para verificar consistencia entre `auth.users` / `staff_profiles` y la interfaz local.

---

## 5. Persistencia de Sesiones

* **Alumna:** Datos de sesión guardados en `localStorage.getItem('firme_auth_user')`.
* **Personal Staff / Admin:** Flag de seguridad en `sessionStorage.getItem('firme_admin_logged')` o `firme_staff_logged`.
* **Bloqueo Estricto:** Las rutas administrativas (`#admin`) están estrictamente bloqueadas para usuarios con rol `client`. Si intentan ingresar, son redirigidos inmediatamente al portal de alumnas.
* **Separación de Roles Operativos:** La recepcionista tiene acceso restringido al mostrador y terminal de check-in, mientras que finanzas, reportes y backend están reservados para administración y dirección.
