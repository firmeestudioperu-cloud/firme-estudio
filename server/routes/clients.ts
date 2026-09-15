import { Router, Request, Response } from 'express';
import { store } from '../data/store';
import { ClientProfile } from '../../src/types';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// GET /api/clients - List all clients or filter (supports page & limit)
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { search, status, planType, page, limit } = req.query;

    if (page !== undefined || limit !== undefined) {
      const pageNum = page ? Math.max(1, parseInt(String(page), 10) || 1) : 1;
      const limitNum = limit ? Math.max(1, parseInt(String(limit), 10) || 50) : 50;
      const result = store.getClientsPaginated({
        search: search ? String(search) : undefined,
        status: status ? String(status) : undefined,
        planType: planType ? String(planType) : undefined,
        page: pageNum,
        limit: limitNum,
      });

      return res.json({
        success: true,
        data: result.items,
        count: result.items.length,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    }

    let clients = store.getClients();

    if (search) {
      const q = String(search).toLowerCase();
      clients = clients.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.dni.includes(q) ||
          c.phone.includes(q)
      );
    }

    if (status) {
      clients = clients.filter((c) => c.status === status);
    }

    if (planType) {
      clients = clients.filter((c) => c.planType === planType);
    }

    res.json({ success: true, data: clients, count: clients.length });
  })
);

// GET /api/clients/:id - Get client by ID
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const client = store.getClientById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, error: 'Cliente no encontrado' });
    }
    res.json({ success: true, data: client });
  })
);

// POST /api/clients - Create new client
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { name, dni, phone, email, currentPlan, planType, creditsLeft, emergencyContact, medicalNotes } = req.body;

    if (!name || !dni || !phone || !email) {
      return res.status(400).json({ success: false, error: 'Nombre, DNI, teléfono y correo son obligatorios' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanDni = String(dni).trim();

    // Check for existing client with same email or DNI
    const existing = store.getClients().find(
      (c) => c.email.toLowerCase() === cleanEmail || (cleanDni && c.dni === cleanDni)
    );
    if (existing) {
      return res.status(400).json({
        success: false,
        error: `Ya existe una alumna registrada con ese ${existing.dni === cleanDni ? 'DNI' : 'correo electrónico'} (${existing.name}).`,
      });
    }

    const nowStr = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const creditsNum = Number(creditsLeft);

    const newClient: ClientProfile = {
      id: `cli-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: String(name).trim(),
      dni: cleanDni,
      phone: String(phone).trim(),
      email: cleanEmail,
      currentPlan: currentPlan || 'Pack 8 Clases',
      planType: planType || 'pack',
      creditsLeft: Number.isFinite(creditsNum) && creditsNum >= 0 ? creditsNum : 8,
      totalAttended: 0,
      status: 'activo',
      joinDate: nowStr,
      lastVisit: nowStr,
      emergencyContact: emergencyContact ? String(emergencyContact).trim() : '',
      medicalNotes: medicalNotes ? String(medicalNotes).trim() : '',
    };

    const created = store.addClient(newClient);
    res.status(201).json({ success: true, data: created, message: 'Cliente registrado exitosamente' });
  })
);

// PUT /api/clients/:id - Update client
router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const updated = store.updateClient(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Cliente no encontrado para actualizar' });
    }
    res.json({ success: true, data: updated, message: 'Ficha de cliente actualizada' });
  })
);

// DELETE /api/clients/:id - Delete client
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const deleted = store.deleteClient(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Cliente no encontrado para eliminar' });
    }
    res.json({ success: true, message: 'Cliente eliminado correctamente' });
  })
);

export default router;
