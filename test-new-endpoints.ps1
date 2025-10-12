# PowerShell Test script for new endpoints
# Make sure to replace tokens with actual JWT tokens

$BaseUrl = "http://localhost:8080/api"
$AdminToken = "<REPLACE_WITH_ADMIN_TOKEN>"
$UserToken = "<REPLACE_WITH_USER_TOKEN>"

Write-Host "🧪 Testing New Endpoints Implementation" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "1. Testing User Management Endpoints (Admin Only)" -ForegroundColor Yellow
Write-Host "--------------------------------------------------" -ForegroundColor Yellow

Write-Host "📋 GET /api/users - Get all users" -ForegroundColor Green
try {
    $headers = @{ "Authorization" = "Bearer $AdminToken"; "Content-Type" = "application/json" }
    $response = Invoke-RestMethod -Uri "$BaseUrl/users" -Method Get -Headers $headers
    Write-Host "✅ Success: Found $($response.Count) users" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "👤 GET /api/users/1 - Get user by ID" -ForegroundColor Green
try {
    $headers = @{ "Authorization" = "Bearer $AdminToken"; "Content-Type" = "application/json" }
    $response = Invoke-RestMethod -Uri "$BaseUrl/users/1" -Method Get -Headers $headers
    Write-Host "✅ Success: Retrieved user $($response.name)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✏️ PUT /api/users/1 - Update user" -ForegroundColor Green
try {
    $headers = @{ "Authorization" = "Bearer $AdminToken"; "Content-Type" = "application/json" }
    $body = @{ name = "Updated Test User" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BaseUrl/users/1" -Method Put -Headers $headers -Body $body
    Write-Host "✅ Success: Updated user" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Testing Notification Mark All Read (All Users)" -ForegroundColor Yellow
Write-Host "------------------------------------------------" -ForegroundColor Yellow

Write-Host "📬 PUT /api/notifications/mark-all-read" -ForegroundColor Green
try {
    $headers = @{ "Authorization" = "Bearer $UserToken"; "Content-Type" = "application/json" }
    Invoke-RestMethod -Uri "$BaseUrl/notifications/mark-all-read" -Method Put -Headers $headers
    Write-Host "✅ Success: Marked all notifications as read" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Testing Bulk Attendance Marking (Admin/Faculty)" -ForegroundColor Yellow
Write-Host "-------------------------------------------------" -ForegroundColor Yellow

Write-Host "📊 POST /api/attendance/mark - Bulk attendance" -ForegroundColor Green
try {
    $headers = @{ "Authorization" = "Bearer $AdminToken"; "Content-Type" = "application/json" }
    $body = @(
        @{
            studentId = 1
            facultyId = 1
            date = "2024-01-15"
            present = $true
        }
    ) | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BaseUrl/attendance/mark" -Method Post -Headers $headers -Body $body
    Write-Host "✅ Success: Created $($response.Count) attendance records" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. Testing Access Control" -ForegroundColor Yellow
Write-Host "------------------------" -ForegroundColor Yellow

Write-Host "🚫 Testing non-admin access to user management (should fail)" -ForegroundColor Green
try {
    $headers = @{ "Authorization" = "Bearer $UserToken"; "Content-Type" = "application/json" }
    $response = Invoke-RestMethod -Uri "$BaseUrl/users" -Method Get -Headers $headers
    Write-Host "❌ Security breach - non-admin accessed users!" -ForegroundColor Red
} catch {
    Write-Host "✅ Access properly denied" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Endpoint testing complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Instructions:" -ForegroundColor Yellow
Write-Host "1. Replace <REPLACE_WITH_ADMIN_TOKEN> with actual admin JWT token"
Write-Host "2. Replace <REPLACE_WITH_USER_TOKEN> with actual user JWT token"
Write-Host "3. Make sure the backend server is running on localhost:8080"