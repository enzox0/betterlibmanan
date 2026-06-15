import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/freedom-wall`,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminNote {
  _id: string;
  content: string;
  x: number;
  y: number;
  color: string;
  rotation: number;
  createdAt: string;
  updatedAt: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

/** Fetch all notes (public — no token needed). */
export async function listNotes(): Promise<AdminNote[]> {
  const { data } = await apiClient.get<{ success: boolean; data: AdminNote[] }>('/');
  return data.data;
}

/** Delete a note — requires admin access token. */
export async function deleteNoteRequest(id: string, accessToken: string): Promise<void> {
  await apiClient.delete(`/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
