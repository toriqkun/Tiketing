import { dashboardRepository } from '../repositories/dashboard';

export class DashboardService {
  async getSummary(userId: string, isAdmin: boolean) {
    if (isAdmin) {
      return dashboardRepository.getAdminSummary();
    } else {
      return dashboardRepository.getUserSummary(userId);
    }
  }
}

export const dashboardService = new DashboardService();
