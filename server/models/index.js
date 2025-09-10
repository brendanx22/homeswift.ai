import Database from '../config/database.js';
import initUserModel from './User.js';

class Models {
  constructor() {
    this.sequelize = null;
    this.User = null;
  }

  async initialize() {
    const database = new Database();
    this.sequelize = await database.connect();
    
    // Initialize models
    this.User = initUserModel(this.sequelize);
    
    // Set up any associations
    this.setupAssociations();
    
    return this;
  }

  setupAssociations() {
    // Add any user-related associations here
  }

  getSequelize() {
    return this.sequelize;
  }
}

// Create singleton instance
const models = new Models();

export default models;
export { models };
