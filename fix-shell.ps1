# Fix PowerShell configuration for npm
$powershellPath = "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"

# Set npm configuration
Write-Host "Setting npm configuration..."
npm config set script-shell $powershellPath

# Create .npmrc if it doesn't exist
$npmrcPath = Join-Path -Path $PSScriptRoot -ChildPath ".npmrc"
if (-not (Test-Path $npmrcPath)) {
    Write-Host "Creating .npmrc file..."
    "script-shell=$powershellPath" | Out-File -FilePath $npmrcPath -Encoding utf8
    Write-Host ".npmrc file created successfully!"
} else {
    Write-Host ".npmrc file already exists"
}

Write-Host "`nPlease restart your terminal and try running the application again."
Write-Host "If the issue persists, you may need to run this script as an administrator."
