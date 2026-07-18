/**
 * Freedom Wall API client
 *
 * Talks to `POST/GET/PATCH/DELETE /api/freedom-wall` on the backend.
 * Uses the native Fetch API — no extra deps required.
 */

const BASE = "/api/freedom-wall";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NoteDTO {
  _id: string;
  content: string;
  x: number;
  y: number;
  color: string;
  rotation: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body?.message ?? `Request failed: ${res.status}`);
  }

  return body.data as T;
}

// ─── API functions ────────────────────────────────────────────────────────────

/** Fetch all notes, newest first. */
export function getNotes(): Promise<NoteDTO[]> {
  return request<NoteDTO[]>(BASE);
}

/** Create a new note and return the saved document. */
export function createNote(payload: {
  content: string;
  x: number;
  y: number;
  color: string;
  rotation: number;
}): Promise<NoteDTO> {
  return request<NoteDTO>(BASE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Update only the x/y position of a note. */
export function updateNotePosition(
  id: string,
  x: number,
  y: number,
): Promise<NoteDTO> {
  return request<NoteDTO>(`${BASE}/${id}/position`, {
    method: "PATCH",
    body: JSON.stringify({ x, y }),
  });
}

/** Delete a note by id. */
export async function deleteNote(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `Delete failed: ${res.status}`);
  }
}
