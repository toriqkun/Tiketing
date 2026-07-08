import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { accountService } from '../services/account';

export class AccountController {
  async getAccounts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = {
        search: req.query.search as string,
        phone: req.query.phone as string,
        status: req.query.status as string,
        is_admin: req.query.is_admin as string
      };

      const result = await accountService.getAccounts(filters, page, limit);
      res.json({ code: 200, status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAccountById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const account = await accountService.getAccountById(req.params.id as string);
      res.json({ code: 200, status: 'success', data: account });
    } catch (error) {
      next(error);
    }
  }

  async updateAccount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user!.is_admin) throw new Error('Unauthorized');
      const account = await accountService.updateAccount(req.user!.id, req.params.id as string, req.body);
      res.json({ code: 200, status: 'success', data: account });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user!.is_admin) throw new Error('Unauthorized');
      const { status, password } = req.body;
      if (!status || !password) throw new Error('Status and password are required');

      const account = await accountService.updateAccountStatus(req.user!.id, req.params.id as string, status, password);
      res.json({ code: 200, status: 'success', message: 'Status updated successfully', data: account });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async deleteAccount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user!.is_admin) throw new Error('Unauthorized');
      const { password } = req.body;
      if (!password) throw new Error('Admin password is required to delete an account');

      await accountService.deleteAccount(req.user!.id, req.params.id as string, password);
      res.json({ code: 200, status: 'success', message: 'Account deleted' });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async adminResetPassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user!.is_admin) throw new Error('Unauthorized');
      const { new_password, password } = req.body;
      if (!new_password || !password) throw new Error('New password and admin password are required');

      const account = await accountService.adminResetPassword(req.user!.id, req.params.id as string, new_password, password);
      res.json({ code: 200, status: 'success', message: 'Password reset successfully', data: account });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
}

export const accountController = new AccountController();
