# 📱 Módulo 04: Tótem de Auto Check-In SJL (Recepción)

## 1. Visión General
El **Tótem de Auto Check-In** es una interfaz diseñada especialmente para tablets colocadas en atriles de madera en la entrada del local en **Jr. Akapana 1261, San Juan de Lurigancho (SJL)**.

Permite que las alumnas confirmen su llegada en menos de **3 segundos sin hacer fila en el mostrador**, aliviando la carga operativa de la recepcionista en las horas punta de cambio de turno.

---

## 2. Componentes Involucrados

* **ReceptionKioskModal.tsx:** Modo pantalla completa de autoservicio para la tablet del atril. Teclado numérico táctil optimizado para digitar los 8 dígitos del DNI.
* **ClientCheckInModal.tsx:** Modal de validación rápida de datos personales y alertas de salud previas a ingresar a sala.
* **AdminKioskTab.tsx (en AdminPanel):** Consola unificada de recepción y mostrador dentro del Panel Administrativo (control de aforo, asignación de camas Reformer 1-8, cobros express y quiosco).

---

## 3. Flujo Paso a Paso de la Alumna

`mermaid
graph TD
    A["Alumna llega al estudio en SJL"] --> B["Digita su DNI de 8 dígitos en la Tablet"]
    B --> C{"¿Tiene clase hoy?"}
    C -->|Sí| D["Pantalla de Bienvenida VIP"]
    D --> E["Le indica: 'Pasa a tu Reformer #X'"]
    E --> F["Automático: +150 EXP sumados a su cuenta"]
    E --> G["Automático: Descuenta 1 crédito de su plan"]
    C -->|No| H["Alerta de Recepción: Solicitar cupo libre en mostrador"]
`

1. **Ingreso de DNI:**  
   La alumna ingresa su documento de identidad nacional. No requiere ingresar correos ni contraseñas.
2. **Reconocimiento Inmediato:**  
   El sistema localiza su perfil en la base de datos de Supabase o en la caché local de respaldo.
3. **Asignación de Cama Reformer:**  
   La pantalla muestra un mensaje de bienvenida animado indicando claramente el número de máquina asignada (ej. *Reformer 3*), el nombre del instructor de turno y cuántos créditos le restan en su membresía.
4. **Trigger Automático en Base de Datos:**  
   Al confirmarse la asistencia, se ejecuta en PostgreSQL el trigger:
   * Estado de la reserva pasa de 'pendiente' a 'asistio'.
   * Se acreditan automáticamente **+150 puntos de experiencia (EXP)** a su perfil de alumna.
   * Se incrementa en +1 su contador histórico de asistencias.
   * Se actualiza el campo last_visit con la marca de tiempo exacta.
   * Si su plan es un pack o clase suelta, se descuenta automáticamente 1 crédito de client_plans.credits_left.

---

## 4. Modo Desconectado / Fallback Resiliente
Si la conexión a Internet en la sede sufre una interrupción temporal, el tótem conmuta transparentemente a la API local de Express (server/data/store.ts). Los check-ins se almacenan localmente y se sincronizan con Supabase Cloud tan pronto como se restablece la red, garantizando que ninguna alumna se quede sin ingresar.
