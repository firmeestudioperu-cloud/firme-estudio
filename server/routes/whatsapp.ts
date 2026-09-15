import { Router, Request, Response } from 'express';
import { store } from '../data/store';
import { WhatsAppMessageLog } from '../../src/types';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// GET /api/whatsapp/templates - Pre-configured templates
router.get(
  '/templates',
  asyncHandler(async (req: Request, res: Response) => {
    const templates = [
      {
        id: 'tpl-reminder',
        title: 'Recordatorio de Clase (3 horas antes)',
        category: 'recordatorio',
        template:
          '¡Hola {nombre}! ✨ Te recordamos tu clase de {clase} hoy a las {hora} con {instructora} en FIRME STUDIO.\n\n📍 Ubicación: Jr. Akapana 1261 (SJL, Lima)\n🧦 Recuerda traer tus calcetines antideslizantes obligatorios.\nTe esperamos con tu cama {cama} lista.',
        variables: ['nombre', 'clase', 'hora', 'instructora', 'cama'],
      },
      {
        id: 'tpl-waitlist',
        title: 'Aviso de Cupo Liberado (Lista de Espera)',
        category: 'lista_espera',
        template:
          '¡Buenas noticias {nombre}! 🎉 Se ha liberado un cupo para la sesión de {clase} hoy a las {hora} con {instructora} en FIRME STUDIO.\n\n¿Deseas confirmar tu asistencia? Responde SI a este mensaje para reservar tu cama en los próximos 15 minutos.',
        variables: ['nombre', 'clase', 'hora', 'instructora'],
      },
      {
        id: 'tpl-post-trial',
        title: 'Seguimiento Post-Clase de Prueba (Leads)',
        category: 'post_prueba',
        template:
          '¡Hola {nombre}! 🌿 Esperamos que hayas disfrutado al máximo tu clase de prueba en el Reformer con {instructora}.\n\nPara que continúes fortaleciendo tu postura y centro, tenemos activo para ti un 15% de descuento en tu primer Pack de 8 clases (S/. 578 en vez de S/. 680).\n\n¿Te gustaría que te reservemos tus días fijos esta semana?',
        variables: ['nombre', 'instructora'],
      },
      {
        id: 'tpl-cancellation',
        title: 'Confirmación de Cancelación Justa',
        category: 'cancelacion',
        template:
          'Hola {nombre}, confirmamos la cancelación de tu clase de {clase} del día {fecha} a las {hora}. Tu crédito ha sido retornado a tu cuenta de FIRME STUDIO. ¡Esperamos verte en tu siguiente sesión!',
        variables: ['nombre', 'clase', 'fecha', 'hora'],
      },
    ];

    res.json({ success: true, data: templates });
  })
);

// GET /api/whatsapp/logs - Get history of sent notifications
router.get(
  '/logs',
  asyncHandler(async (req: Request, res: Response) => {
    const logs = store.getWhatsAppLogs();
    res.json({ success: true, data: logs });
  })
);

// POST /api/whatsapp/send-log - Register an event when a message link is clicked/sent
router.post(
  '/send-log',
  asyncHandler(async (req: Request, res: Response) => {
    const { toName, toPhone, type, content } = req.body;
    if (!toName || !toPhone) {
      return res.status(400).json({ success: false, error: 'Nombre y teléfono son requeridos' });
    }

    const now = new Date();
    const sentAt = `${now.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;

    const log: WhatsAppMessageLog = {
      id: `wa-${Date.now()}`,
      toName: String(toName).trim(),
      toPhone: String(toPhone).trim(),
      type: type || 'recordatorio',
      sentAt,
      status: 'enviado',
      content: content ? String(content).trim() : '',
    };

    const saved = store.recordWhatsAppLog(log);
    res.status(201).json({ success: true, data: saved });
  })
);

export default router;
