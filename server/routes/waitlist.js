import express from 'express';
import { Router } from 'express';
import * as waitlistController from '../controllers/waitlistController.js';
import { validateRequest } from '../middleware/validation.js';
import { body } from 'express-validator';

const router = Router();

// Validation rules
const waitlistValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('name').optional().trim().isLength({ max: 255 }).withMessage('Name is too long')
];

/**
 * @route   POST /api/waitlist
 * @desc    Add email to waitlist
 * @access  Public
 */
router.post('/', waitlistValidation, validateRequest, waitlistController.addToWaitlist);

/**
 * @route   GET /api/waitlist
 * @desc    Get all waitlist entries (protected)
 * @access  Private/Admin
 */
router.get('/', waitlistController.getWaitlist);

export default router;
