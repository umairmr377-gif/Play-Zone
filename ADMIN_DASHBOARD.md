# Admin Dashboard Documentation

## Overview

The Admin Dashboard provides a complete management interface for Play Zone. It allows administrators to manage sports, courts, bookings, and view statistics.

## Features

### 1. Authentication
- **Basic Client-Side Gate**: Password-protected access
- **Password**: Set via `NEXT_PUBLIC_ADMIN_PASSWORD` environment variable (default: "admin123")
- **Note**: This is NOT production-ready authentication. For production, implement proper auth (NextAuth, Firebase, etc.)

### 2. Admin Overview (`/admin`)
- Total Sports count
- Total Courts count
- Total Bookings count
- Bookings Today count
- Quick actions to create sports or view bookings
- Recent sports list

### 3. Sports Management (`/admin/sports`)
- **List Sports**: View all sports with court counts
- **Create Sport**: Modal form to add new sports
- **Edit Sport**: Update sport name, description, image
- **Delete Sport**: Remove sport (deletes all associated courts)

### 4. Court Management (`/admin/sports/[sportId]/courts`)
- **List Courts**: View all courts for a specific sport
- **Create Court**: Add new courts with:
  - Name
  - Price per hour
  - Location
  - Image path (optional)
  - Available time slots (comma-separated, HH:00 format)
- **Edit Court**: Update court details
- **Delete Court**: Remove court from sport

### 5. Bookings Management (`/admin/bookings`)
- **List Bookings**: View all bookings with filters:
  - Filter by Sport
  - Filter by Date
  - Filter by Status (pending, confirmed, cancelled, completed)
  - Search by Booking ID or customer name/email
- **Booking Details**: View full booking information
- **Update Status**: Cancel or mark bookings as complete

## Data Storage

### Sports Data
- **Primary Source**: `data/sports.json` (created automatically from `data/sports.ts` on first admin access)
- **Backup**: `data/sports.ts` (original TypeScript file)
- **Format**: JSON array of Sport objects

### Bookings Data
- **Storage**: `data/bookings.json`
- **Format**: JSON array of Booking objects
- **Status Field**: Added dynamically (pending, confirmed, cancelled, completed)

## API Routes

### Admin API Endpoints

- `GET /api/admin/sports` - Get all sports
- `POST /api/admin/sports` - Create new sport
- `PUT /api/admin/sports` - Update sport
- `DELETE /api/admin/sports?id={id}` - Delete sport

- `POST /api/admin/courts` - Create new court
- `PUT /api/admin/courts` - Update court
- `DELETE /api/admin/courts?sportId={id}&courtId={id}` - Delete court

- `GET /api/admin/bookings` - Get all bookings (with filters)
- `PUT /api/admin/bookings` - Update booking status

- `GET /api/admin/stats` - Get admin statistics

## Usage

### Setting Admin Password

Create a `.env.local` file:

```env
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password_here
```

### Accessing Admin Dashboard

1. Navigate to `/admin`
2. Enter the admin password
3. Access granted (stored in localStorage)

### Creating a Sport

1. Go to `/admin/sports`
2. Click "Create Sport"
3. Fill in:
   - Sport Name
   - Description
   - Image Path (e.g., `/images/football.jpg`)
4. Click "Create Sport"

### Creating a Court

1. Go to `/admin/sports/[sportId]/courts`
2. Click "Create Court"
3. Fill in:
   - Court Name
   - Price per Hour
   - Location
   - Image Path (optional)
   - Available Time Slots (comma-separated: `06:00,07:00,08:00...`)
4. Click "Create Court"

### Managing Bookings

1. Go to `/admin/bookings`
2. Use filters to find specific bookings
3. Click "View" to see booking details
4. Update status: Cancel or Mark Complete

## Data Migration

When the admin dashboard is first accessed, it automatically:
1. Reads from `data/sports.ts`
2. Creates `data/sports.json` if it doesn't exist
3. All future CRUD operations use the JSON file

## Security Notes

⚠️ **IMPORTANT**: The current authentication is client-side only and is NOT secure for production use.

**For Production:**
- Implement server-side authentication (NextAuth.js, Firebase Auth, etc.)
- Add role-based access control (RBAC)
- Use secure session management
- Implement CSRF protection
- Add rate limiting for API routes
- Use environment variables for sensitive data (never commit passwords)

## File Structure

```
app/admin/
├── layout.tsx                    # Admin layout with sidebar
├── page.tsx                      # Overview dashboard
├── sports/
│   ├── page.tsx                  # List sports
│   └── [sportId]/
│       ├── page.tsx              # Edit sport
│       └── courts/
│           ├── page.tsx          # List courts
│           └── [courtId]/
│               └── page.tsx      # Edit court
└── bookings/
    ├── page.tsx                  # List bookings
    └── [bookingId]/
        └── page.tsx              # Booking details

components/admin/
├── AdminSidebar.tsx              # Navigation sidebar
├── AdminTopbar.tsx               # Top navigation bar
└── AdminGate.tsx                 # Authentication gate

lib/
└── admin.ts                      # Admin utility functions

app/api/admin/
├── sports/route.ts               # Sports CRUD API
├── courts/route.ts               # Courts CRUD API
├── bookings/route.ts             # Bookings API
└── stats/route.ts                # Statistics API
```

## Testing Checklist

- [x] Create sport increments total sports
- [x] Delete sport removes all associated courts
- [x] Create booking in main app shows in admin bookings
- [x] Cancel booking updates status
- [x] Mark booking complete updates status
- [x] Filters work correctly on bookings page
- [x] Search functionality works
- [x] Time slot validation works
- [x] Price validation works

## Future Enhancements

- [ ] Real database integration (PostgreSQL/Prisma)
- [ ] User authentication (NextAuth.js)
- [ ] Role-based access control
- [ ] Email notifications
- [ ] Booking analytics and reports
- [ ] Bulk operations
- [ ] Export bookings to CSV
- [ ] Calendar view for bookings
- [ ] Revenue reports
- [ ] Customer management

