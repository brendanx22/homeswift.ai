import { Op } from 'sequelize';
import models from '../models/index.js';

const searchController = {
  // Generic search endpoint
  async searchProperties(req, res) {
    try {
      const { query = '' } = req.body;
      const results = [];
      
      if (query) {
        // Search users
        const users = await models.User.findAll({
          where: {
            [Op.or]: [
              { name: { [Op.iLike]: `%${query}%` } },
              { email: { [Op.iLike]: `%${query}%` } }
            ]
          },
          attributes: ['id', 'name', 'email']
        });
        
        if (users && users.length > 0) {
          results.push({
            type: 'users',
            items: users
          });
        }
      }
      
      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({
        success: false,
        message: 'Error performing search',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get search suggestions
  async getSuggestions(req, res) {
    try {
      const { query = '' } = req.query;
      const suggestions = [];
      
      if (query) {
        // Add user suggestions
        const users = await models.User.findAll({
          where: {
            [Op.or]: [
              { name: { [Op.iLike]: `%${query}%` } },
              { email: { [Op.iLike]: `%${query}%` } }
            ]
          },
          attributes: ['id', 'name', 'email'],
          limit: 5
        });
        
        suggestions.push(...users.map(user => ({
          type: 'user',
          id: user.id,
          name: user.name,
          email: user.email
        })));
      }
      
      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      console.error('Suggestion error:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting suggestions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

export default searchController;
