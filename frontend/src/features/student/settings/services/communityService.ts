import { CommunitySummary } from '../types';
import { apiFetch } from '../../../../services/api';

export const communityService = {
  async getStudentCommunity(): Promise<CommunitySummary> {
    return await apiFetch('/student/community');
  }
};


