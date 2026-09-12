# 🛍️ Módulo 06: Finanzas, Caja Diaria y Boutique

## 1. Visión General
Este módulo administra la rentabilidad integral de FIRME STUDIO a través de dos vertientes:
1. **La Boutique Oficial de Estudio:** Venta física y digital de merchandising, accesorios de agarre y firma olfativa.
2. **El Módulo de Tesorería:** Registro de transacciones de caja chica, cobros por POS/Yape y control de egresos operativos.

---

## 2. Catálogo Oficial de Boutique

La boutique cuenta con un modelo de **Doble Moneda**: la alumna puede pagar en **Soles (S/.)** o canjear productos con los **Puntos de Experiencia (EXP)** que acumula en cada sesión asistida.

| Producto | Precio en Soles | Costo en Puntos EXP | Margen | Rol y Características |
| :--- | :--- | :--- | :--- | :--- |
| **Calcetines Grip Antideslizantes** | **S/. 45** | 450 EXP | 65% | **Obligatorio en sala.** Silicona de alto agarre para la barra de pies del Reformer. Tallas S, M, L en colores Terracota, Lino y Negro. |
| **Botella Térmica Inox (650 ml)** | **S/. 55** | 550 EXP | 55% | Acero 18/8 doble pared al vacío. Mantiene 24h agua fría. Grabado láser del isotipo FIRME. |
| **Bruma Aromática Relajante (100 ml)** | **S/. 38** | 380 EXP | 70% | Esencia botánica de eucalipto, lavanda francesa y bergamota (la misma firma olfativa del estudio). |
| **Tote Bag Lino Orgánico** | **S/. 35** | 350 EXP | 60% | Lino 100% biodegradable con bolsillo interior con cremallera. |
| **Foam Roller Alta Densidad (60 cm)** | **S/. 85** | 900 EXP | 50% | Rodillo para descarga miofascial en casa post-entrenamiento. |
| **Agua Mineral / Bebida Funcional** | **S/. 5 - S/. 8** | 100 EXP | 45% | Consumo impulsivo en recepción al salir de la clase. |

---

## 3. Mecánica de Gamificación y Puntos EXP

* **Generación de Puntos:** Cada vez que la alumna asiste a una clase confirmada en el Tótem o por la recepcionista, el sistema le otorga automáticamente **+150 EXP**.
* **Niveles de Alumna:**
  * **Iniciación:** 0 – 449 EXP *(0 a 2 clases)*
  * **Constancia:** 450 – 1,199 EXP *(3 a 7 clases)*
  * **Avanzada:** 1,200 – 2,499 EXP *(8 a 16 clases)*
  * **Maestría FIRME:** 2,500+ EXP *(17+ clases)*
* **Canje:** En BoutiqueSection.tsx, la alumna puede seleccionar "Canjear con EXP". El sistema valida que cuente con el saldo suficiente, genera un **Voucher Digital con código alfanumérico** y descuenta los puntos de su perfil. La recepcionista valida el código en recepción y le entrega el producto en físico.

---

## 4. Control de Caja y Egresos en Mostrador

### A. Ingresos (cash_transactions)
Cada pago recibido en recepción (sea por compra de plan, clase suelta o producto boutique) se asienta en la base de datos con:
* Monto en Soles y categoría (*Membresía*, *Clase Suelta*, *Boutique*, *Otros*).
* Método de pago: efectivo, 	arjeta_pos, yape_plin, 	ransferencia.
* DNI o nombre de la alumna vinculada.
* Identificador del personal de recepción que registró la venta.

### B. Egresos y Gastos (expenses)
Permite registrar salidas de dinero de la sede clasificadas en:
* *Mantenimiento:* Revisión de poleas, resortes de repuesto Balanced Body, cuerdas de cuero.
* *Insumos y Limpieza:* Toallitas desinfectantes de vinil, alcohol, papel toalla, difusores.
* *Servicios Sede SJL:* Luz, agua, Internet de alta velocidad, mantenimiento del local.
* *Boutique:* Reposición de stock de calcetines y botellas térmicas.
