import { Request, Response } from 'express';
import { NoteModel } from './freedom-wall.model';

/** GET /api/freedom-wall — return all notes, newest first */
export async function getNotes(_req: Request, res: Response): Promise<void> {
  try {
    const notes = await NoteModel.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: notes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch notes' });
  }
}

/** POST /api/freedom-wall — create a new note */
export async function createNote(req: Request, res: Response): Promise<void> {
  try {
    const { content, x, y, color, rotation } = req.body;

    if (!content?.trim()) {
      res.status(400).json({ success: false, message: 'Content is required' });
      return;
    }

    const note = await NoteModel.create({
      content: content.trim(),
      x: x ?? 0,
      y: y ?? 0,
      color: color ?? 'bg-yellow-100 border-yellow-300 text-yellow-900',
      rotation: rotation ?? 0,
    });

    res.status(201).json({ success: true, data: note });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create note' });
  }
}

/** PATCH /api/freedom-wall/:id/position — update x/y position */
export async function updateNotePosition(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { x, y } = req.body;

    if (typeof x !== 'number' || typeof y !== 'number') {
      res.status(400).json({ success: false, message: 'x and y must be numbers' });
      return;
    }

    const note = await NoteModel.findByIdAndUpdate(
      id,
      { x, y },
      { new: true, lean: true }
    );

    if (!note) {
      res.status(404).json({ success: false, message: 'Note not found' });
      return;
    }

    res.json({ success: true, data: note });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update note position' });
  }
}

/** DELETE /api/freedom-wall/:id — remove a note */
export async function deleteNote(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const note = await NoteModel.findByIdAndDelete(id);

    if (!note) {
      res.status(404).json({ success: false, message: 'Note not found' });
      return;
    }

    res.json({ success: true, message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete note' });
  }
}
