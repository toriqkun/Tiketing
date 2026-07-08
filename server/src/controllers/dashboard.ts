import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { dashboardService } from '../services/dashboard';

export class DashboardController {
  async getSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await dashboardService.getSummary(req.user!.id, req.user!.is_admin);
      res.json({ code: 200, status: 'success', data });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
