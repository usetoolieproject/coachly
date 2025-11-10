import { overviewService } from '../overview/services/overviewService';
import { OverviewStats } from '../overview/types';

export interface AdminStats extends OverviewStats {}

export class AdminService {
  static async getAdminStats(): Promise<AdminStats> {
    return await overviewService.getOverviewStats();
  }
}

export { overviewService };
