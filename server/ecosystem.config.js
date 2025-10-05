module.exports = {
  apps: [
    {
      name: 'homeswift-backend',
      script: './server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 10000,
      },
    },
  ],

  deploy: {
    production: {
      user: 'node',
      host: 'your-production-host',
      ref: 'origin/main',
      repo: 'https://github.com/your-username/homeswift-backend.git',
      path: '/var/www/homeswift-backend',
      'post-deploy':
        'npm install && npm run migrate && pm2 reload ecosystem.config.js --env production',
    },
  },
};
