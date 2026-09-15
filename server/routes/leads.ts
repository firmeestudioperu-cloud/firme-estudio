import { Router, Request, Response } from 'express';
import { store } from '../data/store';
import { LeadRecord, ClientProfile } from '../../src/types';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// GET /api/leads - List leads
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { status, channel, interest } = req.query;
    let leads = store.getLeads();

    if (status) {
      leads = leads.filter((l) => l.status === status);
    }
    if (channel) {
      leads = leads.filter((l) => l.channel === channel);
    }
    if (interest) {
      leads = leads.filter((l) => l.interest === interest);
    }

    res.json({ success: true, data: leads, count: leads.length });
  })
);

// POST /api/leads - Create lead
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { name, phone, email, channel, status, interest, trialDate, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, error: 'Nombre y teléfono son obligatorios' });
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const newLead: LeadRecord = {
      id: `lead-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: email ? String(email).trim().toLowerCase() : undefined,
      channel: channel || 'instagram',
      status: status || 'nuevo',
      interest: interest || 'Reformer',
      trialDate: trialDate || undefined,
      notes: notes ? String(notes).trim() : '',
      createdAt: dateStr,
    };

    const created = store.addLead(newLead);
    res.status(201).json({ success: true, data: created, message: 'Prospecto registrado exitosamente' });
  })
);

// PUT /api/leads/:id - Update lead
router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const updated = store.updateLead(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Prospecto no encontrado para actualizar' });
    }
    res.json({ success: true, data: updated, message: 'Prospecto actualizado' });
  })
);

// PATCH /api/leads/:id/status - Update stage
router.patch(
  '/:id/status',
  asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Estado requerido' });
    }

    const updated = store.updateLead(req.params.id, { status });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Prospecto no encontrado' });
    }
    res.json({ success: true, data: updated, message: `Etapa actualizada a ${status}` });
  })
);

// POST /api/leads/:id/convert - Convert lead to official student client
router.post(
  '/:id/convert',
  asyncHandler(async (req: Request, res: Response) => {
    const lead = store.getLeads().find((l) => l.id === req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Prospecto no encontrado' });
    }

    // Mark lead as convertido
    store.updateLead(lead.id, { status: 'convertido' });

    const nowStr = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const creditsNum = Number(req.body.credits);

    // Create client profile
    const newClient: ClientProfile = {
      id: `cli-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: lead.name,
      dni: req.body.dni ? String(req.body.dni).trim() : 'Sin DNI',
      phone: lead.phone,
      email: lead.email || `${lead.name.toLowerCase().replace(/\s+/g, '.')}@cliente.pe`,
      currentPlan: req.body.plan || 'Pack 8 Clases (Bienvenida)',
      planType: 'pack',
      creditsLeft: Number.isFinite(creditsNum) && creditsNum >= 0 ? creditsNum : 8,
      totalAttended: 1, // Attended trial class
      status: 'activo',
      joinDate: nowStr,
      lastVisit: nowStr,
      emergencyContact: 'Por completar',
      medicalNotes: lead.notes ? `Observación inicial del embudo: ${lead.notes}` : 'Sin lesiones registradas.',
    };

    const createdClient = store.addClient(newClient);

    res.status(201).json({
      success: true,
      data: { lead, client: createdClient },
      message: `¡${lead.name} se ha convertido exitosamente en alumna oficial!`,
    });
  })
);

// DELETE /api/leads/:id - Delete lead
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const deleted = store.deleteLead(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Prospecto no encontrado para eliminar' });
    }
    res.json({ success: true, message: 'Prospecto eliminado' });
  })
);

export default router;
