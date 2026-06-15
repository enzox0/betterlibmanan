import { Router } from 'express';
import {
  getNotes,
  createNote,
  updateNotePosition,
  deleteNote,
} from './freedom-wall.controller';

export const freedomWallRouter: Router = Router();

freedomWallRouter.get('/', getNotes);
freedomWallRouter.post('/', createNote);
freedomWallRouter.patch('/:id/position', updateNotePosition);
freedomWallRouter.delete('/:id', deleteNote);
