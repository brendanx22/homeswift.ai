import express from 'express';
import { deleteUser, getAllUsers } from '../controllers/userController.js';
import { authenticateJWT, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Admin routes
router.get('/', authenticateJWT, isAdmin, getAllUsers);
router.delete('/:userId', authenticateJWT, isAdmin, deleteUser);

// User routes (users can manage their own data)
router.delete('/me', authenticateJWT, (req, res) => {
  // This will call deleteUser with the current user's ID
  req.params.userId = req.user.id;
  return deleteUser(req, res);
});

export default router;
