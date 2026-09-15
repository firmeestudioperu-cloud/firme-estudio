import { Router, Request, Response } from 'express';
import { store } from '../data/store';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// GET /api/bookings - List bookings (optionally filter by classId or clientEmail, supports page & limit)
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { classId, clientEmail, status, page, limit } = req.query;

    if (page !== undefined || limit !== undefined) {
      const pageNum = page ? Math.max(1, parseInt(String(page), 10) || 1) : 1;
      const limitNum = limit ? Math.max(1, parseInt(String(limit), 10) || 50) : 50;
      const result = store.getBookingsPaginated({
        classId: classId ? String(classId) : undefined,
        clientEmail: clientEmail ? String(clientEmail) : undefined,
        status: status ? String(status) : undefined,
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

    let bookings = store.getBookings();

    if (classId) {
      bookings = bookings.filter((b) => b.classId === classId);
    }
    if (clientEmail) {
      bookings = bookings.filter((b) => b.clientEmail.toLowerCase() === String(clientEmail).toLowerCase());
    }
    if (status) {
      bookings = bookings.filter((b) => b.status === status);
    }

    res.json({ success: true, data: bookings, count: bookings.length });
  })
);

// POST /api/bookings - Make a new reservation with atomic capacity & duplicate check
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { classId, clientName, clientEmail, clientPhone, clientDni, bedNumber, medicalAlert } = req.body;

    if (!classId || typeof classId !== 'string' || !classId.trim()) {
      return res.status(400).json({ success: false, error: 'Identificador de clase requerido' });
    }
    if (!clientName || typeof clientName !== 'string' || !clientName.trim()) {
      return res.status(400).json({ success: false, error: 'Nombre de la alumna o cliente requerido' });
    }
    if (!clientEmail || typeof clientEmail !== 'string' || !clientEmail.trim()) {
      return res.status(400).json({ success: false, error: 'Correo electrónico requerido' });
    }

    // Optional bed number parsing
    let parsedBedNumber: number | undefined = undefined;
    if (bedNumber !== undefined && bedNumber !== null && bedNumber !== '') {
      const num = Number(bedNumber);
      if (!Number.isInteger(num) || num < 1 || num > 8) {
        return res.status(400).json({ success: false, error: 'El número de cama debe ser un entero entre 1 y 8' });
      }
      parsedBedNumber = num;
    }

    const result = store.reserveSpot({
      classId: classId.trim(),
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone ? String(clientPhone).trim() : undefined,
      clientDni: clientDni ? String(clientDni).trim() : undefined,
      bedNumber: parsedBedNumber,
      medicalAlert: medicalAlert ? String(medicalAlert).trim() : undefined,
    });

    if (result.success === false) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.status(201).json({
      success: true,
      data: result.booking,
      message: 'Reserva confirmada exitosamente. ¡Te esperamos en FIRME STUDIO!',
    });
  })
);

// PATCH /api/bookings/:id/status - Update booking status
router.patch(
  '/:id/status',
  asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const validStatuses = ['confirmada', 'asistio', 'cancelada', 'lista_espera'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`,
      });
    }

    const updated = store.updateBookingStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Reserva no encontrada' });
    }

    res.json({ success: true, data: updated, message: `Estado actualizado a ${status}` });
  })
);

// POST /api/bookings/:id/check-in - Check-in Express at reception or kiosk
router.post(
  '/:id/check-in',
  asyncHandler(async (req: Request, res: Response) => {
    const { bedNumber } = req.body;
    let parsedBed: number | undefined = undefined;

    if (bedNumber !== undefined && bedNumber !== null && bedNumber !== '') {
      const num = Number(bedNumber);
      if (!Number.isInteger(num) || num < 1 || num > 8) {
        return res.status(400).json({ success: false, error: 'El número de cama debe ser un entero entre 1 y 8' });
      }
      parsedBed = num;
    }

    const result = store.checkInBooking(req.params.id, parsedBed);
    if (result.success === false) {
      const status = result.error.includes('no encontrada') ? 404 : 400;
      return res.status(status).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      data: result.booking,
      message: `¡Check-in confirmado para ${result.booking.clientName}! Cama asignada: Reformer #${result.booking.bedNumber || 'Sin asignar'}.`,
    });
  })
);

// POST /api/bookings/:id/assign-bed - Assign or change Reformer bed number (1-8)
router.post(
  '/:id/assign-bed',
  asyncHandler(async (req: Request, res: Response) => {
    const { bedNumber } = req.body;

    if (bedNumber === undefined || bedNumber === null || bedNumber === '') {
      return res.status(400).json({ success: false, error: 'El número de cama es requerido' });
    }

    const num = Number(bedNumber);
    if (!Number.isInteger(num) || num < 1 || num > 8) {
      return res.status(400).json({ success: false, error: 'El número de cama debe ser un entero entre 1 y 8' });
    }

    const result = store.assignBed(req.params.id, num);
    if (result.success === false) {
      const status = result.error.includes('no encontrada') ? 404 : 400;
      return res.status(status).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      data: result.booking,
      message: `Cama Reformer #${num} asignada correctamente a ${result.booking.clientName}`,
    });
  })
);

// POST /api/bookings/:id/cancel-with-refund - Studio fair cancellation with credit refund
router.post(
  '/:id/cancel-with-refund',
  asyncHandler(async (req: Request, res: Response) => {
    const result = store.cancelBookingWithRefund(req.params.id);
    if (!result.success || !result.booking) {
      return res.status(404).json({ success: false, error: result.error || 'Reserva no encontrada' });
    }

    res.json({
      success: true,
      data: result.booking,
      refunded: result.refunded ?? false,
      nextWaitlistCandidate: result.nextWaitlistCandidate ?? null,
      message: `Reserva de ${result.booking.clientName} cancelada. ${
        result.refunded ? '1 crédito devuelto al pack de la alumna.' : ''
      } Cupo liberado en sala.`,
    });
  })
);

// DELETE /api/bookings/:id - Cancel/delete booking
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const deleted = store.deleteBooking(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Reserva no encontrada para eliminar' });
    }
    res.json({ success: true, message: 'Reserva eliminada con éxito' });
  })
);

export default router;
