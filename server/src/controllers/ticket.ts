import { Request, Response, NextFunction } from 'express';
import { ticketService } from '../services/ticket';
import { AuthRequest } from '../middlewares/auth';

export class TicketController {
  async createTicket(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body;
      const requesterId = req.user!.id;
      
      const ticket = await ticketService.createTicket(data, requesterId);
      res.status(201).json({
        code: 201,
        status: 'success',
        message: 'Ticket created successfully',
        data: ticket
      });
    } catch (error: any) {
      if (error.message === 'Invalid ticket type' || error.message === 'Target account not found or email mismatch') {
        res.status(400).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  async getTickets(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const isAdmin = req.user!.is_admin;
      const { page, limit, ...filters } = req.query;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;

      const result = await ticketService.getTickets(userId, isAdmin, filters, pageNum, limitNum);
      res.json({
        code: 200,
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getTicketById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const isAdmin = req.user!.is_admin;
      const ticketId = req.params.id as string;

      const ticket = await ticketService.getTicketById(ticketId, userId, isAdmin);
      res.json({
        code: 200,
        status: 'success',
        data: ticket
      });
    } catch (error: any) {
      if (error.message === 'Ticket not found or unauthorized') {
        res.status(404).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  async resubmitTicket(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await ticketService.resubmitTicket(req.params.id as string, req.user!.id, req.body);
      res.json({ code: 200, status: 'success', data: ticket });
    } catch (error: any) {
      if (error.message === 'Unauthorized' || error.message === 'Invalid phase for resubmit') {
        res.status(400).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  async reviewTicket(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user!.is_admin) throw new Error('Unauthorized');
      const ticket = await ticketService.reviewTicket(req.params.id as string, req.user!.id, req.body);
      res.json({ code: 200, status: 'success', data: ticket });
    } catch (error: any) {
      if (error.message === 'Unauthorized' || error.message === 'Ticket not found' || error.message.startsWith('Invalid') || error.message.startsWith('Must check')) {
        res.status(400).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  async proofTicket(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user!.is_admin) throw new Error('Unauthorized');
      
      const payload = { ...req.body };
      if (req.file) {
        payload.proof_image = `/uploads/${req.file.filename}`;
      }
      
      const ticket = await ticketService.proofTicket(req.params.id as string, req.user!.id, payload);
      res.json({ code: 200, status: 'success', data: ticket });
    } catch (error: any) {
      if (error.message === 'Unauthorized' || error.message === 'Ticket not found' || error.message.startsWith('Invalid')) {
        res.status(400).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  async confirmTicket(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await ticketService.confirmTicket(req.params.id as string, req.user!.id, req.body);
      res.json({ code: 200, status: 'success', data: ticket });
    } catch (error: any) {
      if (error.message === 'Unauthorized' || error.message === 'Ticket not found' || error.message.startsWith('Invalid')) {
        res.status(400).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }
}

export const ticketController = new TicketController();
