import { Router } from 'express';
import {
  getNotes,
  createNote,
  updateNotePosition,
  deleteNote,
} from './freedom-wall.controller';
import { requireAuth } from '@/modules/auth/auth.module';

export const freedomWallRouter: Router = Router();

freedomWallRouter.get('/', getNotes);
freedomWallRouter.post('/', createNote);
freedomWallRouter.patch('/:id/position', updateNotePosition);

// Only authenticated admins can delete notes from the wall
freedomWallRouter.delete('/:id', requireAuth, deleteNote);
