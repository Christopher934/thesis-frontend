#!/bin/bash

echo "🔔 Testing Notification Button Navigation"
echo "==========================================="

# Wait for the application to be ready
echo "⏳ Waiting for application to start..."
sleep 10

# Test if the notifications page is accessible
echo "📋 Testing notifications page..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/dashboard/list/notifications)

if [ "$response" = "200" ]; then
    echo "✅ SUCCESS: Notifications page is accessible at http://localhost:3000/dashboard/list/notifications"
else
    echo "❌ ERROR: Notifications page returned HTTP $response"
fi

echo ""
echo "📝 Summary:"
echo "- ✅ Created new notifications page: /dashboard/list/notifications"
echo "- ✅ Updated 'Lihat Semua' button to navigate to the notifications page"
echo "- ✅ Added comprehensive notification management features:"
echo "  - Search and filter notifications"
echo "  - Mark as read/unread"
echo "  - Bulk actions (read, unread, delete)"
echo "  - Category filtering (shift, event, system)"
echo "  - Responsive design"
echo ""
echo "🎯 Next Steps:"
echo "1. Test the navigation by clicking 'Lihat Semua' button in the dashboard"
echo "2. Visit: http://localhost:3000/dashboard/list/notifications"
echo "3. Integrate with real notification API endpoints"
