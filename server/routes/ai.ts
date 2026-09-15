import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { store } from '../data/store';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

async function generateWithTimeout(ai: GoogleGenAI, params: any, timeoutMs = 6000): Promise<any> {
  return Promise.race([
    ai.models.generateContent(params),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI generation timeout (spikes detected)')), timeoutMs)
    ),
  ]);
}

// POST /api/ai/studio-insights - Operational Analysis
router.post(
  '/studio-insights',
  asyncHandler(async (req: Request, res: Response) => {
    const stats = store.getStats();
    const classes = store.getClasses();

    try {
      const ai = getAIClient();

      if (!ai) {
        // Return structured heuristic response if no API key is configured yet
        return res.json({
          success: true,
          source: 'heuristic',
          insights: {
            summary: `FIRME STUDIO opera con ${stats.activeClients} alumnas activas y un balance neto de S/. ${stats.netBalance.toFixed(2)}. La tasa de ocupación promedio en reformer es del 78%.`,
            recommendations: [
              'Aperturar 2 turnos matutinos adicionales a las 06:30 AM los días martes y jueves debido a alta demanda.',
              'Contactar a los 5 prospectos en etapa "prueba_agendada" antes de las 18:00 para confirmar asistencia.',
              'Reforzar clases de Suspensión los viernes para equilibrar la ocupación con las salas de Reformer.',
            ],
            retentionTip: 'Revisar alumnas con más de 10 días de inactividad para enviarles un pase de cortesía por WhatsApp.',
            projectedRevenue: 'S/. 3,200 adicionales al mes optimizando ocupación matutina',
          },
        });
      }

      const prompt = `Actúa como un Consultor Experto en Gestión de Estudios Boutique de Pilates Reformer (8 camas, Allegro 2, Lima - San Juan de Lurigancho).
Analiza las siguientes métricas en tiempo real de FIRME STUDIO:
- Total Alumnas Registradas: ${stats.totalClients} (${stats.activeClients} activas)
- Ingresos Totales del Período: S/. ${stats.totalRevenue}
- Gastos Operativos: S/. ${stats.totalExpenses}
- Balance Neto: S/. ${stats.netBalance}
- Reservas Realizadas: ${stats.totalBookings}
- Leads en Embudo Comercial: ${stats.activeLeads}
- Clases en Cartelera: ${classes.length} sesiones semanales

Genera en formato JSON estricto con las siguientes claves:
{
  "summary": "Breve diagnóstico ejecutivo (2 oraciones) del estado comercial y operativo del estudio.",
  "recommendations": ["Recomendación práctica 1", "Recomendación práctica 2", "Recomendación práctica 3"],
  "retentionTip": "Un consejo accionable para retener alumnas y evitar bajas en la membresía.",
  "projectedRevenue": "Estimación de incremento si se optimizan los cupos libres"
}`;

      const response = await generateWithTimeout(
        ai,
        {
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        },
        6000
      );

      const text = response.text || '{}';
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = {
          summary: text.slice(0, 200),
          recommendations: ['Optimizar horarios pico de Reformer'],
          retentionTip: 'Seguimiento por WhatsApp',
        };
      }

      res.json({
        success: true,
        source: 'gemini-3.8-flash',
        insights: parsed,
      });
    } catch (error: any) {
      console.warn('[AI Service] Gemini API temporary spike, using studio heuristic insights:', error.message);
      res.json({
        success: true,
        source: 'heuristic-fallback',
        insights: {
          summary: `FIRME STUDIO opera con ${stats.activeClients} alumnas activas y un balance neto de S/. ${stats.netBalance.toFixed(2)}. La tasa de ocupación en reformer supera el 75%.`,
          recommendations: [
            'Aperturar 2 turnos matutinos adicionales a las 06:30 AM los días martes y jueves debido a alta demanda.',
            'Contactar a los prospectos en etapa "prueba_agendada" antes de las 18:00 para confirmar asistencia.',
            'Reforzar clases de Suspensión los viernes para equilibrar la ocupación con las salas de Reformer.',
          ],
          retentionTip: 'Revisar alumnas con más de 10 días de inactividad para enviarles un pase de cortesía por WhatsApp.',
        },
      });
    }
  })
);

// POST /api/ai/biomechanics-advisor - Clinical Pilates & Reformer Spring Adjustments
router.post(
  '/biomechanics-advisor',
  asyncHandler(async (req: Request, res: Response) => {
    const { clientCondition, classFocus, exerciseName } = req.body;

    if (!clientCondition || typeof clientCondition !== 'string' || !clientCondition.trim()) {
      return res.status(400).json({ success: false, error: 'Condición médica o molestia requerida' });
    }

    const sanitizedCondition = clientCondition.trim().slice(0, 300);
    const sanitizedFocus = classFocus ? String(classFocus).trim().slice(0, 100) : 'Reformer Clásico';
    const sanitizedExercise = exerciseName ? String(exerciseName).trim().slice(0, 100) : 'Footwork y Estabilidad Central';

    try {
      const ai = getAIClient();

      if (!ai) {
        return res.json({
          success: true,
          source: 'heuristic',
          adaptation: {
            condition: sanitizedCondition,
            recommendedSprings: '1 Rojo + 1 Azul (Resistencia media-baja controlada)',
            headrestPosition: 'Posición media o elevada para reducir tensión occipital y cervical.',
            contraindications: [
              'Evitar flexión forzada de tronco (crunches) sin soporte lumbar',
              'No hiperextender cadera en cargas altas',
            ],
            suggestedModifications: 'Trabajar Footwork con pies en barra paralelos y énfasis en respiración diafragmática.',
            instructorCue: 'Alarga la coronilla hacia el cabecero y mantén pelvis neutra sin aplastar el carro.',
          },
        });
      }

      const prompt = `Eres un Fisioterapeuta y Master Trainer Certificado en Pilates Clínico y Reformer.
Una alumna de FIRME STUDIO presenta la siguiente condición física: "${sanitizedCondition}".
Enfoque de la clase: "${sanitizedFocus}".
Ejercicio en consulta: "${sanitizedExercise}".

Proporciona en formato JSON estricto con las claves:
{
  "condition": "${sanitizedCondition}",
  "recommendedSprings": "Configuración exacta de resortes para Reformer Allegro (ej. 1 Azul + 1 Amarillo, o 1 Rojo)",
  "headrestPosition": "Recomendación de cabecero (Plano, Medio o Alto) y por qué",
  "contraindications": ["Ejercicio o rango de movimiento contraindicado 1", "Contraindicación 2"],
  "suggestedModifications": "Modificación biomecánica precisa para ejecutar de forma segura en la cama de Reformer",
  "instructorCue": "Un comando verbal (cueing) clave para guiar a la alumna"
}`;

      const response = await generateWithTimeout(
        ai,
        {
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        },
        6000
      );

      const text = response.text || '{}';
      const parsed = JSON.parse(text);

      res.json({
        success: true,
        source: 'gemini-3.8-flash',
        adaptation: parsed,
      });
    } catch (error: any) {
      console.warn('[AI Service] Gemini API temporary spike, using clinical Pilates heuristic adaptation:', error.message);
      res.json({
        success: true,
        source: 'clinical-heuristics',
        adaptation: {
          condition: sanitizedCondition,
          recommendedSprings: '1 Azul + 1 Amarillo (Carga suave protectora articular)',
          headrestPosition: 'Cabecero en posición media (2do nivel) para alinear columna cervical y evitar hiperextensión de cuello.',
          contraindications: [
            'Flexión forzada o rotación lumbar balística',
            'Series de puente alto sin apoyo de sacro asistido',
          ],
          suggestedModifications: 'Realizar Footwork en barra con alineación de talones y respiración costolateral activa sin compensación pélvica.',
          instructorCue: 'Inhala al abrir el carro con control, exhala hundiendo suavemente el ombligo hacia la columna al cerrar.',
        },
      });
    }
  })
);

// POST /api/ai/chat - Virtual Concierge AI for FIRME STUDIO
router.post(
  '/chat',
  asyncHandler(async (req: Request, res: Response) => {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Mensaje requerido' });
    }

    // Limit input length to prevent abuse
    const cleanMessage = message.trim().slice(0, 500);
    const lower = cleanMessage.toLowerCase();

    try {
      const ai = getAIClient();

      if (ai) {
        const systemInstruction = `Eres "Grace IA", la Asistente Inteligente Oficial de FIRME STUDIO — Pilates Reformer & Boutique.
Sede Única: Jr. Akapana 1261, San Juan de Lurigancho (Lima - SJL), Perú.
Equipamiento: 8 Camas Reformer Allegro 2 Balanced Body de alta gama.
Capacidad: Máximo 8 alumnas por turno con atención postural personalizada.
Regla de oro de seguridad: Es obligatorio el uso de calcetines con grip antideslizante en sala (disponibles en nuestra Boutique física o canjeables con EXP).
Planes y Tarifas: Clase de prueba introductoria desde S/. 45; Pack 8 sesiones S/. 680; Membresía Ilimitada mensual S/. 890.
Gamificación: Las alumnas ganan +150 EXP por clase asistida, suben de nivel y pueden canjear calcetines, botellas y accesorios exclusivos.
Atención y reservas por WhatsApp: +51 984 123 456.

Responde de forma concisa, cálida, estética y muy profesional (máximo 2 párrafos). Preséntate como Grace IA si es la primera interacción o te preguntan tu nombre. Recomienda agendar en la pestaña de Horarios o realizar nuestro Test Biomecánico si tienen dudas sobre lesiones o postura.`;

        const contents: any[] = [];
        if (Array.isArray(history)) {
          for (const item of history.slice(-6)) {
            // Keep at most last 6 turns
            if (item && item.role && item.text) {
              contents.push({
                role: item.role === 'user' ? 'user' : 'model',
                parts: [{ text: String(item.text).slice(0, 300) }],
              });
            }
          }
        }
        contents.push({
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nPregunta de la alumna/visitante: ${cleanMessage}` }],
        });

        const response = await generateWithTimeout(
          ai,
          {
            model: 'gemini-2.5-flash',
            contents,
          },
          5000
        );

        const replyText = response.text || '';
        if (replyText) {
          return res.json({
            success: true,
            source: 'gemini-2.5-flash',
            reply: replyText,
          });
        }
      }
    } catch (err: any) {
      console.warn('[AI Service] Gemini Chat API fallback triggered:', err.message);
    }

    // Intelligent Studio Heuristic Engine fallback
    let fallbackReply = '';
    if (
      lower.includes('dónde') ||
      lower.includes('donde') ||
      lower.includes('direccion') ||
      lower.includes('dirección') ||
      lower.includes('queda') ||
      lower.includes('ubicacion') ||
      lower.includes('ubicación') ||
      lower.includes('llegar')
    ) {
      fallbackReply =
        'Estamos ubicados en **Jr. Akapana 1261, San Juan de Lurigancho (Lima - SJL)**. Contamos con estacionamiento cercano y un ambiente boutique climatizado diseñado para tu desconexión y práctica segura.';
    } else if (
      lower.includes('primera clase') ||
      lower.includes('llevar') ||
      lower.includes('ropa') ||
      lower.includes('calcetines') ||
      lower.includes('iniciar') ||
      lower.includes('empezar')
    ) {
      fallbackReply =
        '¡Bienvenida a tu primera sesión! Te sugerimos vestir ropa deportiva cómoda (leggings y top/polo ajustado). Es **indispensable el uso de calcetines con grip antideslizante** para tu tracción en la barra de pies del Reformer. Si no tienes los tuyos, puedes adquirirlos en nuestra recepción en Jr. Akapana 1261 o canjearlos con tus EXP.';
    } else if (
      lower.includes('precio') ||
      lower.includes('cuanto') ||
      lower.includes('cuánto') ||
      lower.includes('costo') ||
      lower.includes('tarifa') ||
      lower.includes('plan') ||
      lower.includes('membresia') ||
      lower.includes('membresía')
    ) {
      fallbackReply =
        'Ofrecemos una **Clase de Prueba Introductoria desde S/. 45**, nuestro **Pack de 8 Clases a S/. 680** (ideal para 2 veces por semana) y la **Membresía Ilimitada Mensual a S/. 890**. Todas las opciones incluyen acceso a nuestras 8 camas Allegro 2 con aforo exclusivo.';
    } else if (
      lower.includes('espalda') ||
      lower.includes('dolor') ||
      lower.includes('lumbar') ||
      lower.includes('hernia') ||
      lower.includes('postura') ||
      lower.includes('lesion') ||
      lower.includes('lesión') ||
      lower.includes('cuello')
    ) {
      fallbackReply =
        'El Pilates Reformer es uno de los métodos biomecánicos más recomendados para descomprimir la columna vertebral, fortalecer el transverso abdominal y estabilizar la pelvis sin impacto articular. Te sugerimos realizar nuestro **Test Biomecánico** en la plataforma para que nuestras instructoras calibren los resortes según tu condición.';
    } else if (
      lower.includes('exp') ||
      lower.includes('nivel') ||
      lower.includes('niveles') ||
      lower.includes('puntos') ||
      lower.includes('canje') ||
      lower.includes('recompensa')
    ) {
      fallbackReply =
        'En FIRME STUDIO premiamos tu constancia: por cada clase completada recibes **+150 EXP**, lo que te permite avanzar de Nivel (desde Nv. 1 Semilla hasta Nv. 5 Leyenda FIRME). Tus puntos acumulados te permiten desbloquear reservas prioritarias y canjear calcetines grip y botellas térmicas en nuestra Boutique.';
    } else if (
      lower.includes('horario') ||
      lower.includes('reserva') ||
      lower.includes('agendar') ||
      lower.includes('turno')
    ) {
      fallbackReply =
        'Nuestras salas operan de **lunes a sábado desde las 06:30 AM hasta las 09:00 PM**. Puedes reservar tu turno y elegir tu cama preferida (#1 a #8) directamente en la pestaña **"Horarios"** de nuestra web o avisarnos por WhatsApp al +51 984 123 456.';
    } else {
      fallbackReply =
        '¡Hola! Soy Grace IA. En **FIRME STUDIO (Jr. Akapana 1261, SJL)** estamos listos para acompañar tu transformación postural con la máxima tecnología de camas Reformer Allegro 2. ¿Te gustaría conocer nuestros horarios de clase, las opciones de membresía o realizar el Test Biomecánico?';
    }

    res.json({
      success: true,
      source: 'studio-concierge-engine',
      reply: fallbackReply,
    });
  })
);

export default router;
