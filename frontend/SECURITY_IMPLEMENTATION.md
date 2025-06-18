# Route Security Implementation

## Problem

Users could bypass menu visibility restrictions by directly typing URLs in the browser address bar. The frontend menu only hid navigation links based on user roles, but didn't enforce actual route protection.

## Solution Implemented

### 1. Comprehensive Middleware Protection (`src/middleware.ts`)

- **Server-side route protection** at the Next.js middleware level
- **Role-based access control** checks for all protected routes
- **Automatic redirects** to appropriate dashboards when access is denied
- **Token validation** to ensure authenticated access

### 2. Permission System (`src/lib/permissions.ts`)

- **Centralized route permissions** configuration
- **Role hierarchy** with specific access rights:
  - `admin`: Full access to all routes including user management and reports
  - `supervisor`: Admin-level access (same as admin)
  - `perawat`, `staf`, `dokter`: Limited access to personal schedules and shift requests
- **Dynamic route matching** for nested paths

### 3. Client-side Route Guards (`src/component/RouteGuard.tsx`)

- **Additional security layer** for client-side protection
- **User-friendly error messages** when access is denied
- **Loading states** during authorization checks
- **Graceful fallbacks** and redirect handling

### 4. Higher-Order Component (`src/component/withRouteGuard.tsx`)

- **Easy integration** for wrapping page components
- **Reusable protection** across multiple components
- **Customizable fallback** UI components

## Route Permissions Matrix

| Route                    | Admin | Supervisor | Perawat | Staf | Dokter |
| ------------------------ | ----- | ---------- | ------- | ---- | ------ |
| `/`                      | ✅    | ✅         | ✅      | ✅   | ✅     |
| `/admin`                 | ✅    | ✅         | ❌      | ❌   | ❌     |
| `/pegawai`               | ❌    | ❌         | ✅      | ✅   | ✅     |
| `/list/pegawai`          | ✅    | ❌         | ❌      | ❌   | ❌     |
| `/list/managemenjadwal`  | ✅    | ❌         | ❌      | ❌   | ❌     |
| `/list/jadwalsaya`       | ❌    | ❌         | ✅      | ✅   | ✅     |
| `/list/ajukantukarshift` | ✅    | ✅         | ✅      | ✅   | ✅     |
| `/list/absensi`          | ✅    | ❌         | ✅      | ✅   | ✅     |
| `/list/events`           | ✅    | ❌         | ✅      | ✅   | ✅     |
| `/list/messages`         | ✅    | ❌         | ✅      | ✅   | ✅     |
| `/list/laporan`          | ✅    | ❌         | ❌      | ❌   | ❌     |
| `/profile`               | ✅    | ✅         | ✅      | ✅   | ✅     |

## Implementation Examples

### Protecting a Page Component

```tsx
import RouteGuard from "@/component/RouteGuard";

function ProtectedPage() {
  return (
    <RouteGuard>
      <div>{/* Your protected content */}</div>
    </RouteGuard>
  );
}
```

### Using HOC Protection

```tsx
import { withRouteGuard } from "@/component/withRouteGuard";

function MyPage() {
  return <div>Protected Content</div>;
}

export default withRouteGuard(MyPage);
```

## Security Features

### 1. Multi-layer Protection

- **Middleware**: Server-side route blocking
- **Client Guards**: User experience and additional validation
- **Token Validation**: Authentication checks

### 2. Automatic Redirects

- **Unauthorized users** → `/sign-in`
- **Wrong role access** → Appropriate dashboard based on user role
- **Admin/Supervisor** → `/admin`
- **Staff/Doctors/Nurses** → `/pegawai`

### 3. Error Handling

- **Graceful fallbacks** when permissions are denied
- **User-friendly messages** explaining access restrictions
- **Loading states** during authorization checks

### 4. Development Features

- **Console logging** for debugging permission checks
- **Clear error messages** for troubleshooting
- **TypeScript support** for compile-time safety

## Testing the Security

### Valid Access Scenarios

1. Admin accessing `/list/pegawai` ✅
2. Perawat accessing `/list/jadwalsaya` ✅
3. All roles accessing `/list/ajukantukarshift` ✅

### Blocked Access Scenarios

1. Perawat trying to access `/list/pegawai` → Redirect to `/pegawai`
2. Staf trying to access `/admin` → Redirect to `/pegawai`
3. Unauthenticated user accessing any protected route → Redirect to `/sign-in`

## Files Modified

1. **`src/middleware.ts`** - Server-side route protection
2. **`src/lib/permissions.ts`** - Permission configuration
3. **`src/component/RouteGuard.tsx`** - Client-side protection component
4. **`src/component/withRouteGuard.tsx`** - HOC for easy integration
5. **`src/app/(dashboard)/list/pegawai/page.tsx`** - Example implementation

## Security Benefits

1. **🔒 Unauthorized Access Prevention**: Users can't bypass restrictions by typing URLs
2. **⚡ Fast Response**: Middleware-level blocking prevents unnecessary page loads
3. **👥 Role-based Access**: Proper separation of admin and user functionalities
4. **🔄 Automatic Redirects**: Users are automatically directed to appropriate areas
5. **🎯 User Experience**: Clear feedback when access is denied
6. **🛡️ Defense in Depth**: Multiple layers of protection (server + client)

The implementation now provides robust security that prevents unauthorized access through direct URL manipulation while maintaining a smooth user experience.
