import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Mock user data
const mockUsers = [
  {
    id: 1,
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe",
    phone: "+234-801-234-5678",
    role: "buyer",
    preferences: {
      propertyTypes: ["apartment", "house"],
      priceRange: { min: 1000000, max: 5000000 },
      locations: ["Lagos", "Abuja"]
    },
    savedProperties: [1, 2],
    createdAt: "2024-01-15T10:30:00Z"
  }
];

// GET /api/users/profile/:id - Get user profile
router.get('/profile/:id', (req, res) => {
  try {
    const { id } = req.params;
    const user = mockUsers.find(u => u.id === parseInt(id));

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Remove sensitive data
    const { password, ...userProfile } = user;

    res.json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile',
      message: error.message
    });
  }
});

// PUT /api/users/profile/:id - Update user profile
router.put('/profile/:id', [
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const userIndex = mockUsers.findIndex(u => u.id === parseInt(id));

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    const { password, ...updatedUser } = mockUsers[userIndex];

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      message: error.message
    });
  }
});

// GET /api/users/:id/saved-properties - Get user's saved properties
router.get('/:id/saved-properties', (req, res) => {
  try {
    const { id } = req.params;
    const user = mockUsers.find(u => u.id === parseInt(id));

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        savedProperties: user.savedProperties || [],
        count: user.savedProperties?.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch saved properties',
      message: error.message
    });
  }
});

// POST /api/users/:id/saved-properties - Save a property
router.post('/:id/saved-properties', [
  body('propertyId').isInt({ min: 1 }).withMessage('Valid property ID is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { propertyId } = req.body;
    const userIndex = mockUsers.findIndex(u => u.id === parseInt(id));

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!mockUsers[userIndex].savedProperties) {
      mockUsers[userIndex].savedProperties = [];
    }

    if (!mockUsers[userIndex].savedProperties.includes(propertyId)) {
      mockUsers[userIndex].savedProperties.push(propertyId);
    }

    res.json({
      success: true,
      data: {
        savedProperties: mockUsers[userIndex].savedProperties,
        message: 'Property saved successfully'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to save property',
      message: error.message
    });
  }
});

// DELETE /api/users/:id/saved-properties/:propertyId - Remove saved property
router.delete('/:id/saved-properties/:propertyId', (req, res) => {
  try {
    const { id, propertyId } = req.params;
    const userIndex = mockUsers.findIndex(u => u.id === parseInt(id));

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (mockUsers[userIndex].savedProperties) {
      mockUsers[userIndex].savedProperties = mockUsers[userIndex].savedProperties.filter(
        pid => pid !== parseInt(propertyId)
      );
    }

    res.json({
      success: true,
      data: {
        savedProperties: mockUsers[userIndex].savedProperties || [],
        message: 'Property removed from saved list'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to remove saved property',
      message: error.message
    });
  }
});

export default router;
