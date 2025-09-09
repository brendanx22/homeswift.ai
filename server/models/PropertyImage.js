import { DataTypes } from 'sequelize';

const initPropertyImageModel = (sequelize) => {
  const PropertyImage = sequelize.define('PropertyImage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Properties', // This references the table name
        key: 'id'
      }
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    caption: {
      type: DataTypes.STRING,
      allowNull: true
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'property_images',
    timestamps: true,
    underscored: true
  });

  return PropertyImage;
};

export default initPropertyImageModel;
