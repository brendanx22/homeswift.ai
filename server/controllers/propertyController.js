import { Op } from 'sequelize';
import models from '../models/index.js';

const propertyController = {
  // Enhanced search with filters
  async searchProperties(req, res) {
    try {
      console.log('Search request received with query:', req.query);
      
      const {
        q, 
        minPrice, 
        maxPrice, 
        bedrooms,
        propertyType,
        location,
        status = 'active',
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        limit = 12,
        page = 1
      } = req.query;

      const whereClause = { status: status };
      
      // Debug log
      console.log('Initial whereClause:', JSON.stringify(whereClause, null, 2));

      // Text search (search in title, description, address, city, state, zipcode)
      if (q) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } },
          { address: { [Op.iLike]: `%${q}%` } },
          { city: { [Op.iLike]: `%${q}%` } },
          { state: { [Op.iLike]: `%${q}%` } },
          { zipcode: { [Op.iLike]: `%${q}%` } }
        ];
      }

      // Location search (city, state, or zipcode)
      if (location) {
        whereClause[Op.or] = [
          { city: { [Op.iLike]: `%${location}%` } },
          { state: { [Op.iLike]: `%${location}%` } },
          { zipcode: { [Op.iLike]: `%${location}%` } }
        ];
      }

      // Price range
      if (minPrice || maxPrice) {
        whereClause.price = {};
        if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
        if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
      }

      // Bedrooms (exact match or greater than)
      if (bedrooms) {
        if (bedrooms.endsWith('+')) {
          whereClause.bedrooms = { [Op.gte]: parseInt(bedrooms) };
        } else {
          whereClause.bedrooms = parseInt(bedrooms);
        }
      }

      // Property type (exact match)
      // Property type (exact match, case insensitive)
      if (propertyType) {
        whereClause.propertyType = { [Op.iLike]: propertyType };
        console.log('Added propertyType filter:', propertyType);
      }

      // Order by
      const order = [];
      const validSortFields = ['price', 'bedrooms', 'bathrooms', 'area_sqft', 'year_built', 'created_at'];
      
      // Map any camelCase sort fields to snake_case
      const sortFieldMap = {
        squareFeet: 'area_sqft',
        areaSqft: 'area_sqft',
        yearBuilt: 'year_built',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      };
      
      const dbSortField = sortFieldMap[sortBy] || sortBy;
      
      if (dbSortField && validSortFields.includes(dbSortField)) {
        order.push([dbSortField, sortOrder.toUpperCase()]);
      } else {
        order.push(['created_at', 'DESC']);
      }

      // Include property images
      const include = [{
        model: models.PropertyImage,
        as: 'propertyImages',
        attributes: ['id', 'image_url', 'is_primary'],
        required: false // Use LEFT JOIN instead of INNER JOIN
      }];

      // Calculate pagination
      const pageSize = parseInt(limit) || 12;
      const currentPage = parseInt(page) || 1;
      const offset = (currentPage - 1) * pageSize;

      // Debug final query
      console.log('Final query:', {
        where: whereClause,
        order,
        limit: pageSize,
        offset,
        include
      });

      const result = await models.Property.findAndCountAll({
        where: whereClause,
        order,
        limit: pageSize,
        offset: offset,
        include,
        distinct: true
      });
      
      const { count, rows: properties } = result;
      console.log(`Found ${properties.length} of ${count} total properties`);

      res.json({
        success: true,
        count: properties.length,
        total: count,
        page: currentPage,
        totalPages: Math.ceil(count / pageSize),
        data: properties
      });
    } catch (error) {
      console.error('Search error:', error);
      console.error('Error stack:', error.stack);
      
      // Log the specific error if it's a database error
      if (error.original) {
        console.error('Database error:', error.original);
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to search properties',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack,
          originalError: error.original ? error.original.message : null
        } : undefined
      });
    }
  },

  // Get all properties with filters
  async getProperties(req, res) {
    console.log('GET /api/properties - Query params:', req.query);
    
    // Wrap the entire function in a try-catch to prevent server crashes
    try {
      const { 
        minPrice, 
        maxPrice, 
        bedrooms, 
        minBathrooms,
        maxBathrooms,
        propertyType, 
        city,
        state,
        minSqft,
        maxSqft,
        yearBuilt,
        sortBy = 'created_at',
        sortOrder = 'DESC',
        limit = 10,
        offset = 0
      } = req.query;

      const whereClause = {};

      // Apply filters
      if (minPrice || maxPrice) {
        whereClause.price = {};
        if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
        if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
      }
      
      // Ensure we're using snake_case for all database column names

      if (bedrooms) {
        if (bedrooms.endsWith('+')) {
          whereClause.bedrooms = { [Op.gte]: parseInt(bedrooms) };
        } else {
          whereClause.bedrooms = parseInt(bedrooms);
        }
      }

      if (minBathrooms || maxBathrooms) {
        whereClause.bathrooms = {};
        if (minBathrooms) whereClause.bathrooms[Op.gte] = parseFloat(minBathrooms);
        if (maxBathrooms) whereClause.bathrooms[Op.lte] = parseFloat(maxBathrooms);
      }

      if (propertyType) {
        whereClause.property_type = Array.isArray(propertyType) 
          ? { [Op.in]: propertyType }
          : propertyType;
        console.log('Filtering by property type:', whereClause.property_type);
      }

      if (city) whereClause.city = { [Op.iLike]: `%${city}%` };
      if (state) whereClause.state = { [Op.iLike]: `%${state}%` };

      if (minSqft || maxSqft) {
        whereClause.square_feet = {};
        if (minSqft) whereClause.square_feet[Op.gte] = parseInt(minSqft);
        if (maxSqft) whereClause.square_feet[Op.lte] = parseInt(maxSqft);
      }

      if (yearBuilt) {
        whereClause.year_built = { [Op.gte]: parseInt(yearBuilt) };
      }

      // Order by
      const order = [];
      const validSortFields = ['price', 'bedrooms', 'bathrooms', 'area_sqft', 'year_built', 'created_at'];
      
      // Map any camelCase sort fields to snake_case
      const sortFieldMap = {
        squareFeet: 'area_sqft',
        areaSqft: 'area_sqft',
        yearBuilt: 'year_built',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      };
      
      const dbSortField = sortFieldMap[sortBy] || sortBy;
      
      if (dbSortField && validSortFields.includes(dbSortField)) {
        order.push([dbSortField, sortOrder.toUpperCase()]);
      } else {
        order.push(['created_at', 'DESC']);
      }

      // Include property images
      const include = [{
        model: models.PropertyImage,
        as: 'propertyImages',
        attributes: ['id', 'image_url', 'is_primary'],
        required: false // Use LEFT JOIN instead of INNER JOIN
      }];
      
      console.log('Querying with whereClause:', JSON.stringify(whereClause, null, 2));

      const { count, rows: properties } = await models.Property.findAndCountAll({
        where: whereClause,
        include,
        limit: Math.min(parseInt(limit), 50),
        offset: parseInt(offset),
        order,
        distinct: true
      });

      res.json({
        success: true,
        count: properties.length,
        total: count,
        data: properties
      });
    } catch (error) {
      console.error('❌ Error in getProperties:', error);
      
      // Log detailed error information
      if (error.name === 'SequelizeDatabaseError') {
        console.error('Database error details:', error.original);
        console.error('SQL:', error.sql);
      } else if (error.name === 'SequelizeValidationError') {
        console.error('Validation errors:', error.errors.map(e => e.message));
      }
      
      // Always return a JSON response, even for errors
      res.status(500).json({
        success: false,
        error: 'Failed to fetch properties',
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
          name: error.name,
          details: error.errors || error.original?.message,
          sql: error.sql
        })
      });
      
      // Re-throw the error for development (will be caught by Express error handler)
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }
    }
  },

  // Get featured properties
  async getFeaturedProperties(req, res) {
    try {
      const properties = await models.Property.findAll({
        where: {
          is_featured: true
        },
        include: [{
          model: models.PropertyImage,
          as: 'propertyImages',
          where: { is_primary: true },
          required: false
        }],
        limit: 6,
        order: [['updatedAt', 'DESC']]
      });

      res.json({
        success: true,
        count: properties.length,
        data: properties
      });
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch featured properties',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get property by ID
  async getPropertyById(req, res) {
    try {
      const { id } = req.params;
      const property = await models.Property.findByPk(id, {
        include: [{
          model: models.PropertyImage,
          as: 'propertyImages'
        }]
      });

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
      console.error('Error fetching property:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch property',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Create a new property (admin only)
  async createProperty(req, res) {
    try {
      const propertyData = req.body;
      const newProperty = await models.Property.create(propertyData, {
        include: [{
          model: models.PropertyImage,
          as: 'propertyImages'
        }]
      });

      res.status(201).json({
        success: true,
        data: newProperty
      });
    } catch (error) {
      console.error('Error creating property:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create property',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Update a property (admin only)
  async updateProperty(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const [updated] = await models.Property.update(updates, {
        where: { id },
        returning: true
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: 'Property not found'
        });
      }

      const updatedProperty = await models.Property.findByPk(id, {
        include: [{
          model: models.PropertyImage,
          as: 'propertyImages'
        }]
      });
      
      res.json({
        success: true,
        data: updatedProperty
      });
    } catch (error) {
      console.error('Error updating property:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update property',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Delete a property (admin only)
  async deleteProperty(req, res) {
    try {
      const { id } = req.params;
      const deleted = await models.Property.destroy({
        where: { id }
      });

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Property not found'
        });
      }

      res.json({
        success: true,
        message: 'Property deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting property:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete property',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

export default propertyController;
