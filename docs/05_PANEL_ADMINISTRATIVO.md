# 🎛️ Módulo 05: Panel de Control Administrativo & Staff

## 1. Visión General
El **Panel Administrativo** (src/components/AdminPanel.tsx) es el centro de comando del estudio. Está protegido por autenticación basada en roles y es accesible mediante el atajo de navegación #admin o el botón flotante discreto para usuarios autenticados con rol dmin u owner_dev.

---

## 2. Pestañas y Módulos Administrativos

| Pestaña | Componente | Funcionalidad Clave |
| :--- | :--- | :--- |
| **Dashboard** | AdminDashboardTab.tsx | KPIs ejecutivos en tiempo real: ocupación semanal (gráfico de barras Recharts), ingresos del mes, egresos y tasa de asistencia. |
| **Modo Instructora** | AdminInstructorTab.tsx | **Vista en vivo para sala:** Tablet de la profesora con la cuadrícula de los 8 Reformers, nombres de las alumnas y alertas anatómicas destacadas (ej. *'Hernia lumbar L4-L5'* o *'Embarazo 14 sem'*). |
| **Agenda de Sala** | AdminAgendaTab.tsx | Gestión de todas las reservas del día. Permite marcar asistencia manual, reasignar camas o cancelar con devolución de créditos. |
| **Directorio de Alumnas** | AdminClientsTab.tsx | Ficha técnica de cada cliente: DNI, teléfono, plan actual, créditos restantes, puntos EXP, nivel y registro médico. |
| **Caja Diaria & POS** | AdminCashTab.tsx | Control de ingresos por mostrador desglosados por método de pago (Efectivo, Tarjeta POS, Yape / Plin, Transferencia). |
| **Control de Gastos** | AdminExpensesTab.tsx | Registro de egresos operativos: mantenimiento de resortes Balanced Body, servicios básicos de sede SJL, compras de boutique y planillas. |
| **CRM de Leads** | AdminLeadsTab.tsx | Embudo de ventas para prospectos que solicitaron información por redes sociales o página web. Estados: *Nuevo*, *Contactado*, *Clase Prueba*, *Membresía Vendida*. |
| **Automatización WhatsApp** | AdminWhatsAppTab.tsx | Motor de mensajería con plantillas personalizadas: confirmación inmediata de reserva, recordatorio a 3 horas de la sesión y alertas de cupos liberados. |
| **Tótem SJL** | AdminKioskTab.tsx | Lanzador del modo quiosco para la tablet de bienvenida del estudio. |
| **Banners de Inicio** | AdminBannersTab.tsx | Control en tiempo real de los anuncios y avisos destacados que se muestran en el Hero de la web pública. |
| **Reportes** | AdminReportsTab.tsx | Informes de asistencia por horario, tasa de retención de alumnas y horas de mayor demanda para optimizar la grilla de clases. |
| **Backend & APIs** | AdminBackendTab.tsx | Consola técnica exclusiva del owner_dev para monitorear el estado de las rutas de Express, Supabase Cloud y memoria del servidor. |

---

## 3. Modo Instructora en Sala (Innovación Operativa)
Una de las funcionalidades más potentes del estudio es el **Modo Instructora**. La profesora no necesita llevar papeles ni listas impresas a la sala:
* Lleva una tablet ligera montada en la pared de la sala.
* Cada recuadro representa físicamente una máquina Reformer del 1 al 8.
* Si una alumna tiene una lesión cervical, el recuadro muestra una advertencia en color ámbar para que la instructora adapte los ejercicios de cuello y barra de pies sin exponerla a riesgos.
