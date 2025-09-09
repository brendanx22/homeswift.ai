# Database setup script for HomeSwift
# This script will help you set up the database and grant necessary permissions

# Database configuration
$dbName = "homeswift"
$dbUser = "homeswift_user"
$dbPassword = "homeswift123"

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "PostgreSQL command line tools (psql) not found. Please ensure PostgreSQL is installed and added to your PATH."
    exit 1
}

# Function to execute SQL commands
function Invoke-PostgresSQL {
    param (
        [string]$sqlCommand,
        [string]$database = "postgres"
    )
    
    $env:PGPASSWORD = $dbPassword
    & psql -U $dbUser -d $database -c $sqlCommand
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error executing SQL command. Please check your PostgreSQL credentials and permissions." -ForegroundColor Red
        exit 1
    }
}

# Try to connect to the database
try {
    Write-Host "Attempting to connect to PostgreSQL..."
    $testConnection = & psql -U $dbUser -d $dbName -c "SELECT 1" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully connected to the database!" -ForegroundColor Green
        
        # Grant permissions
        Write-Host "Granting permissions to $dbUser..."
        
        # Grant permissions for properties table
        Invoke-PostgresSQL -sqlCommand "GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO $dbUser;" -database $dbName
        Invoke-PostgresSQL -sqlCommand "GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO $dbUser;" -database $dbName
        
        Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to connect to the database. Please check your credentials and ensure the database exists." -ForegroundColor Red
        Write-Host "Error details: $testConnection" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ An error occurred: $_" -ForegroundColor Red
}
