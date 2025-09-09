import express from 'express';
import searchController from '../controllers/searchController.js';

const router = express.Router();

// GET /api/search/suggestions - Get search suggestions
router.get('/suggestions', searchController.getSuggestions);

// POST /api/search - Perform property search with filters
router.post('/', searchController.searchProperties);

export default router;
