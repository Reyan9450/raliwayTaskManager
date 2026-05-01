import { Router } from 'express';
import { authMiddleware } from '../middleware';
import User from '../models/User';

const router = Router();

router.use(authMiddleware);

/**
 * GET /api/users
 * Returns all users (id, name, email, role) — no passwordHash.
 * Used by Admin to populate member selectors and track member tasks.
 */
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find({}, 'name email role').lean();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

export default router;
