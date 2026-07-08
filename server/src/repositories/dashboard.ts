import prisma from '../utils/prisma';

export class DashboardRepository {
  async getAdminSummary() {
    const totalActiveTickets = await prisma.ticket.count({
      where: { status: 'running' }
    });

    const totalAccounts = await prisma.account.count({
      where: { status: 'activated' }
    });

    const deactivatedAccounts = await prisma.account.count({
      where: { status: 'deactivated' }
    });

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const accountsExpiringSoon = await prisma.account.count({
      where: {
        status: 'activated',
        expired_time: {
          lte: thirtyDaysFromNow,
          gte: new Date()
        }
      }
    });

    return {
      totalActiveTickets,
      totalAccounts,
      accountsExpiringSoon,
      deactivatedAccounts
    };
  }

  async getUserSummary(userId: string) {
    const totalTickets = await prisma.ticket.count({
      where: { requester_id: userId }
    });

    const activeTickets = await prisma.ticket.count({
      where: { requester_id: userId, status: 'running' }
    });

    const rejectedTickets = await prisma.ticketHistory.count({
      where: {
        actor_id: userId,
        phase: 'confirmation',
        action: 'confirm_reject'
      }
    });

    const account = await prisma.account.findUnique({
      where: { id: userId },
      select: { expired_time: true }
    });

    let daysUntilExpiry = 0;
    if (account?.expired_time) {
      const diffTime = new Date(account.expired_time).getTime() - new Date().getTime();
      daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return {
      totalTickets,
      activeTickets,
      rejectedTickets,
      daysUntilExpiry
    };
  }
}

export const dashboardRepository = new DashboardRepository();
