import { DataTypes, Model } from 'sequelize';

class Property extends Model {}

const initPropertyModel = (sequelize) => {
  Property.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'address'
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Using postal_code as the primary zip code field to match the database
  postal_code: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'postal_code'
  },
  // Also include zip_code for backward compatibility
  zip_code: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('postal_code');
    },
    set(value) {
      this.setDataValue('postal_code', value);
    }
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bathrooms: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: false
  },
  area_sqft: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'area_sqft'
  },
  // Virtual field for backward compatibility with square_feet
  square_feet: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('area_sqft');
    },
    set(value) {
      this.setDataValue('area_sqft', value);
    }
  },
  year_built: {
    type: DataTypes.INTEGER,
    field: 'year_built'
  },
  property_type: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'property_type'
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'status'
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'country'
  },
  latitude: {
    type: DataTypes.DECIMAL,
    allowNull: true,
    field: 'latitude'
  },
  longitude: {
    type: DataTypes.DECIMAL,
    allowNull: true,
    field: 'longitude'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id'
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_featured'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
  }, {
    sequelize,
    modelName: 'Property',
    tableName: 'properties',
    underscored: true,
    tableName: 'properties',
    timestamps: true,
    underscored: true
  });

  return Property;
};

export default initPropertyModel;
