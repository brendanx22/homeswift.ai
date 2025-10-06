import { validationResult } from 'express-validator';

/**
 * Middleware to validate request using express-validator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array()
    });
  }
  next();
};

export default {
  validateRequest
};
