import type { Call } from '../types';
import { apiFetch } from '../../../../services/api';

export async function fetchInstructorCalls(): Promise<Call[]> {
  return await apiFetch('/instructor/live-calls');
}

export async function saveInstructorCall(call: Partial<Call>): Promise<Call> {
  const isNew = !call.id;
  const url = isNew ? '/instructor/live-calls' : `/instructor/live-calls/${call.id}`;
  const method = isNew ? 'POST' : 'PUT';
  return await apiFetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(call)
  });
}

export async function deleteInstructorCall(id: string): Promise<void> {
  await apiFetch(`/instructor/live-calls/${id}`, { method: 'DELETE' });
}


