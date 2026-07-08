import { accountRepository } from '../repositories/account';
import bcrypt from 'bcrypt';

export class AccountService {
  async getAccounts(filters: any, page: number = 1, limit: number = 10) {
    return accountRepository.getAccounts(filters, page, limit);
  }

  async getAccountById(id: string) {
    const account = await accountRepository.getAccountByIdAdmin(id);
    if (!account) throw new Error('Account not found');
    return account;
  }

  async updateAccount(adminId: string, accountId: string, updates: any) {
    const target = await accountRepository.findById(accountId);
    if (!target) throw new Error('Account not found');

    const updateData: any = { ...updates };
    
    // Prevent email and status from being updated here
    delete updateData.email;
    delete updateData.status;

    // Remove empty strings or undefined to avoid overriding with bad data
    
    // Convert effective_time and expired_time to Date if provided
    if (updateData.effective_time) updateData.effective_time = new Date(updateData.effective_time);
    if (updateData.expired_time) updateData.expired_time = new Date(updateData.expired_time);

    return accountRepository.executeAccountTransaction(async (tx) => {
      const updated = await accountRepository.updateAccount(accountId, updateData, tx);
      
      const changes = Object.keys(updates).map(k => `${k}=${updates[k]}`).join(', ');
      await accountRepository.createAuditLog({
        account_id: accountId,
        action: 'UPDATE',
        actor_id: adminId,
        changes: { description: `Account updated by admin: ${changes}` },
        created_at: new Date()
      }, tx);

      return updated;
    });
  }

  async updateAccountStatus(adminId: string, accountId: string, status: string, adminPassword: string) {
    const target = await accountRepository.findById(accountId);
    if (!target) throw new Error('Account not found');

    // Verify admin password before changing status
    await this.confirmPassword(adminId, adminPassword);

    return accountRepository.executeAccountTransaction(async (tx) => {
      const updated = await accountRepository.updateAccount(accountId, { status }, tx);
      
      await accountRepository.createAuditLog({
        account_id: accountId,
        action: 'UPDATE',
        actor_id: adminId,
        changes: { description: `Account status updated to ${status} by admin` },
        created_at: new Date()
      }, tx);

      return updated;
    });
  }

  async adminResetPassword(adminId: string, accountId: string, newPasswordRaw: string, adminPassword: string) {
    const target = await accountRepository.findById(accountId);
    if (!target) throw new Error('Account not found');

    await this.confirmPassword(adminId, adminPassword);

    const password_hash = await bcrypt.hash(newPasswordRaw, 10);

    return accountRepository.executeAccountTransaction(async (tx) => {
      const updated = await accountRepository.updateAccount(accountId, { password_hash }, tx);
      
      await accountRepository.createAuditLog({
        account_id: accountId,
        action: 'UPDATE',
        actor_id: adminId,
        changes: { description: 'Account password reset by admin' },
        created_at: new Date()
      }, tx);

      return updated;
    });
  }

  async deleteAccount(adminId: string, accountId: string, adminPassword: string) {
    const target = await accountRepository.findById(accountId);
    if (!target) throw new Error('Account not found');
    if (target.status !== 'deactivated') throw new Error('Account must be deactivated before deletion');

    // Verify admin password before deleting
    await this.confirmPassword(adminId, adminPassword);

    return accountRepository.executeAccountTransaction(async (tx) => {
      // Actually we might need to delete related data first or cascade in schema
      // Prisma schema doesn't have onDelete: Cascade for tickets? Let's assume it does, or we just delete account.
      // Wait, tickets target_account_id is set to null if setNull, but in schema it's Restrict by default if not set.
      // We will just try to delete the account. If it fails, the user must deactivate it instead.
      
      await accountRepository.createAuditLog({
        account_id: accountId,
        action: 'DELETE',
        actor_id: adminId,
        changes: { description: 'Account hard deleted by admin' },
        created_at: new Date()
      }, tx);

      return accountRepository.deleteAccount(accountId, tx);
    });
  }

  async confirmPassword(adminId: string, password: string) {
    const admin = await accountRepository.findById(adminId);
    if (!admin) throw new Error('Admin not found');
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) throw new Error('Invalid password');
    return true;
  }
}

export const accountService = new AccountService();
