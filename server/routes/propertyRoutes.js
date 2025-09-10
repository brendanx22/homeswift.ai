import express from 'express';
import { body, validationResult } from 'express-validator';
import { requireAuth, requireRole } from '../middleware/supabaseAuth.js';
import supabase from '../config/supabase.js';
import { Op } from 'sequelize';
import models from '../models/index.js';
import { 
  searchProperties, 
  getProperties, 
  getFeaturedProperties, 
  getPropertyById, 
  createProperty, 
  updateProperty, 
  deleteProperty 
} from '../controllers/propertyController.js';

const router = express.Router();

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation middleware
const validateProperty = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be a positive number'),
  body('bathrooms').isInt({ min: 0 }).withMessage('Bathrooms must be a positive number'),
  body('area').isNumeric().withMessage('Area must be a number'),
  body('type').isString().notEmpty().withMessage('Property type is required'),
  body('status').isIn(['for-sale', 'for-rent', 'sold', 'rented']).withMessage('Invalid status'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    next();
  }
];

/**
 * @swagger
 * tags:
 *   name: Properties
 *   description: Property management and search
 */

/**
// GET /api/properties - Get all properties with filtering (public access)
router.get('/', asyncHandler(async (req, res) => {
  try {
    const {
      minPrice,
      maxPrice,
      minBedrooms,
      maxBedrooms,
      minBathrooms,
      maxBathrooms,
      propertyType,
      city,
      q,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { status: 'active' };

    // Apply filters
    if (minPrice) where.price = { [Op.gte]: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, [Op.lte]: parseFloat(maxPrice) };
    if (minBedrooms) where.bedrooms = { [Op.gte]: parseInt(minBedrooms) };
    if (maxBedrooms) where.bedrooms = { ...where.bedrooms, [Op.lte]: parseInt(maxBedrooms) };
    if (minBathrooms) where.bathrooms = { [Op.gte]: parseFloat(minBathrooms) };
    if (maxBathrooms) where.bathrooms = { ...where.bathrooms, [Op.lte]: parseFloat(maxBathrooms) };
    if (propertyType) where.type = propertyType;
    if (city) where.city = { [Op.iLike]: `%${city}%` };

    // Text search
    if (q) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
        { address: { [Op.iLike]: `%${q}%` } }
      ];
    }

    const { count, rows: properties } = await models.Property.findAndCountAll({
      where,
      include: [
        {
          model: models.PropertyImage,
          as: 'images',
          attributes: ['id', 'url', 'isPrimary']
        },
        {
          model: models.User,
          as: 'agent',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar']
        }
      ],
      order: [[sortBy, sortOrder]],
      offset,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: properties,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties'
    });
  }
}));

// GET /api/properties/featured - Get featured properties (public access)
router.get('/featured', asyncHandler(async (req, res) => {
  try {
    const featuredProperties = await models.Property.findAll({
      where: { isFeatured: true, status: 'active' },
      limit: 6,
      include: [
        {
          model: models.PropertyImage,
          as: 'images',
          where: { isPrimary: true },
          required: false
        }
      ]
    });

    res.json({
      success: true,
      data: featuredProperties
    });
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured properties'
    });
  }
}));

// GET /api/properties/:id - Get property by ID (public access)
router.get('/:id', asyncHandler(async (req, res) => {
  try {
    const property = await models.Property.findByPk(req.params.id, {
      include: [
        {
          model: models.PropertyImage,
          as: 'images',
          attributes: ['id', 'url', 'isPrimary', 'description']
        },
        {
          model: models.User,
          as: 'agent',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar', 'bio']
        },
        {
          model: models.Review,
          as: 'reviews',
          include: [
            {
              model: models.User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'avatar']
            }
          ]
        }
      ]
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property'
    });
  }
}));

// POST /api/properties - Create new property (protected route)
router.post('/', requireAuth, validateProperty, asyncHandler(async (req, res) => {
  try {
    const propertyData = {
      ...req.body,
      userId: req.user.id,
      status: 'pending' // Default status for new properties
    };

    const property = await models.Property.create(propertyData);
    
    // Handle image uploads if any
    if (req.body.images && req.body.images.length > 0) {
      const images = req.body.images.map(img => ({
        ...img,
        propertyId: property.id,
        isPrimary: img.isPrimary || false
      }));
      await models.PropertyImage.bulkCreate(images);
    }

    // Reload the property with relationships
    const newProperty = await models.Property.findByPk(property.id, {
      include: [
        { model: models.PropertyImage, as: 'images' },
        { model: models.User, as: 'agent' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: newProperty
    });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create property',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// PUT /api/properties/:id - Update property (protected route)
router.put('/:id', requireAuth, validateProperty, asyncHandler(async (req, res) => {
  try {
    const property = await models.Property.findByPk(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if user is the owner or admin
    if (property.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property'
      });
    }

    await property.update(req.body);
    
    // Update images if provided
    if (req.body.images && Array.isArray(req.body.images)) {
      // Delete existing images
      await models.PropertyImage.destroy({ where: { propertyId: property.id } });
      
      // Add new images
      const images = req.body.images.map(img => ({
        ...img,
        propertyId: property.id,
        isPrimary: img.isPrimary || false
      }));
      
      await models.PropertyImage.bulkCreate(images);
    }

    // Reload the property with relationships
    const updatedProperty = await models.Property.findByPk(property.id, {
      include: [
        { model: models.PropertyImage, as: 'images' },
        { model: models.User, as: 'agent' }
      ]
    });

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: updatedProperty
    });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update property',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// DELETE /api/properties/:id - Delete property (protected route)
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  try {
    const property = await models.Property.findByPk(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if user is the owner or admin
    if (property.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property'
      });
    }

    // Soft delete by updating status
    await property.update({ status: 'deleted' });
    
    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete property',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by (e.g., 'price', 'bedrooms', 'createdAt')
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort order (ASC or DESC)
 *     responses:
 *       200:
 *         description: List of properties matching the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                   description: Number of properties in current page
 *                 total:
 *                   type: number
 *                   description: Total number of matching properties
 *                 page:
 *                   type: number
 *                   description: Current page number
 *                 totalPages:
 *                   type: number
 *                   description: Total number of pages
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Property'
 */
router.get('/search', searchProperties);

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Get all properties with optional filters
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: bedrooms
 *         schema:
 *           type: string
 *       - in: query
 *         name: minBathrooms
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxBathrooms
 *         schema:
 *           type: number
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: minSqft
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxSqft
 *         schema:
 *           type: number
 *       - in: query
 *         name: yearBuilt
 *         schema:
 *           type: number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, bedrooms, bathrooms, square_feet, year_built, createdAt]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: number
 *           default: 0
 *     responses:
 *       200:
 *         description: List of properties
 */
router.get('/', getProperties);

/**
 * @swagger
 * /api/properties/search:
 *   get:
 *     summary: Search properties with filters
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query text
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: bedrooms
 *         schema:
 *           type: string
 *       - in: query
 *         name: minBathrooms
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxBathrooms
 *         schema:
 *           type: number
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: minSqft
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxSqft
 *         schema:
 *           type: number
 *       - in: query
 *         name: yearBuilt
 *         schema:
 *           type: number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, bedrooms, bathrooms, square_feet, year_built, createdAt]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: number
 *           default: 0
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', searchProperties);

/**
 * @swagger
 * /api/properties/featured:
 *   get:
 *     summary: Get featured properties
 *     tags: [Properties]
 *     responses:
 *       200:
 *         description: List of featured properties
 */
router.get('/featured', getFeaturedProperties);

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get a property by ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property details
 *       404:
 *         description: Property not found
 */
router.get('/:id', getPropertyById);

// Protected routes (require authentication and admin role)

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Create a new property (admin only)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Property'
 *     responses:
 *       201:
 *         description: Property created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/', requireAuth, requireRole('admin'), createProperty);

/**
 * @swagger
 * /api/properties/{id}:
 *   put:
 *     summary: Update a property (admin only)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Property'
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Property not found
 */
router.put('/:id', requireAuth, requireRole('admin'), updateProperty);

/**
 * @swagger
 * /api/properties/{id}:
 *   delete:
 *     summary: Delete a property (admin only)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Property not found
 */
router.delete('/:id', requireAuth, requireRole('admin'), deleteProperty);

export { router as propertyRouter };
