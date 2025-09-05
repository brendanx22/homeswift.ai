import express from 'express';

const router = express.Router();

// Mock search suggestions
const searchSuggestions = [
  "2 bedroom apartment Lagos",
  "3 bedroom house Abuja", 
  "Luxury apartments Victoria Island",
  "Houses for sale Lekki",
  "Apartments for rent Ikeja",
  "Duplex Magodo",
  "Penthouse Ikoyi",
  "Studio apartment Yaba"
];

// GET /api/search/suggestions - Get search suggestions
router.get('/suggestions', (req, res) => {
  try {
    const { q } = req.query;
    
    let filteredSuggestions = searchSuggestions;
    
    if (q) {
      filteredSuggestions = searchSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(q.toLowerCase())
      );
    }

    res.json({
      success: true,
      data: filteredSuggestions.slice(0, 8) // Limit to 8 suggestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch suggestions',
      message: error.message
    });
  }
});

// POST /api/search - Perform property search
router.post('/', (req, res) => {
  try {
    const { query, filters = {} } = req.body;

    // Mock search results based on query
    const mockResults = [
      {
        id: 1,
        title: "Modern 2BR Apartment",
        location: "Victoria Island, Lagos",
        price: 2500000,
        type: "apartment",
        bedrooms: 2,
        bathrooms: 2,
        image: "/2bedroommainland.jpg",
        relevanceScore: 0.95
      },
      {
        id: 2,
        title: "Luxury 3BR House",
        location: "Lekki Phase 1, Lagos", 
        price: 5000000,
        type: "house",
        bedrooms: 3,
        bathrooms: 3,
        image: "/EkoAtlanticCity.jpg",
        relevanceScore: 0.87
      }
    ];

    // Filter results based on query
    let filteredResults = mockResults;
    if (query) {
      filteredResults = mockResults.filter(result =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.location.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply additional filters
    if (filters.minPrice) {
      filteredResults = filteredResults.filter(r => r.price >= filters.minPrice);
    }
    if (filters.maxPrice) {
      filteredResults = filteredResults.filter(r => r.price <= filters.maxPrice);
    }
    if (filters.bedrooms) {
      filteredResults = filteredResults.filter(r => r.bedrooms >= filters.bedrooms);
    }
    if (filters.type) {
      filteredResults = filteredResults.filter(r => r.type === filters.type);
    }

    // Sort by relevance score
    filteredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    res.json({
      success: true,
      data: {
        query,
        results: filteredResults,
        totalResults: filteredResults.length,
        searchTime: Math.random() * 100 + 50 // Mock search time in ms
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message
    });
  }
});

export default router;
