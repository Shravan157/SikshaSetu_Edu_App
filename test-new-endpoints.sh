#!/bin/bash

# Test script for new endpoints
# Make sure to replace <TOKEN> with actual JWT token

BASE_URL="http://localhost:8080/api"
ADMIN_TOKEN="<REPLACE_WITH_ADMIN_TOKEN>"
USER_TOKEN="<REPLACE_WITH_USER_TOKEN>"

echo "🧪 Testing New Endpoints Implementation"
echo "======================================="

echo ""
echo "1. Testing User Management Endpoints (Admin Only)"
echo "--------------------------------------------------"

echo "📋 GET /api/users - Get all users"
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     "$BASE_URL/users" | jq '.' || echo "❌ Failed"

echo ""
echo "👤 GET /api/users/1 - Get user by ID"
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     "$BASE_URL/users/1" | jq '.' || echo "❌ Failed"

echo ""
echo "✏️ PUT /api/users/1 - Update user"
curl -s -X PUT -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"Updated Test User"}' \
     "$BASE_URL/users/1" | jq '.' || echo "❌ Failed"

echo ""
echo "2. Testing Notification Mark All Read (All Users)"
echo "------------------------------------------------"

echo "📬 PUT /api/notifications/mark-all-read"
curl -s -X PUT -H "Authorization: Bearer $USER_TOKEN" \
     -H "Content-Type: application/json" \
     "$BASE_URL/notifications/mark-all-read" || echo "❌ Failed"

echo ""
echo "3. Testing Bulk Attendance Marking (Admin/Faculty)"
echo "-------------------------------------------------"

echo "📊 POST /api/attendance/mark - Bulk attendance"
curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '[{"studentId":1,"facultyId":1,"date":"2024-01-15","present":true}]' \
     "$BASE_URL/attendance/mark" | jq '.' || echo "❌ Failed"

echo ""
echo "4. Testing Access Control"
echo "------------------------"

echo "🚫 Testing non-admin access to user management (should fail)"
curl -s -H "Authorization: Bearer $USER_TOKEN" \
     -H "Content-Type: application/json" \
     "$BASE_URL/users" && echo "❌ Security breach - non-admin accessed users!" || echo "✅ Access properly denied"

echo ""
echo "✅ Endpoint testing complete!"
echo ""
echo "📝 Instructions:"
echo "1. Replace <REPLACE_WITH_ADMIN_TOKEN> with actual admin JWT token"
echo "2. Replace <REPLACE_WITH_USER_TOKEN> with actual user JWT token"
echo "3. Make sure the backend server is running on localhost:8080"
echo "4. Install jq for JSON formatting: sudo apt-get install jq"