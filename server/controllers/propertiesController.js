import { Op } from 'sequelize';
import models from '../models/index.js';

const propertiesController = {
  // Get a single property by ID
  async getPropertyById(req, res) {
    try {
      const { id } = req.params;
      
      const property = await models.Property.findByPk(id, {
        include: [
          {
            model: models.User,
            as: 'agent',
            attributes: ['id', 'name', 'email', 'phone', 'profileImage']
          }
        ]
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }
      
      // Format the response to match the frontend expectations
      const formattedProperty = {
        id: property.id,
        title: property.title || `${property.bedrooms} Bedroom ${property.propertyType}`,
        address: `${property.address}, ${property.city}, ${property.state}`,
        price: property.price,
        period: property.rentalPeriod || 'month',
        status: property.status || 'For Rent',
        beds: property.bedrooms,
        baths: property.bathrooms,
        area: property.area,
        type: property.propertyType,
        description: property.description,
        images: property.images || [],
        features: [
          { label: 'Air Conditioning', active: property.hasAirConditioning, icon: 'snowflake' },
          { label: 'Heating', active: property.hasHeating, icon: 'thermometer' },
          { label: 'Parking', active: property.hasParking, icon: 'car' },
          { label: 'Furnished', active: property.isFurnished, icon: 'couch' },
          { label: 'Pets Allowed', active: property.petsAllowed, icon: 'paw' },
          { label: 'Laundry', active: property.hasLaundry, icon: 'tshirt' },
          { label: 'WiFi', active: property.hasWifi, icon: 'wifi' },
          { label: 'Swimming Pool', active: property.hasPool, icon: 'water' },
        ],
        agent: {
          id: property.agent?.id,
          name: property.agent?.name || 'Agent',
          email: property.agent?.email,
          phone: property.agent?.phone,
          image: property.agent?.profileImage,
          rating: 4.8 // Default rating, can be updated later
        }
      };

      res.json({
        success: true,
        data: formattedProperty
      });
    } catch (error) {
      console.error('Error fetching property:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching property details',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

export default propertiesController;
