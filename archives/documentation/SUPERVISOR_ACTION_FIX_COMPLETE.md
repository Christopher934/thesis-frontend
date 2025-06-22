# Supervisor Action Fix Documentation

## Problem

Supervisors were getting "Bad Request" error with message "Invalid action for supervisor" when trying to accept or reject shift swap requests.

## Root Cause

The backend API expects different action values based on the user's role:

- **Regular users** (receiving requests): use `accept`/`reject` actions
- **Supervisors** (approving requests): use `approve`/`reject` actions
- **Unit heads** (if required): use `approve`/`reject` actions

However, the frontend was sending `accept`/`reject` for all users, including supervisors.

## Solution

Modified the frontend code in `/frontend/src/app/(dashboard)/list/ajukantukarshift/page.tsx` to:

1. **Dynamic Action Selection**: Check the current tab to determine the correct action

   ```tsx
   const action = activeTab === "supervisor-approvals" ? "approve" : "accept";
   ```

2. **Updated Accept Handler**: Modified `handleAcceptRequest` to use `approve` for supervisors
3. **Reject Handler**: Kept `reject` for all users (both regular users and supervisors use `reject`)

## Code Changes

### Before (causing error):

```tsx
body: JSON.stringify({
  action: "accept", // Always 'accept', even for supervisors
});
```

### After (fixed):

```tsx
// Determine the correct action based on the current tab
const action = activeTab === "supervisor-approvals" ? "approve" : "accept";

body: JSON.stringify({
  action: action, // Dynamic: 'approve' for supervisors, 'accept' for regular users
});
```

## Backend Action Flow

1. **Regular User Receives Request** → `accept`/`reject` → Status: `APPROVED_BY_TARGET` or `REJECTED_BY_TARGET`
2. **Unit Head Approval** (if required) → `approve`/`reject` → Status: `WAITING_SUPERVISOR` or `REJECTED_BY_UNIT_HEAD`
3. **Supervisor Final Approval** → `approve`/`reject` → Status: `APPROVED` or `REJECTED_BY_SUPERVISOR`

## Testing

- Test with supervisor account in the "Persetujuan" tab
- Verify that "Setujui" button now sends `approve` action
- Verify that "Tolak" button still sends `reject` action
- Confirm no more "Invalid action for supervisor" errors

## Files Modified

- `/frontend/src/app/(dashboard)/list/ajukantukarshift/page.tsx`

## Impact

- ✅ Supervisors can now successfully approve/reject shift swap requests
- ✅ Regular users continue to work as before
- ✅ No breaking changes to existing functionality
- ✅ Maintains the three-tab structure (My Requests, Requests to Me, Supervisor Approvals)
