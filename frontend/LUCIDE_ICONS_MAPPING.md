# Lucide Icons Mapping - RSUD Anugerah Menu System

## Overview

All menu icons have been updated to use Lucide React icons for consistency, scalability, and better performance.

## Main Menu Icons

### MENU Section

| Label              | Old Icon            | New Lucide Icon | Component           | Description              |
| ------------------ | ------------------- | --------------- | ------------------- | ------------------------ |
| Dashboard          | `/home.png`         | `Home`          | `<Home />`          | Home/Dashboard main page |
| Pegawai            | `/tenagakerja.png`  | `UserPlus`      | `<UserPlus />`      | Employee management      |
| Managemen Jadwal   | `/subject.png`      | `Calendar`      | `<Calendar />`      | Schedule management      |
| Jadwal Saya        | `/class.png`        | `ClipboardList` | `<ClipboardList />` | My schedule/tasks        |
| Ajukan Tukar Shift | `/assignment.png`   | `RefreshCw`     | `<RefreshCw />`     | Shift swap requests      |
| Absensi            | `/attendance.png`   | `CalendarDays`  | `<CalendarDays />`  | Attendance system        |
| Events             | `/calendar.png`     | `CalendarDays`  | `<CalendarDays />`  | Events calendar          |
| Pesan              | `/message.png`      | `MessageSquare` | `<MessageSquare />` | Messages/communication   |
| Laporan            | `/announcement.png` | `FileBarChart`  | `<FileBarChart />`  | Reports/announcements    |

### OTHER Section

| Label   | Old Icon       | New Lucide Icon | Component    | Description  |
| ------- | -------------- | --------------- | ------------ | ------------ |
| Profile | `/profile.png` | `User`          | `<User />`   | User profile |
| Logout  | `/logout.png`  | `LogOut`        | `<LogOut />` | Sign out     |

## Absensi Dropdown Icons

| Label             | Lucide Icon | Component       | Description                     |
| ----------------- | ----------- | --------------- | ------------------------------- |
| Dashboard Absensi | `BarChart3` | `<BarChart3 />` | Attendance dashboard with stats |
| Riwayat Absensi   | `History`   | `<History />`   | Attendance history              |
| Manajemen Absensi | `Users`     | `<Users />`     | Attendance management           |
| Laporan Absensi   | `FileText`  | `<FileText />`  | Attendance reports              |

## Icon Sizes

### Desktop

- **Main Menu Icons**: `w-5 h-5` (20px)
- **Dropdown Icons**: `w-6 h-6` (24px)

### Mobile

- **Main Menu Icons**: `w-5 h-5` (20px)
- **Dropdown Icons**: `w-6 h-6` (24px)

## Benefits of Lucide Icons

✅ **Consistency**: All icons follow the same design language
✅ **Scalability**: Vector-based icons scale perfectly at any size
✅ **Performance**: No image downloads, faster loading
✅ **Customization**: Easy to change colors, sizes via CSS
✅ **Accessibility**: Better screen reader support
✅ **Bundle Size**: Smaller than image files
✅ **Tree Shaking**: Only imported icons are included in bundle

## Implementation Details

### Import Statement

```tsx
import {
  BarChart3,
  History,
  Users,
  FileText,
  Home,
  UserPlus,
  Calendar,
  ClipboardList,
  RefreshCw,
  CalendarDays,
  MessageSquare,
  FileBarChart,
  User,
  LogOut,
} from "lucide-react";
```

### Interface Update

```tsx
interface MenuItem {
  icon: React.ComponentType<{ className?: string }>; // Changed from string
  label: string;
  href?: string;
  visible: string[];
  dropdown?: DropdownItem[];
}
```

### Usage Example

```tsx
// Before (Image)
<Image src={item.icon} alt={item.label} width={20} height={20} />

// After (Lucide Icon)
<item.icon className="w-5 h-5" />
```

## Mobile Responsive Behavior

### Desktop View

- Shows icons + text labels in sidebar
- Traditional dropdown behavior

### Mobile View

- Shows only icons in bottom navigation
- Vertical dropdown with icon-only items
- Touch-friendly 48px height targets

## File Changes Made

1. **`/src/component/Menu.tsx`**:

   - Added Lucide React imports
   - Updated MenuItem interface
   - Replaced all Image components with Lucide icons
   - Removed Image import

2. **`/public/test-mobile-dropdown.html`**:

   - Updated test page to use Lucide icons
   - Added calendar-days icon for main trigger

3. **Icon Mapping Documentation**:
   - Created this comprehensive mapping guide

## Future Icon Additions

When adding new menu items, follow this pattern:

1. Import the appropriate Lucide icon
2. Add to menuItems array with icon component
3. Ensure icon semantically matches the function
4. Test on both mobile and desktop views

## Icon Selection Guidelines

- **Home/Dashboard**: `Home`
- **User Management**: `Users`, `UserPlus`, `User`
- **Calendar/Time**: `Calendar`, `CalendarDays`, `History`
- **Documents/Reports**: `FileText`, `FileBarChart`, `ClipboardList`
- **Communication**: `MessageSquare`
- **Actions**: `RefreshCw`, `LogOut`
- **Analytics**: `BarChart3`

This ensures consistent iconography throughout the application while maintaining semantic meaning for each function.
