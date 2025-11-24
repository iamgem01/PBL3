import { Router } from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
} from '../controllers/eventController';

const router = Router();

// Event CRUD routes
router.get('/events', getAllEvents);
router.get('/events/upcoming', getUpcomingEvents);
router.get('/events/:id', getEventById);
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);

export default router;