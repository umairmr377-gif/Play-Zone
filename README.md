# Play Zone

A complete, dynamic sports court booking system built with Next.js 14, TypeScript, and Tailwind CSS. Book courts for Football, Paddle Tennis, Cricket, Tennis, and Badminton with an intuitive time-slot scheduling system on Play Zone.

## 🚀 Features

- **Dynamic Sports System**: Easily add new sports and courts through a centralized data file
- **Full Booking Workflow**: Select sport → Choose court → Pick date → Select time slots → Confirm booking
- **Time Slot Scheduler**: Visual grid of available time slots (6 AM - 11 PM) with real-time availability
- **Double-Booking Prevention**: Automatic conflict detection to prevent overlapping bookings
- **Admin Dashboard**: View all bookings, filter by sport, and see revenue statistics
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **Mock Database**: File-based JSON storage for bookings (easily replaceable with a real database)

## 📁 Project Structure

```
play-zone/
├── app/
│   ├── api/
│   │   └── bookings/
│   │       ├── route.ts          # GET/POST bookings
│   │       └── [id]/
│   │           └── route.ts      # GET single booking
│   ├── admin/
│   │   └── bookings/
│   │       └── page.tsx          # Admin dashboard
│   ├── book/
│   │   └── [sport]/
│   │       └── [courtId]/
│   │           └── page.tsx       # Booking page
│   ├── confirmation/
│   │   └── page.tsx               # Booking confirmation
│   ├── sports/
│   │   ├── page.tsx               # All sports list
│   │   └── [id]/
│   │       └── page.tsx           # Sport details
│   ├── layout.tsx                 # Root layout with navigation
│   ├── page.tsx                   # Home page
│   └── globals.css                # Global styles
├── components/
│   ├── Badge.tsx                  # Badge component
│   ├── Button.tsx                 # Button component
│   ├── Card.tsx                   # Card component
│   ├── TimeSlot.tsx               # Individual time slot
│   └── TimeSlotGrid.tsx           # Time slot grid
├── data/
│   ├── sports.ts                  # Sports and courts data
│   └── bookings.json              # Mock database (auto-generated)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Step 3: Build for Production

```bash
npm run build
npm start
```

## 📖 Usage Guide

### For Users

1. **Browse Sports**: Visit the home page or `/sports` to see all available sports
2. **View Details**: Click on any sport to see available courts and pricing
3. **Book a Court**: 
   - Select a court
   - Choose a date
   - Pick available time slots
   - Enter your name and email
   - Confirm booking
4. **View Confirmation**: After booking, you'll see a confirmation page with booking details

### For Admins

1. **Access Dashboard**: Navigate to `/admin/bookings`
2. **View Statistics**: See total bookings, revenue, and unique customers
3. **Filter Bookings**: Filter by sport type
4. **View Details**: See all booking information in a table format

## 🎨 Adding New Sports

To add a new sport, edit `data/sports.ts`:

```typescript
{
  id: "volleyball",
  name: "Volleyball",
  description: "Play volleyball on our professional courts...",
  image: "https://example.com/volleyball.jpg",
  courts: [
    {
      id: "volleyball-1",
      name: "Volleyball Court 1",
      location: "Building 3, First Floor",
      pricePerHour: 45,
      image: "https://example.com/court.jpg",
    },
  ],
}
```

The system will automatically:
- Display the new sport on the home page
- Create booking pages for all courts
- Include it in the admin dashboard filters

## 🔧 Configuration

### Time Slots

Time slots are automatically generated from 6 AM to 11 PM. To modify this, edit `components/TimeSlotGrid.tsx`:

```typescript
for (let hour = 6; hour <= 23; hour++) {
  // Change 6 and 23 to your desired start/end times
}
```

### Pricing

Update prices in `data/sports.ts` for each court's `pricePerHour` property.

## 🗄️ Database

The application uses a JSON file (`data/bookings.json`) as a mock database. This file is automatically created on first booking.

### To Replace with a Real Database

1. Install your preferred database client (e.g., `mongodb`, `pg`, `mysql2`)
2. Update `app/api/bookings/route.ts` to use your database instead of file system
3. Update `app/api/bookings/[id]/route.ts` similarly

Example with MongoDB:

```typescript
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('play-zone');
const bookings = db.collection('bookings');
```

## 🎯 Optional Enhancements

### 1. Authentication
- Add NextAuth.js for user authentication
- Implement user accounts and booking history
- Add role-based access control for admin

### 2. Payments
- Integrate Stripe or PayPal
- Add payment processing to booking flow
- Implement refund system

### 3. Real Database
- Replace JSON file with PostgreSQL, MongoDB, or MySQL
- Add database migrations
- Implement connection pooling

### 4. Advanced Features
- Email notifications (SendGrid, Resend)
- SMS reminders (Twilio)
- Calendar integration (Google Calendar, Outlook)
- Recurring bookings
- Waitlist for fully booked slots
- Reviews and ratings system

### 5. Admin Dashboard Enhancements
- Booking cancellation
- Revenue charts and analytics
- Export bookings to CSV/Excel
- User management
- Court availability calendar view

### 6. UI/UX Improvements
- Dark mode
- Advanced filtering and search
- Booking calendar view
- Drag-and-drop time slot selection
- Multi-language support

## 🐛 Troubleshooting

### Bookings not saving
- Ensure `data/` directory has write permissions
- Check that `data/bookings.json` exists or can be created

### Time slots not showing
- Verify the date is selected
- Check browser console for API errors
- Ensure the API route is working (`/api/bookings`)

### Images not loading
- Check image URLs in `data/sports.ts`
- Use local images or ensure external URLs are accessible

## 📝 License

This project is open source and available for use and modification.

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements!

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
