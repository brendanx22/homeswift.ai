import Database from '../config/database.js';
import initUserModel from './User.js';
import initPropertyModel from './Property.js';
import initPropertyImageModel from './PropertyImage.js';

class Models {
  constructor() {
    this.sequelize = null;
    this.User = null;
    this.Property = null;
    this.PropertyImage = null;
  }

  async initialize() {
    const database = new Database();
    this.sequelize = await database.connect();
    
    // Initialize models
    this.User = initUserModel(this.sequelize);
    this.Property = initPropertyModel(this.sequelize);
    this.PropertyImage = initPropertyImageModel(this.sequelize);
    
    // Set up associations
    this.setupAssociations();
    
    return this;
  }

  setupAssociations() {
    // Property has many Images
    this.Property.hasMany(this.PropertyImage, {
      foreignKey: 'property_id',
      as: 'propertyImages'
    });

    // Image belongs to Property
    this.PropertyImage.belongsTo(this.Property, {
      foreignKey: 'property_id',
      as: 'property'
    });
  }

  getSequelize() {
    return this.sequelize;
  }
}

// Create singleton instance
const models = new Models();

export default models;
export { models };
