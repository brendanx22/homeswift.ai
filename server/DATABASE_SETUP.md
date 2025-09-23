# Database Setup Guide for HomeSwift

## Prerequisites
- PostgreSQL installed and running
- psql command line tool available in your PATH
- Superuser access to PostgreSQL

## 1. Create Database and User

### Option A: Using psql

1. Connect to PostgreSQL as a superuser (usually 'postgres'):
   ```bash
   psql -U postgres
   ```

2. Run the following SQL commands:
   ```sql
   -- Create database
   CREATE DATABASE homeswift;
   
   -- Create user if it doesn't exist
   CREATE USER homeswift_user WITH PASSWORD 'homeswift123';
   
   -- Grant necessary privileges
   GRANT ALL PRIVILEGES ON DATABASE homeswift TO homeswift_user;
   
   -- Connect to the database
   \c homeswift
   
   -- Grant permissions on all tables (run after migrations)
   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO homeswift_user;
   GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO homeswift_user;
   ```

### Option B: Using the provided PowerShell script

1. Open PowerShell as Administrator
2. Navigate to the server directory
3. Run the setup script:
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope Process -Force
   .\scripts\setup-database.ps1
   ```

## 2. Run Migrations

After setting up the database, run the migrations:

```bash
# Navigate to the server directory
cd server

# Install dependencies if not already installed
npm install

# Run migrations
npx sequelize-cli db:migrate
```

## 3. Verify Database Connection

You can test the database connection using the test script:

```bash
node test-db.js
```

## Troubleshooting

### Permission Denied Errors
If you see "permission denied" errors, ensure:
1. The database user has the correct permissions (see Step 1)
2. The database name, username, and password in `config/config.json` match your setup
3. The database is running and accessible

### Connection Issues
If you can't connect to PostgreSQL:
1. Ensure PostgreSQL service is running
2. Check if PostgreSQL is configured to accept connections in `pg_hba.conf`
3. Verify the port (default is 5432) and host (usually localhost)

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```
DB_NAME=homeswift
DB_USER=homeswift_user
DB_PASSWORD=homeswift123
DB_HOST=localhost
DB_PORT=5432
```
