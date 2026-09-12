# 🧘 Módulo 03: Motor de Reservas y Gestión de Sala

## 1. Visión General
El núcleo del estudio gira en torno a su sala equipada con **8 máquinas Reformer Allegro 2 (Balanced Body)**. Cada sesión tiene un aforo estrictamente limitado a 8 personas para garantizar supervisión biomecánica cercana y corrección personalizada de posturas.

---

## 2. Tipos de Clases y Metodología

| Modalidad | Enfoque | Aforo | Duración |
| :--- | :--- | :--- | :--- |
| **Reformer Flow** | Trabajo continuo sobre el carro móvil, resistencia de resortes, core profundo y control motor. | 8 alumnas | 50 - 60 min |
| **Suspensión & Tower** | Inversiones guiadas, elongación axial, barra de empuje y trabajo excéntrico contra la gravedad. | 6 - 8 alumnas | 50 - 55 min |
| **Mat & Miofascial** | Trabajo en suelo con colchoneta de alta densidad, foam rollers y liberación de contracturas. | 8 alumnas | 50 min |

---

## 3. Horario Semanal (23 Sesiones Activas)

El horario cubre los 7 días de la semana en turnos estratégicos (Mañana: 07:30 - 11:00 am / Tarde-Noche: 17:30 - 20:30 pm / Fines de Semana: 09:30 - 13:30 pm).
* **Lunes:** 4 clases (Fundamentos, Flow, Suspensión, Restorative Mat).
* **Martes:** 4 clases (Contrology Clásico, Suspensión Aérea, Fundamentos, Mat Postural).
* **Miércoles:** 4 clases (Flow Dinámico, Tower Cadillac, Fundamentos, Deep Stretch).
* **Jueves:** 3 clases (Contrology, Reformer Escultural, Suspensión Power).
* **Viernes:** 3 clases (Sunrise Reformer, Tower Challenge, Mat & Roller).
* **Sábado:** 3 clases (Masterclass Weekend, Técnica Mat, Suspensión Flow).
* **Domingo:** 2 clases (Domingo Consciente Mat, Posture Reset).

---

## 4. Flujo de Reserva en 3 Pasos

`mermaid
sequenceDiagram
    participant Alumna
    participant UI as ScheduleCalendar / BookingModal
    participant DB as Supabase (bookings)
    participant WA as Bot WhatsApp

    Alumna->>UI: Selecciona día y clase en el calendario
    UI->>Alumna: Muestra plano interactivo de 8 Camas Reformer
    Alumna->>UI: Elige cama disponible (ej. Reformer #4)
    UI->>DB: Registra reserva con DNI y fecha programada
    DB-->>UI: Confirmación exitosa + resta 1 crédito
    UI->>WA: Dispara recordatorio automático al WhatsApp de la alumna
`

1. **Selección en Calendario (ScheduleCalendar.tsx):**  
   Muestra las tarjetas horarias por día. Indica el instructor, nivel, duración y cupos libres en tiempo real (ej. *2 cupos libres* o *Agotado*).
2. **Selección Visual de Cama (BookingModal.tsx):**  
   Muestra la distribución física de los 8 Reformers numerados del 1 al 8. Las camas ya ocupadas se muestran deshabilitadas en color gris oscuro con el nombre del ocupante bloqueado.
3. **Validación de Créditos y Salud:**  
   Verifica que la alumna tenga créditos activos en su membresía o pack. Si no tiene créditos, le permite adquirir una clase suelta o membresía en el acto. Permite ingresar notas médicas (embarazo, lesión de rodilla, hernia discal) que luego son visibles para la instructora.

---

## 5. Prevención de Duplicados e Integridad
* En la base de datos PostgreSQL, la tabla ookings tiene una restricción única:
  `sql
  UNIQUE(class_id, client_dni, scheduled_date)
  `
  Esto impide que un usuario reserve dos veces la misma clase en el mismo día por error de clic.
