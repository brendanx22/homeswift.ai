import { Op } from 'sequelize';
import models from '../models/index.js';

const searchController = {
  // Search properties with filters
  async searchProperties(req, res) {
    try {
      const { query = '', filters = {} } = req.body;
      const { 
        minPrice, 
        maxPrice, 
        bedrooms, 
        propertyType, 
        minArea,
        maxArea,
        status = 'for_sale' // Default to 'for_sale' if not specified
      } = filters;

      // Build search conditions
      const where = {
        [Op.and]: []
      };

      // Add text search conditions
      if (query) {
        const searchConditions = [
          { title: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
          { address: { [Op.iLike]: `%${query}%` } },
          { city: { [Op.iLike]: `%${query}%` } },
          { state: { [Op.iLike]: `%${query}%` } },
          { postal_code: { [Op.iLike]: `%${query}%` } },
          { features: { [Op.contains]: [query] } }
        ];
        where[Op.and].push({
          [Op.or]: searchConditions
        });
      }

      // Add price filter
      if (minPrice || maxPrice) {
        const priceCondition = {};
        if (minPrice) priceCondition[Op.gte] = parseFloat(minPrice);
        if (maxPrice) priceCondition[Op.lte] = parseFloat(maxPrice);
        where[Op.and].push({ price: priceCondition });
      }

      // Add bedrooms filter
      if (bedrooms) {
        where[Op.and].push({ bedrooms: { [Op.gte]: parseInt(bedrooms) } });
      }

      // Add property type filter
      if (propertyType) {
        where[Op.and].push({ property_type: propertyType });
      }

      // Add area filter
      if (minArea || maxArea) {
        const areaCondition = {};
        if (minArea) areaCondition[Op.gte] = parseInt(minArea);
        if (maxArea) areaCondition[Op.lte] = parseInt(maxArea);
        where[Op.and].push({ area_sqft: areaCondition });
      }

      // Add status filter
      if (status) {
        where[Op.and].push({ status });
      }

      // Include property images
      const include = [
        {
          model: models.PropertyImage,
          as: 'images',
          attributes: ['id', 'image_url', 'is_primary']
        }
      ];

      // Execute query
      const properties = await models.Property.findAll({
        where,
        include,
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        count: properties.length,
        data: properties
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to perform search',
        message: error.message
      });
    }
  },

  // Get search suggestions
  async getSuggestions(req, res) {
    try {
      const { q } = req.query;
      
      // Get suggestions from the database
      const suggestions = await models.Property.findAll({
        attributes: [
          [models.sequelize.fn('DISTINCT', models.sequelize.col('city')), 'city'],
          'state',
          'postal_code'
        ],
        where: q ? {
          [Op.or]: [
            { city: { [Op.iLike]: `%${q}%` } },
            { state: { [Op.iLike]: `%${q}%` } },
            { postal_code: { [Op.iLike]: `%${q}%` } }
          ]
        } : {},
        limit: 8,
        raw: true
      });

      // Format suggestions
      const formatted = suggestions.map(item => {
        const parts = [];
        if (item.city) parts.push(item.city);
        if (item.state) parts.push(item.state);
        if (item.postal_code) parts.push(item.postal_code);
        return parts.join(', ');
      });

      // Remove duplicates
      const uniqueSuggestions = [...new Set(formatted)];

      res.json({
        success: true,
        data: uniqueSuggestions
      });
    } catch (error) {
      console.error('Suggestion error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch suggestions',
        message: error.message
      });
    }
  }
};

export default searchController;
