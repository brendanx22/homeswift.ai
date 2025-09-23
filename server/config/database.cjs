require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
      statement_timeout: 10000,
      idle_in_transaction_session_timeout: 10000,
      application_name: 'homeswift-backend',
      options: '-c search_path=public'
    },
    logging: process.env.NODE_ENV === 'development' 
      ? (msg) => console.log(`[Sequelize] ${msg}`) 
      : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  },
  test: {
    url: process.env.TEST_DATABASE_URL || 'sqlite::memory:',
    dialect: 'sqlite',
    logging: false
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: false
  }
};
