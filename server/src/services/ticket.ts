import { ticketRepository } from '../repositories/ticket';
import { accountRepository } from '../repositories/account';
import bcrypt from 'bcrypt';
import { generateRandomPassword } from '../utils/password';
import { sendEmail } from '../utils/email';

export class TicketService {
  private async applyBusinessEffects(ticket: any, tx: any) {
    if (ticket.ticket_type === 'create') {
      const password = 'Onm12345!';
      const passwordHash = await bcrypt.hash(password, 10);
      const effective = new Date();
      const expired = new Date();
      expired.setMonth(expired.getMonth() + 1);

      await accountRepository.createAccount({
        username: ticket.target_username!,
        email: ticket.target_email!,
        phone: ticket.target_phone,
        password_hash: passwordHash,
        effective_time: effective,
        expired_time: expired,
        must_change_password: true
      }, tx);

      sendEmail(
        ticket.target_email!,
        'Your Account Has Been Created',
        `Hello ${ticket.target_username},\n\nYour account has been created.\nUsername: ${ticket.target_username}\nPassword: ${password}\n\nPlease login and keep this safe.`
      );
    } else if (ticket.target_account_id) {
      const target = await accountRepository.findById(ticket.target_account_id);
      if (target) {
        if (ticket.ticket_type === 'extend') {
          const currentExp = new Date(target.expired_time).getTime();
          const now = new Date().getTime();
          const baseDate = currentExp > now ? new Date(target.expired_time) : new Date();
          baseDate.setMonth(baseDate.getMonth() + 1);
          await accountRepository.updateAccount(target.id, { 
            expired_time: baseDate,
            status: 'activated'
          }, tx);

          sendEmail(
            target.email,
            'Your Account Has Been Extended',
            `Hello ${target.username},\n\nYour account validity has been successfully extended by 1 month.\nNew Expiry Date: ${baseDate.toLocaleString()}`
          );
        } else if (ticket.ticket_type === 'upgrade') {
          sendEmail(
            target.email,
            'Your Account Has Been Upgraded',
            `Hello ${target.username},\n\nCongratulations! Your account has been upgraded to Administrator privileges.`
          );
        } else if (ticket.ticket_type === 'inactive') {
          await accountRepository.updateAccount(target.id, { status: 'deactivated' }, tx);

          sendEmail(
            target.email,
            'Your Account Has Been Deactivated',
            `Hello ${target.username},\n\nYour account has been deactivated. If you believe this is a mistake, please contact support.`
          );
        }
      }
    }
  }

  private async generateTicketNumber() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    const count = await ticketRepository.countTodayTickets();
    const sequence = String(count + 1).padStart(4, '0');

    return `TCK-${yyyy}${mm}${dd}-${sequence}`;
  }

  async createTicket(data: {
    ticket_type: string;
    description: string;
    target_username: string;
    target_email: string;
    target_phone: string;
  }, requesterId: string) {
    if (!['create', 'extend', 'upgrade', 'inactive'].includes(data.ticket_type)) {
      throw new Error('Invalid ticket type');
    }

    if (!data.description || data.description.trim() === '') throw new Error('Description is required');
    if (data.ticket_type !== 'create') {
      if (!data.target_username || data.target_username.trim() === '') throw new Error('Target username is required');
      if (!data.target_phone || data.target_phone.trim() === '') throw new Error('Target phone is required');
    }
    if (!data.target_email || data.target_email.trim() === '') throw new Error('Target email is required');

    let targetAccountId = null;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.target_email && !emailRegex.test(data.target_email)) {
      throw new Error('Invalid email format for target account');
    }

    if (data.ticket_type === 'create') {
      const existingEmail = await accountRepository.findByUsernameOrEmail(data.target_email);
      if (existingEmail && existingEmail.email === data.target_email) {
        throw new Error('Account with this email already exists');
      }
    } else {
      const targetAccount = await accountRepository.findByUsernameOrEmail(data.target_username);
      if (
        !targetAccount || 
        targetAccount.username !== data.target_username || 
        targetAccount.email !== data.target_email || 
        targetAccount.phone !== data.target_phone
      ) {
        throw new Error('Target account is invalid or not registered. Please enter a valid and registered username, email, and phone number.');
      }
      targetAccountId = targetAccount.id;
    }

    const ticket_number = await this.generateTicketNumber();

    const ticket = await ticketRepository.createTicket({
      ticket_number,
      ticket_type: data.ticket_type,
      description: data.description,
      target_username: data.target_username || '',
      target_email: data.target_email,
      target_phone: data.target_phone || '',
      target_account_id: targetAccountId,
      requester_id: requesterId,
      status: 'running',
      current_phase: 'approval'
    }, JSON.stringify({
      target_email: data.target_email,
      target_username: data.target_username || '',
      description: data.description
    }));

    return ticket;
  }

  async getTickets(
    userId: string,
    isAdmin: boolean,
    filters: any,
    page: number = 1,
    limit: number = 10
  ) {
    return ticketRepository.getTickets(userId, isAdmin, filters, page, limit);
  }

  async getTicketById(id: string, userId: string, isAdmin: boolean) {
    const ticket = await ticketRepository.getTicketById(id, userId, isAdmin);
    if (!ticket) {
      throw new Error('Ticket not found or unauthorized');
    }
    return ticket;
  }

  async resubmitTicket(id: string, requesterId: string, data: { description?: string; target_username?: string; target_email?: string; target_phone?: string }) {
    if (!data.description || data.description.trim() === '') throw new Error('Description is required');
    
    const ticket = await ticketRepository.getTicketById(id, requesterId, false);
    if (!ticket || ticket.requester_id !== requesterId) throw new Error('Unauthorized');
    if (ticket.current_phase !== 'submit') throw new Error('Invalid phase for resubmit');

    if (ticket.ticket_type !== 'create') {
      if (!data.target_username || data.target_username.trim() === '') throw new Error('Target username is required');
      if (!data.target_phone || data.target_phone.trim() === '') throw new Error('Target phone is required');
    }
    if (!data.target_email || data.target_email.trim() === '') throw new Error('Target email is required');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.target_email && !emailRegex.test(data.target_email)) {
      throw new Error('Invalid email format for target account');
    }

    if (ticket.ticket_type === 'create') {
      const existingEmail = await accountRepository.findByUsernameOrEmail(data.target_email);
      if (existingEmail && existingEmail.email === data.target_email) throw new Error('Account with this email already exists');
    } else {
      const targetAccount = await accountRepository.findByUsernameOrEmail(data.target_username!);
      if (
        !targetAccount || 
        targetAccount.username !== data.target_username || 
        targetAccount.email !== data.target_email || 
        targetAccount.phone !== data.target_phone
      ) {
        throw new Error('Target account is invalid or not registered. Please enter a valid and registered username, email, and phone number.');
      }
    }

    return ticketRepository.executeTicketTransaction(async (tx) => {
      const updated = await tx.ticket.update({
        where: { id },
        data: {
          description: data.description,
          target_username: data.target_username || '',
          target_email: data.target_email,
          target_phone: data.target_phone || '',
          current_phase: 'approval'
        }
      });
      await tx.ticketHistory.create({
        data: {
          ticket_id: id,
          phase: 'submit',
          action: 'resubmit',
          actor_id: requesterId,
          description: JSON.stringify({
            target_email: data.target_email || ticket.target_email,
            target_username: data.target_username || ticket.target_username,
            description: data.description
          })
        }
      });
      return updated;
    });
  }

  async reviewTicket(id: string, adminId: string, data: { checked: boolean; decision: 'accept' | 'reject'; description: string }) {
    if (data.checked !== true) throw new Error('Must check before review');
    if (!data.decision || !['accept', 'reject'].includes(data.decision)) {
      throw new Error("Decision must be either 'accept' or 'reject'");
    }
    if (!data.description || data.description.trim() === '') throw new Error('Description is required');

    const ticket = await ticketRepository.getTicketById(id, adminId, true);
    if (!ticket) throw new Error('Ticket not found');
    if (ticket.current_phase !== 'approval') throw new Error('Invalid phase for review');

    return ticketRepository.executeTicketTransaction(async (tx) => {
      let nextPhase = 'submit';
      if (data.decision === 'accept') {
        if (ticket.ticket_type === 'upgrade') {
          nextPhase = 'proof';
        } else {
          nextPhase = 'confirmation';
        }
      }

      const updated = await tx.ticket.update({
        where: { id },
        data: { current_phase: nextPhase }
      });

      await tx.ticketHistory.create({
        data: { ticket_id: id, phase: 'approval', action: data.decision, actor_id: adminId, description: data.description }
      });

      if (data.decision === 'accept' && nextPhase === 'confirmation') {
        await tx.ticketHistory.create({
          data: { ticket_id: id, phase: 'proof', action: 'proof_auto', description: 'System Auto Proof for ' + ticket.ticket_type }
        });
        
        const count = await tx.ticketHistory.count({
          where: { ticket_id: id, action: { in: ['proof_auto', 'proof_manual'] } }
        });
        if (count === 1) {
          await this.applyBusinessEffects(ticket, tx);
        }
      }

      return updated;
    });
  }

  async proofTicket(id: string, adminId: string, data: { description: string; proof_image?: string }) {
    if (!data.description || data.description.trim() === '') throw new Error('Description is required');

    const ticket = await ticketRepository.getTicketById(id, adminId, true);
    if (!ticket) throw new Error('Ticket not found');
    if (ticket.current_phase !== 'proof') throw new Error('Invalid phase for manual proof');

    return ticketRepository.executeTicketTransaction(async (tx) => {
      const updated = await tx.ticket.update({
        where: { id },
        data: { current_phase: 'confirmation' }
      });

      await tx.ticketHistory.create({
        data: { ticket_id: id, phase: 'proof', action: 'proof_manual', actor_id: adminId, description: data.description, proof_image: data.proof_image }
      });

      const count = await tx.ticketHistory.count({
        where: { ticket_id: id, action: { in: ['proof_auto', 'proof_manual'] } }
      });
      if (count === 1) {
        await this.applyBusinessEffects(ticket, tx);
      }

      return updated;
    });
  }

  async confirmTicket(id: string, requesterId: string, data: { decision: 'accept' | 'reject'; description: string }) {
    if (!data.decision || !['accept', 'reject'].includes(data.decision)) {
      throw new Error("Decision must be either 'accept' or 'reject'");
    }
    if (!data.description || data.description.trim() === '') throw new Error('Description is required');

    const ticket = await ticketRepository.getTicketById(id, requesterId, false);
    if (!ticket || ticket.requester_id !== requesterId) throw new Error('Unauthorized');
    if (ticket.current_phase !== 'confirmation') throw new Error('Invalid phase for confirmation');

    if (data.decision === 'reject') {
      return ticketRepository.executeTicketTransaction(async (tx) => {
        const updated = await tx.ticket.update({
          where: { id },
          data: { current_phase: 'proof' }
        });
        await tx.ticketHistory.create({
          data: { ticket_id: id, phase: 'confirmation', action: 'confirm_reject', actor_id: requesterId, description: data.description }
        });
        return updated;
      });
    }

    // Accept -> complete ticket
    return ticketRepository.executeTicketTransaction(async (tx) => {
      const updated = await tx.ticket.update({
        where: { id },
        data: { current_phase: 'completed', status: 'closed' }
      });
      await tx.ticketHistory.create({
        data: { ticket_id: id, phase: 'confirmation', action: 'confirm_accept', actor_id: requesterId, description: data.description }
      });

      return updated;
    });
  }
}

export const ticketService = new TicketService();
