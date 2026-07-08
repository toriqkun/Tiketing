import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';
import { accountRepository } from '../repositories/account';

export class AuthService {
  async login(usernameOrEmail: string, passwordString: string) {
    if (!usernameOrEmail || !passwordString) {
      throw new Error('Username/Email and password are required');
    }

    const user = await accountRepository.findByUsernameOrEmail(usernameOrEmail);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (user.status !== 'activated' && user.status !== 'active') {
      throw new Error('Your account has been deactivated');
    }

    const isMatch = await bcrypt.compare(passwordString, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid password');
    }

    const token = generateToken({ id: user.id });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        must_change_password: user.must_change_password,
      },
    };
  }

  async getMe(userId: string) {
    const user = await accountRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const now = new Date();
    const expiredTime = new Date(user.expired_time);
    const diffTime = expiredTime.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        is_admin: user.is_admin,
        status: user.status,
        effective_time: user.effective_time,
        expired_time: user.expired_time,
        must_change_password: user.must_change_password
      },
      days_until_expiry: diffDays
    };
  }

  async resetPassword(userId: string, oldPasswordString: string, newPasswordString: string, confirmPasswordString: string) {
    if (!oldPasswordString || !newPasswordString || !confirmPasswordString) {
      throw new Error('Old password, new password, and confirm password are required');
    }

    if (newPasswordString !== confirmPasswordString) {
      throw new Error('New password and confirm password do not match');
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!?_=+@#$%*<>/])[A-Za-z0-9!?_=+@#$%*<>/]{8,}$/;
    if (!passwordRegex.test(newPasswordString)) {
      throw new Error('New password must be at least 8 characters, contain at least one capital letter, and a combination of numbers and special characters like !?_=+@#$%*<>/');
    }

    const user = await accountRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(oldPasswordString, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid old password');
    }

    const newPasswordHash = await bcrypt.hash(newPasswordString, 10);

    await accountRepository.updateAccount(userId, {
      password_hash: newPasswordHash,
      must_change_password: false
    });

    return { message: 'Password reset successfully' };
  }
}

export const authService = new AuthService();
