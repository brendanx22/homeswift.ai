# Test DNS resolution
$hostname = "db.tproaiqvkohrlxjmkgxt.supabase.co"
$port = 5432

Write-Host "🔍 Testing DNS resolution for $hostname..."
try {
    $ipAddresses = [System.Net.Dns]::GetHostAddresses($hostname)
    Write-Host "✅ DNS resolved to: $($ipAddresses.IPAddressToString -join ', ')"
    
    # Test TCP connection
    Write-Host "\n🔌 Testing TCP connection to $hostname`:$port..."
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $connection = $tcpClient.BeginConnect($hostname, $port, $null, $null)
    $connection.AsyncWaitHandle.WaitOne(5000, $false)
    
    if ($tcpClient.Connected) {
        Write-Host "✅ Successfully connected to $hostname`:$port"
        $tcpClient.EndConnect($connection)
    } else {
        Write-Host "❌ Failed to connect to $hostname`:$port"
    }
    $tcpClient.Close()
} catch {
    Write-Host "❌ Error: $_"
}
