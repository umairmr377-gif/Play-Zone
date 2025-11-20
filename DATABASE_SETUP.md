<<<<<<< HEAD
# 🗄️ Database Setup Guide - PostgreSQL + Prisma

## ✅ What's Been Completed

### 1. **Prisma Installation & Configuration**
- ✅ Prisma installed
- ✅ PostgreSQL client (`pg`) installed
- ✅ Prisma schema created with Sport, Court, and Booking models
- ✅ Prisma client utility created (`lib/prisma.ts`)
- ✅ Seed script created (`prisma/seed.ts`)

### 2. **Database Schema**

**Sport Model:**
- id (Int, auto-increment)
- name, description, image
- Relations: courts[], bookings[]
- Timestamps: createdAt, updatedAt

**Court Model:**
- id (Int, auto-increment)
- name, location, pricePerHour, image (optional)
- sportId (foreign key)
- Relations: sport, bookings[]
- Indexes: sportId
- Timestamps: createdAt, updatedAt

**Booking Model:**
- id (Int, auto-increment)
- date, timeSlot, courtId, sportId
- customerName, customerEmail, totalPrice
- Relations: court, sport
- Unique constraint: (courtId, date, timeSlot) - prevents double booking
- Indexes: [courtId, date], sportId
- Timestamps: createdAt, updatedAt

### 3. **API Routes Created**

✅ **GET /api/sports** - List all sports with courts
✅ **GET /api/sports/[id]** - Get specific sport with courts
✅ **GET /api/bookings** - List all bookings (admin) or filter by court/date
✅ **POST /api/bookings** - Create new booking with conflict detection
✅ **GET /api/bookings/[id]** - Get specific booking

### 4. **Frontend Integration**

✅ Home page (`/`) - Fetches sports from API
✅ Sports list (`/sports`) - Fetches sports from API
✅ Sport details (`/sports/[id]`) - Fetches sport from API
✅ Booking page (`/book/[sport]/[courtId]`) - Fetches sport/court from API
✅ All pages have loading states and error handling

## 🚀 Setup Instructions

### Step 1: Install PostgreSQL

**Option A: Local PostgreSQL**
```bash
# Windows (using Chocolatey)
choco install postgresql

# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Linux (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Option B: Docker PostgreSQL**
```bash
docker run --name sports-booking-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=sports_booking \
  -p 5432:5432 \
  -d postgres:15
```

**Option C: Cloud PostgreSQL**
- [Supabase](https://supabase.com) (Free tier available)
- [Railway](https://railway.app) (Free tier available)
- [Neon](https://neon.tech) (Free tier available)
- [Render](https://render.com) (Free tier available)

### Step 2: Configure Database URL

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/sports_booking?schema=public"
```

**Examples:**
- Local: `postgresql://postgres:postgres@localhost:5432/sports_booking?schema=public`
- Supabase: `postgresql://user:password@db.xxxxx.supabase.co:5432/postgres`
- Railway: `postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway`

### Step 3: Generate Prisma Client

```bash
npm run db:generate
```

### Step 4: Run Migrations

```bash
npm run db:migrate
```

This will:
- Create the database tables
- Apply the schema
- Create migration files

### Step 5: Seed the Database

```bash
npm run db:seed
```

This will populate the database with:
- 5 sports (Football, Paddle, Cricket, Tennis, Badminton)
- 14 courts total
- All with proper relationships

### Step 6: Verify Setup

**Option A: Prisma Studio (Visual Database Browser)**
```bash
npm run db:studio
```
Opens at http://localhost:5555

**Option B: Test API Routes**
```bash
# Start dev server
npm run dev

# Test endpoints
curl http://localhost:3000/api/sports
curl http://localhost:3000/api/sports/1
```

## 📋 Available Scripts

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

## 🔍 Database Features

### Conflict Prevention
- Unique constraint on `(courtId, date, timeSlot)` prevents double booking
- API checks for conflicts before creating bookings
- Returns 409 status if conflict detected

### Data Integrity
- Foreign key constraints ensure data consistency
- Cascade delete: Deleting a sport/court deletes related bookings
- Indexes on frequently queried fields for performance

### Scalability
- Indexed queries for fast lookups
- Efficient relationship queries with Prisma
- Transaction support for atomic operations

## 🧪 Testing the Integration

1. **Test Sports API:**
   ```bash
   curl http://localhost:3000/api/sports
   ```

2. **Test Booking Creation:**
   ```bash
   curl -X POST http://localhost:3000/api/bookings \
     -H "Content-Type: application/json" \
     -d '{
       "sportId": "1",
       "courtId": "1",
       "date": "2024-12-25",
       "timeSlots": ["10:00", "11:00"],
       "customerName": "John Doe",
       "customerEmail": "john@example.com",
       "totalPrice": 100
     }'
   ```

3. **Test Conflict Detection:**
   - Try booking the same court/date/time slot twice
   - Should return 409 Conflict

## 🎯 Next Steps (Optional Enhancements)

### 1. User Authentication
- Add User model to schema
- Integrate NextAuth.js
- Link bookings to users

### 2. Payments
- Add payment status to Booking model
- Integrate Stripe
- Track payment history

### 3. Admin Features
- CRUD operations for sports/courts
- Booking management
- Revenue analytics

### 4. Advanced Features
- Recurring bookings
- Waitlist system
- Email notifications
- Calendar view

## 🐛 Troubleshooting

### "Can't reach database server"
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Check firewall/network settings

### "Relation does not exist"
- Run migrations: `npm run db:migrate`
- Check database name in DATABASE_URL

### "Prisma Client not generated"
- Run: `npm run db:generate`
- Restart dev server

### "Seed script fails"
- Ensure migrations have run
- Check database connection
- Verify seed script has correct data

## 📚 Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Status**: ✅ Database integration complete! Ready for production use.

=======
# 🗄️ Database Setup Guide - PostgreSQL + Prisma

## ✅ What's Been Completed

### 1. **Prisma Installation & Configuration**
- ✅ Prisma installed
- ✅ PostgreSQL client (`pg`) installed
- ✅ Prisma schema created with Sport, Court, and Booking models
- ✅ Prisma client utility created (`lib/prisma.ts`)
- ✅ Seed script created (`prisma/seed.ts`)

### 2. **Database Schema**

**Sport Model:**
- id (Int, auto-increment)
- name, description, image
- Relations: courts[], bookings[]
- Timestamps: createdAt, updatedAt

**Court Model:**
- id (Int, auto-increment)
- name, location, pricePerHour, image (optional)
- sportId (foreign key)
- Relations: sport, bookings[]
- Indexes: sportId
- Timestamps: createdAt, updatedAt

**Booking Model:**
- id (Int, auto-increment)
- date, timeSlot, courtId, sportId
- customerName, customerEmail, totalPrice
- Relations: court, sport
- Unique constraint: (courtId, date, timeSlot) - prevents double booking
- Indexes: [courtId, date], sportId
- Timestamps: createdAt, updatedAt

### 3. **API Routes Created**

✅ **GET /api/sports** - List all sports with courts
✅ **GET /api/sports/[id]** - Get specific sport with courts
✅ **GET /api/bookings** - List all bookings (admin) or filter by court/date
✅ **POST /api/bookings** - Create new booking with conflict detection
✅ **GET /api/bookings/[id]** - Get specific booking

### 4. **Frontend Integration**

✅ Home page (`/`) - Fetches sports from API
✅ Sports list (`/sports`) - Fetches sports from API
✅ Sport details (`/sports/[id]`) - Fetches sport from API
✅ Booking page (`/book/[sport]/[courtId]`) - Fetches sport/court from API
✅ All pages have loading states and error handling

## 🚀 Setup Instructions

### Step 1: Install PostgreSQL

**Option A: Local PostgreSQL**
```bash
# Windows (using Chocolatey)
choco install postgresql

# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Linux (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Option B: Docker PostgreSQL**
```bash
docker run --name sports-booking-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=sports_booking \
  -p 5432:5432 \
  -d postgres:15
```

**Option C: Cloud PostgreSQL**
- [Supabase](https://supabase.com) (Free tier available)
- [Railway](https://railway.app) (Free tier available)
- [Neon](https://neon.tech) (Free tier available)
- [Render](https://render.com) (Free tier available)

### Step 2: Configure Database URL

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/sports_booking?schema=public"
```

**Examples:**
- Local: `postgresql://postgres:postgres@localhost:5432/sports_booking?schema=public`
- Supabase: `postgresql://user:password@db.xxxxx.supabase.co:5432/postgres`
- Railway: `postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway`

### Step 3: Generate Prisma Client

```bash
npm run db:generate
```

### Step 4: Run Migrations

```bash
npm run db:migrate
```

This will:
- Create the database tables
- Apply the schema
- Create migration files

### Step 5: Seed the Database

```bash
npm run db:seed
```

This will populate the database with:
- 5 sports (Football, Paddle, Cricket, Tennis, Badminton)
- 14 courts total
- All with proper relationships

### Step 6: Verify Setup

**Option A: Prisma Studio (Visual Database Browser)**
```bash
npm run db:studio
```
Opens at http://localhost:5555

**Option B: Test API Routes**
```bash
# Start dev server
npm run dev

# Test endpoints
curl http://localhost:3000/api/sports
curl http://localhost:3000/api/sports/1
```

## 📋 Available Scripts

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

## 🔍 Database Features

### Conflict Prevention
- Unique constraint on `(courtId, date, timeSlot)` prevents double booking
- API checks for conflicts before creating bookings
- Returns 409 status if conflict detected

### Data Integrity
- Foreign key constraints ensure data consistency
- Cascade delete: Deleting a sport/court deletes related bookings
- Indexes on frequently queried fields for performance

### Scalability
- Indexed queries for fast lookups
- Efficient relationship queries with Prisma
- Transaction support for atomic operations

## 🧪 Testing the Integration

1. **Test Sports API:**
   ```bash
   curl http://localhost:3000/api/sports
   ```

2. **Test Booking Creation:**
   ```bash
   curl -X POST http://localhost:3000/api/bookings \
     -H "Content-Type: application/json" \
     -d '{
       "sportId": "1",
       "courtId": "1",
       "date": "2024-12-25",
       "timeSlots": ["10:00", "11:00"],
       "customerName": "John Doe",
       "customerEmail": "john@example.com",
       "totalPrice": 100
     }'
   ```

3. **Test Conflict Detection:**
   - Try booking the same court/date/time slot twice
   - Should return 409 Conflict

## 🎯 Next Steps (Optional Enhancements)

### 1. User Authentication
- Add User model to schema
- Integrate NextAuth.js
- Link bookings to users

### 2. Payments
- Add payment status to Booking model
- Integrate Stripe
- Track payment history

### 3. Admin Features
- CRUD operations for sports/courts
- Booking management
- Revenue analytics

### 4. Advanced Features
- Recurring bookings
- Waitlist system
- Email notifications
- Calendar view

## 🐛 Troubleshooting

### "Can't reach database server"
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Check firewall/network settings

### "Relation does not exist"
- Run migrations: `npm run db:migrate`
- Check database name in DATABASE_URL

### "Prisma Client not generated"
- Run: `npm run db:generate`
- Restart dev server

### "Seed script fails"
- Ensure migrations have run
- Check database connection
- Verify seed script has correct data

## 📚 Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Status**: ✅ Database integration complete! Ready for production use.

>>>>>>> 16b84495fe6f1c048cd507daeab9b0cb5fccc62d
