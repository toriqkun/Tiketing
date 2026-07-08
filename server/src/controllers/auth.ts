import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth';
import { AuthRequest } from '../middlewares/auth';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { usernameOrEmail, password } = req.body;
      const { user, token } = await authService.login(usernameOrEmail, password);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        code: 200,
        status: "success",
        message: "Login Successful",
        user,
        token,
      });
    } catch (error: any) {
      if (error.message === 'Invalid credentials' || error.message === 'Your account has been deactivated' || error.message === 'Account is deactivated') {
        res.status(401).json({ error: error.message });
      } else if (error.message === 'Username/Email and password are required') {
        res.status(400).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  logout(req: Request, res: Response): void {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.json({
      code: 200,
      status: "success",
      message: "Logout Successful"
    });
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await authService.getMe(userId);
      res.json(result);
    } catch (error: any) {
      if (error.message === 'User not found') {
        res.status(404).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  async resetPassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { oldPassword, newPassword, confirmPassword } = req.body;
      const result = await authService.resetPassword(userId, oldPassword, newPassword, confirmPassword);
      res.json({
        code: 200,
        status: "success",
        message: result.message
      });
    } catch (error: any) {
      if (error.message.includes('Invalid old password') || error.message.includes('New password must be') || error.message.includes('do not match')) {
        res.status(400).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }
}

export const authController = new AuthController();
