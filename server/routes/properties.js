import express from 'express';
import { body, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import models from '../models/index.js';
import jwtAuth from '../middleware/jwtAuth.js';

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

// Helper function to build property filter
const buildPropertyFilter = (query) => {
  const {
    minPrice,
    maxPrice,
    minBedrooms,
    maxBedrooms,
    minBathrooms,
    maxBathrooms,
    propertyType,
    city,
    status = 'active',
    featured,
    q
  } = query;

  const filter = { status };

  // Price range
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price[Op.gte] = parseFloat(minPrice);
    if (maxPrice) filter.price[Op.lte] = parseFloat(maxPrice);
  }

  // Bedrooms
  if (minBedrooms || maxBedrooms) {
    filter.bedrooms = {};
    if (minBedrooms) filter.bedrooms[Op.gte] = parseInt(minBedrooms);
    if (maxBedrooms) filter.bedrooms[Op.lte] = parseInt(maxBedrooms);
  }

  // Bathrooms
  if (minBathrooms || maxBathrooms) {
    filter.bathrooms = {};
    if (minBathrooms) filter.bathrooms[Op.gte] = parseInt(minBathrooms);
    if (maxBathrooms) filter.bathrooms[Op.lte] = parseInt(maxBathrooms);
  }

  // Property type
  if (propertyType) {
    filter.type = propertyType;
  }

  // City
  if (city) {
    filter.city = { [Op.iLike]: `%${city}%` };
  }

  // Featured
  if (featured !== undefined) {
    filter.featured = featured === 'true';
  }

  // Text search
  if (q) {
    filter[Op.or] = [
      { title: { [Op.iLike]: `%${q}%` } },
      { description: { [Op.iLike]: `%${q}%` } },
      { address: { [Op.iLike]: `%${q}%` } },
      { city: { [Op.iLike]: `%${q}%` } },
      { state: { [Op.iLike]: `%${q}%` } },
      { zipcode: { [Op.iLike]: `%${q}%` } }
    ];
  }

  return filter;
};

// GET /api/properties - Get all properties with filtering (public access)
router.get('/', asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      ...query
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const filter = buildPropertyFilter(query);

    const { count, rows: properties } = await models.Property.findAndCountAll({
      where: filter,
      include: [
        { model: models.User, as: 'agent', attributes: ['id', 'name', 'email', 'phone'] },
        { model: models.PropertyImage, as: 'images' }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
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
      message: 'Failed to fetch properties',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// GET /api/properties/featured - Get featured properties (public access)
router.get('/featured', asyncHandler(async (req, res) => {
  try {
    const properties = await models.Property.findAll({
      where: { 
        featured: true,
        status: 'active'
      },
      include: [
        { model: models.PropertyImage, as: 'images', limit: 1 }
      ],
      limit: 6
    });

    res.json({ success: true, data: properties });
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
        { model: models.User, as: 'agent', attributes: ['id', 'name', 'email', 'phone'] },
        { model: models.PropertyImage, as: 'images' },
        { 
          model: models.Review, 
          as: 'reviews',
          include: [
            { model: models.User, as: 'user', attributes: ['id', 'name', 'avatar'] }
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

    // Increment view count
    await property.increment('views', { by: 1 });

    res.json({ success: true, data: property });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property'
    });
  }
}));

// POST /api/properties - Create new property (requires authentication)
router.post('/', jwtAuth, validateProperty, asyncHandler(async (req, res) => {
  try {
    const propertyData = {
      ...req.body,
      userId: req.user.id,
      status: 'pending' // Default status for new properties
    };

    const property = await models.Property.create(propertyData);
    
    // Handle image uploads if any
    if (req.files && req.files.length > 0) {
      const images = req.files.map(file => ({
        propertyId: property.id,
        url: `/uploads/${file.filename}`,
        isPrimary: false
      }));
      
      if (images.length > 0) {
        images[0].isPrimary = true; // Set first image as primary
        await models.PropertyImage.bulkCreate(images);
      }
    }

    // Reload property with relationships
    const newProperty = await models.Property.findByPk(property.id, {
      include: [
        { model: models.PropertyImage, as: 'images' }
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

// PUT /api/properties/:id - Update property (requires authentication)
router.put('/:id', jwtAuth, validateProperty, asyncHandler(async (req, res) => {
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
    
    res.json({
      success: true,
      message: 'Property updated successfully',
      data: property
    });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update property'
    });
  }
}));

// DELETE /api/properties/:id - Delete property (requires authentication)
router.delete('/:id', jwtAuth, asyncHandler(async (req, res) => {
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

    // Soft delete
    await property.update({ status: 'deleted' });
    
    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete property'
    });
  }
}));

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Properties API is working',
    timestamp: new Date().toISOString()
  });
});

export default router;