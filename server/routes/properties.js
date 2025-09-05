import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Mock data for development
const mockProperties = [
  {
    id: 1,
    title: "Modern 2BR Apartment in Victoria Island",
    price: 2500000,
    location: "Victoria Island, Lagos",
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    type: "apartment",
    status: "for-rent",
    images: ["/2bedroommainland.jpg"],
    description: "Beautiful modern apartment with ocean views",
    amenities: ["Swimming Pool", "Gym", "Security", "Parking"],
    coordinates: { lat: 6.4281, lng: 3.4219 }
  },
  {
    id: 2,
    title: "Luxury 3BR House in Lekki",
    price: 5000000,
    location: "Lekki Phase 1, Lagos",
    bedrooms: 3,
    bathrooms: 3,
    area: 2000,
    type: "house",
    status: "for-sale",
    images: ["/EkoAtlanticCity.jpg"],
    description: "Spacious family home in prime location",
    amenities: ["Garden", "Garage", "Security", "Generator"],
    coordinates: { lat: 6.4698, lng: 3.5852 }
  }
];

// GET /api/properties - Get all properties with filtering
router.get('/', (req, res) => {
  try {
    const { 
      type, 
      status, 
      minPrice, 
      maxPrice, 
      bedrooms, 
      location, 
      page = 1, 
      limit = 10 
    } = req.query;

    let filteredProperties = [...mockProperties];

    // Apply filters
    if (type) {
      filteredProperties = filteredProperties.filter(p => p.type === type);
    }
    if (status) {
      filteredProperties = filteredProperties.filter(p => p.status === status);
    }
    if (minPrice) {
      filteredProperties = filteredProperties.filter(p => p.price >= parseInt(minPrice));
    }
    if (maxPrice) {
      filteredProperties = filteredProperties.filter(p => p.price <= parseInt(maxPrice));
    }
    if (bedrooms) {
      filteredProperties = filteredProperties.filter(p => p.bedrooms >= parseInt(bedrooms));
    }
    if (location) {
      filteredProperties = filteredProperties.filter(p => 
        p.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedProperties,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredProperties.length / limit),
        totalItems: filteredProperties.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch properties',
      message: error.message
    });
  }
});

// GET /api/properties/:id - Get single property
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const property = mockProperties.find(p => p.id === parseInt(id));

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch property',
      message: error.message
    });
  }
});

// POST /api/properties - Create new property
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('location').notEmpty().withMessage('Location is required'),
  body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be a positive integer'),
  body('bathrooms').isInt({ min: 0 }).withMessage('Bathrooms must be a positive integer'),
  body('area').isNumeric().withMessage('Area must be a number'),
  body('type').isIn(['apartment', 'house', 'condo', 'townhouse']).withMessage('Invalid property type'),
  body('status').isIn(['for-rent', 'for-sale']).withMessage('Invalid property status')
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

    const newProperty = {
      id: mockProperties.length + 1,
      ...req.body,
      createdAt: new Date().toISOString()
    };

    mockProperties.push(newProperty);

    res.status(201).json({
      success: true,
      data: newProperty,
      message: 'Property created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create property',
      message: error.message
    });
  }
});

// PUT /api/properties/:id - Update property
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const propertyIndex = mockProperties.findIndex(p => p.id === parseInt(id));

    if (propertyIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    mockProperties[propertyIndex] = {
      ...mockProperties[propertyIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: mockProperties[propertyIndex],
      message: 'Property updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update property',
      message: error.message
    });
  }
});

// DELETE /api/properties/:id - Delete property
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const propertyIndex = mockProperties.findIndex(p => p.id === parseInt(id));

    if (propertyIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    mockProperties.splice(propertyIndex, 1);

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete property',
      message: error.message
    });
  }
});

export default router;
