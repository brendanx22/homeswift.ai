@echo off
echo Granting database permissions...

echo Please enter the PostgreSQL superuser (postgres) password when prompted
psql -U postgres -d homeswift -c "
  -- Grant permissions on all tables
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO homeswift_user;
  
  -- Grant permissions on all sequences
  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO homeswift_user;
  
  -- Grant permissions on all functions
  GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO homeswift_user;
  
  -- Grant usage on schema
  GRANT USAGE ON SCHEMA public TO homeswift_user;
  
  -- Set default privileges for future objects
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO homeswift_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO homeswift_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO homeswift_user;
"

echo.
echo If you see no errors, permissions have been granted successfully.
echo Press any key to exit...
pause > nul
