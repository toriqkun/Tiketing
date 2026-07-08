import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export class AccountRepository {
  async findByUsernameOrEmail(usernameOrEmail: string) {
    return prisma.account.findFirst({
      where: {
        OR: [
          { username: usernameOrEmail },
          { email: usernameOrEmail }
        ]
      }
    });
  }

  async findById(id: string) {
    return prisma.account.findUnique({
      where: { id }
    });
  }

  async createAccount(data: Prisma.AccountCreateInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.account.create({ data });
  }

  async updateAccount(id: string, data: Prisma.AccountUpdateInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.account.update({ where: { id }, data });
  }

  async createAuditLog(data: Prisma.AccountAuditLogUncheckedCreateInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.accountAuditLog.create({ data });
  }

  async getAccounts(filters: any, page: number, limit: number) {
    const where: Prisma.AccountWhereInput = {};
    if (filters.search) {
      where.OR = [
        { username: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ];
    }
    if (filters.phone) {
      where.phone = { contains: filters.phone, mode: 'insensitive' };
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.is_admin !== undefined) {
      where.is_admin = filters.is_admin === 'true' || filters.is_admin === true;
    }

    const skip = (page - 1) * limit;

    const [total, accounts] = await Promise.all([
      prisma.account.count({ where }),
      prisma.account.findMany({
        where,
        skip,
        take: limit,
        orderBy: { effective_time: 'desc' }
      })
    ]);

    const data = accounts.map((acc: any) => {
      delete acc.password_hash;
      return acc;
    });

    return { total, page, limit, data };
  }

  async getAccountByIdAdmin(id: string) {
    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        tickets_targeted: {
          orderBy: { created_at: 'desc' },
          take: 5
        },
        audit_logs: {
          orderBy: { created_at: 'desc' },
          take: 10
        }
      }
    });

    if (account) {
      delete (account as any).password_hash;
    }
    return account;
  }

  async deleteAccount(id: string, tx?: any) {
    const client = tx || prisma;
    return client.account.delete({ where: { id } });
  }

  async executeAccountTransaction<T>(
    operation: (tx: Prisma.TransactionClient) => Promise<T>
  ) {
    return prisma.$transaction(operation);
  }
}

export const accountRepository = new AccountRepository();
