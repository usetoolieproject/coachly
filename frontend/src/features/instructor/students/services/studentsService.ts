import type { Student, StudentDetails } from '../types';
import { apiFetch } from '../../../../services/api';

export const studentsService = {
  async list(): Promise<Student[]> {
    return await apiFetch('/instructor/students');
  },
  async get(studentId: string): Promise<StudentDetails> {
    return await apiFetch(`/instructor/students/${studentId}`);
  },
};


