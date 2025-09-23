# Grant Permissions Script
# This script should be run as a PostgreSQL superuser (usually 'postgres')

# Configuration
$dbName = "homeswift"
$dbUser = "homeswift_user"

# Prompt for PostgreSQL superuser password
$postgresPassword = Read-Host -Prompt "Enter PostgreSQL superuser (postgres) password" -AsSecureString
$postgresPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($postgresPassword)
)

# Set environment variable for psql
$env:PGPASSWORD = $postgresPassword

# SQL commands to grant permissions
$sqlCommands = @"
-- Grant permissions on all tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "$dbUser";

-- Grant permissions on all sequences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "$dbUser";

-- Grant permissions on all functions
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO "$dbUser";

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO "$dbUser";

-- Make sure the user has access to future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO "$dbUser";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO "$dbUser";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO "$dbUser";
"@

try {
    # Execute the SQL commands
    Write-Host "Granting permissions to $dbUser on database $dbName..." -ForegroundColor Cyan
    $sqlCommands | & psql -U postgres -d $dbName -v ON_ERROR_STOP=1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully granted permissions to $dbUser" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to grant permissions. Please check the error above." -ForegroundColor Red
    }
} catch {
    Write-Host "❌ An error occurred: $_" -ForegroundColor Red
} finally {
    # Clear the password from memory
    Remove-Variable postgresPassword -ErrorAction SilentlyContinue
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "`nNote: If you encounter any permission issues, you may need to run this script as an administrator." -ForegroundColor Yellow
