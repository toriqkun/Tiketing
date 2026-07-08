import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export class TicketRepository {
  async createTicket(data: Prisma.TicketUncheckedCreateInput, historyDescription?: string) {
    return prisma.ticket.create({
      data: {
        ...data,
        histories: historyDescription ? {
          create: {
            phase: 'submit',
            action: 'Submit Ticket',
            actor_id: data.requester_id,
            description: historyDescription
          }
        } : undefined
      }
    });
  }

  async getTickets(
    userId: string,
    isAdmin: boolean,
    filters: {
      ticket_number?: string;
      status?: string;
      ticket_type?: string;
      current_phase?: string;
    },
    page: number = 1,
    limit: number = 10
  ) {
    const where: Prisma.TicketWhereInput = {};



    if (filters.ticket_number) {
      where.ticket_number = { contains: filters.ticket_number, mode: 'insensitive' };
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.ticket_type) {
      where.ticket_type = filters.ticket_type;
    }
    if (filters.current_phase) {
      where.current_phase = filters.current_phase;
    }

    const [total, tickets] = await prisma.$transaction([
      prisma.ticket.count({ where }),
      prisma.ticket.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          target_account: {
            select: { username: true, email: true }
          },
          requester: {
            select: { username: true, email: true }
          }
        }
      })
    ]);

    return { total, tickets, page, limit };
  }

  async getTicketById(id: string, userId: string, isAdmin: boolean) {
    const where: Prisma.TicketWhereInput = { id };


    return prisma.ticket.findFirst({
      where,
      include: {
        histories: {
          orderBy: { created_at: 'asc' },
          include: {
            actor: {
              select: { username: true, email: true }
            }
          }
        },
        target_account: {
          select: { username: true, email: true }
        },
        requester: {
          select: { username: true, email: true }
        }
      }
    });
  }

  async countTodayTickets() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.ticket.count({
      where: {
        created_at: {
          gte: today,
          lt: tomorrow
        }
      }
    });
  }

  async updateTicketPhase(ticketId: string, updates: Partial<Prisma.TicketUpdateInput>) {
    return prisma.ticket.update({
      where: { id: ticketId },
      data: updates,
    });
  }

  async addHistory(data: Prisma.TicketHistoryUncheckedCreateInput) {
    return prisma.ticketHistory.create({
      data,
    });
  }

  async executeTicketTransaction<T>(
    operation: (tx: Prisma.TransactionClient) => Promise<T>
  ) {
    return prisma.$transaction(operation);
  }
}

export const ticketRepository = new TicketRepository();
