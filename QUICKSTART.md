<<<<<<< HEAD
# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Your Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 What You'll See

- **Home Page** (`/`): Overview of all available sports
- **Sports List** (`/sports`): Browse all sports with details
- **Sport Details** (`/sports/[id]`): View courts for a specific sport
- **Booking Page** (`/book/[sport]/[courtId]`): Select date and time slots
- **Confirmation** (`/confirmation`): Booking confirmation details
- **Admin Dashboard** (`/admin/bookings`): View all bookings and statistics

## 🎯 Try It Out

1. Click on any sport from the home page
2. Select a court
3. Choose a date
4. Pick available time slots (6 AM - 11 PM)
5. Enter your name and email
6. Confirm your booking!

## 📝 Notes

- Bookings are stored in `data/bookings.json` (auto-created on first booking)
- Time slots are in 24-hour format (06:00 to 23:00)
- Double-booking is automatically prevented
- All data is stored locally (perfect for development)

## 🛠️ Troubleshooting

**Port 3000 already in use?**
```bash
# Use a different port
npm run dev -- -p 3001
```

**Module not found errors?**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Bookings not saving?**
- Check that `data/` directory exists and has write permissions
- Ensure `data/bookings.json` can be created

---

Happy Booking! 🏆

=======
# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Your Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 What You'll See

- **Home Page** (`/`): Overview of all available sports
- **Sports List** (`/sports`): Browse all sports with details
- **Sport Details** (`/sports/[id]`): View courts for a specific sport
- **Booking Page** (`/book/[sport]/[courtId]`): Select date and time slots
- **Confirmation** (`/confirmation`): Booking confirmation details
- **Admin Dashboard** (`/admin/bookings`): View all bookings and statistics

## 🎯 Try It Out

1. Click on any sport from the home page
2. Select a court
3. Choose a date
4. Pick available time slots (6 AM - 11 PM)
5. Enter your name and email
6. Confirm your booking!

## 📝 Notes

- Bookings are stored in `data/bookings.json` (auto-created on first booking)
- Time slots are in 24-hour format (06:00 to 23:00)
- Double-booking is automatically prevented
- All data is stored locally (perfect for development)

## 🛠️ Troubleshooting

**Port 3000 already in use?**
```bash
# Use a different port
npm run dev -- -p 3001
```

**Module not found errors?**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Bookings not saving?**
- Check that `data/` directory exists and has write permissions
- Ensure `data/bookings.json` can be created

---

Happy Booking! 🏆

>>>>>>> 16b84495fe6f1c048cd507daeab9b0cb5fccc62d
