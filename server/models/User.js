import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

class User extends Model {
  // Instance methods
  async comparePassword(candidatePassword) {
    if (!candidatePassword) {
      console.log('No password provided for comparison');
      return false;
    }
    if (!this.password_hash) {
      console.log('No password hash stored for user');
      return false;
    }
    console.log('Comparing password with stored hash');
    return await bcrypt.compare(candidatePassword, this.password_hash);
  }

  generateRememberToken() {
    const token = crypto.randomBytes(32).toString('hex');
    this.rememberToken = token;
    return token;
  }

  generateResetToken() {
    const token = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = token;
    this.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    return token;
  }

  generateEmailVerificationToken() {
    const token = crypto.randomBytes(32).toString('hex');
    this.emailVerificationToken = token;
    return token;
  }

  // Remove sensitive data from JSON output
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    delete values.password_hash;
    delete values.rememberToken;
    delete values.resetPasswordToken;
    delete values.emailVerificationToken;
    return values;
  }

  static associate(models) {
    // Define associations here if needed
    // User.hasMany(models.Property, { foreignKey: 'userId', as: 'savedProperties' });
  }
}

const initUserModel = (sequelize) => {
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'first_name',
      validate: {
        notEmpty: { msg: 'First name is required' },
        len: { args: [2, 50], msg: 'First name must be between 2 and 50 characters' }
      }
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'last_name',
      validate: {
        notEmpty: { msg: 'Last name is required' },
        len: { args: [2, 50], msg: 'Last name must be between 2 and 50 characters' }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: 'Please enter a valid email address' },
        notEmpty: { msg: 'Email is required' }
      },
      set(value) {
        this.setDataValue('email', value.toLowerCase().trim());
      }
    },
    password: {
      type: DataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password is required' },
        len: { args: [8, 255], msg: 'Password must be at least 8 characters long' }
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'password_hash',
      validate: {
        notEmpty: { msg: 'Password hash is required' }
      }
    },
    rememberToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      field: 'is_email_verified',
      allowNull: false,
      defaultValue: false
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user'
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    preferences: {
      type: DataTypes.JSON,
      defaultValue: {
        notifications: true,
        newsletter: false
      }
    },
    savedProperties: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    searchHistory: {
      type: DataTypes.JSON,
      defaultValue: []
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
  });

  // Hash password before creating or updating
  User.beforeSave(async (user) => {
    // Only hash if password is being set and password_hash isn't already set
    if (user.changed('password') && user.password && !user.password_hash) {
      console.log('Hashing new password in beforeSave hook');
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(user.password, salt);
    }
  });

  return User;
};

export default initUserModel;
