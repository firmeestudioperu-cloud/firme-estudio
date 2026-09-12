# 🗄️ Módulo 07: Base de Datos Relacional (Supabase PostgreSQL)

## 1. Visión General
El esquema oficial de FIRME STUDIO está centralizado en el archivo [supabase_schema_v2.sql](file:///d:/estudio-reforma/supabase_schema_v2.sql) (789 líneas). Utiliza PostgreSQL 15 provisto por **Supabase Cloud**, asegurando escalabilidad, integridad referencial y sincronización en tiempo real vía WebSockets.

---

## 2. Diagrama de Entidad-Relación (13 Tablas Principales)

`mermaid
erDiagram
    clients ||--o{ client_plans : "adquiere"
    clients ||--o{ bookings : "reserva"
    clients ||--o{ cash_transactions : "paga"
    clients ||--o{ boutique_orders : "compra/canjea"
    plans ||--o{ client_plans : "define"
    classes ||--o{ bookings : "contiene"
    instructors ||--o{ classes : "imparte"
    boutique_products ||--o{ boutique_orders : "incluye"

    clients {
        uuid id PK
        varchar dni UK
        varchar name
        varchar email UK
        integer exp_points
        varchar student_level
        timestamp last_visit
    }

    client_plans {
        uuid id PK
        uuid client_id FK
        varchar plan_id FK
        integer credits_left
        date expires_at
        boolean is_active
    }

    bookings {
        uuid id PK
        varchar class_id FK
        varchar client_dni FK
        date scheduled_date
        integer spot_number
        varchar status
        time check_in_time
    }

    classes {
        varchar id PK
        varchar day
        time start_time
        varchar name
        varchar instructor_name
        varchar class_type
        integer total_spots
    }
`

---

## 3. Catálogo de Tablas del Sistema

| # | Tabla | Descripción |
| :--- | :--- | :--- |
| 1 | **plans** | Catálogo oficial de planes (Prueba, Suelta, Pack 4, Pack 8, Pack 12, Ilimitada, Ilimitada 3M). |
| 2 | **instructors** | Fichas de las instructoras (Valeria Soler, Mateo Arismendi, Clara Domínguez) y certificaciones. |
| 3 | **classes** | Grilla de 23 clases semanales fijas (Lunes a Domingo), horarios, niveles y aforos. |
| 4 | **clients** | Registro maestro de todas las alumnas (DNI, nombres, teléfono, salud, EXP y nivel). |
| 5 | **user_profiles** | Extensión 1:1 de uth.users de Supabase para alumnas registradas con Google/Email. |
| 6 | **client_plans** | Historial de membresías compradas por cada alumna, saldo de créditos y fecha de caducidad. |
| 7 | **ookings** | Reservas individuales por fecha con asignación de máquina Reformer (1 al 8) y estado. |
| 8 | **cash_transactions** | Libro diario de ingresos de caja clasificado por categorías y métodos de pago. |
| 9 | **expenses** | Libro diario de egresos operativos y compras de suministros de la sede SJL. |
| 10 | **leads** | Base de datos de prospectos comerciales y seguimiento del embudo de ventas. |
| 11 | **outique_products** | Catálogo de productos físicos con precio en Soles y precio en Puntos EXP. |
| 12 | **outique_orders** | Historial de ventas de mostrador y órdenes de canje con vouchers digitales. |
| 13 | **staff_profiles** | Credenciales y perfiles del personal autorizado (Valentino, Soni, Keyla, Camila). |

---

## 4. Vistas SQL de Alto Rendimiento

Para no sobrecargar la base de datos con columnas calculadas que se desactualizan, la ocupación de camas se computa dinámicamente mediante 3 vistas:

1. **classes_today:** Calcula cuántos cupos reales están ocupados hoy para cada clase contando las filas en ookings donde status != 'cancelado'.
2. **classes_week:** Retorna la disponibilidad de todas las clases de la semana para pintar el calendario de reservas en la web.
3. **clients_with_plan:** Combina los datos personales de la alumna con su plan activo más reciente y créditos vigentes en una sola consulta optimizada.

---

## 5. Triggers de Automatización

### Trigger de Check-In (	rg_booking_checkin)
Se dispara de forma automática cuando el estado de una reserva en ookings pasa a 'asistio':
* Suma **+150 EXP** al perfil de la alumna en la tabla clients.
* Incrementa en **+1** el contador 	otal_attended.
* Actualiza el campo last_visit = NOW().
* Si el plan de la alumna es un pack o clase suelta, descuenta **1 crédito** de client_plans.credits_left. Si los créditos llegan a 0, desactiva automáticamente el plan (is_active = FALSE).

---

## 6. Seguridad (Row Level Security & Realtime)

* **RLS Habilitado:** En las 13 tablas con 20 políticas declaradas.
* **Publicación Realtime:** Tablas publicadas en supabase_realtime para actualización instantánea en los navegadores sin recargar: classes, ookings, clients, client_plans.
