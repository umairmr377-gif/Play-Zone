-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sports Table
CREATE TABLE IF NOT EXISTS sports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courts Table
CREATE TABLE IF NOT EXISTS courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  price_per_hour NUMERIC(10, 2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  price NUMERIC(10, 2) NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_courts_sport_id ON courts(sport_id);
CREATE INDEX IF NOT EXISTS idx_bookings_court_id ON bookings(court_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Composite index for booking conflict detection
CREATE INDEX IF NOT EXISTS idx_bookings_court_date_time ON bookings(court_id, date, start_time, end_time);

-- Set timezone to Pakistan Standard Time (PKT - UTC+5)
-- Note: This sets timezone for the session. For database-level setting,
-- configure it in Supabase project settings or connection string.
SET timezone = 'Asia/Karachi';

-- Function to get current timestamp in PKT
CREATE OR REPLACE FUNCTION now_pkt()
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
  RETURN (NOW() AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Karachi';
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp (uses PKT)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = (NOW() AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Karachi';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Sports: Public read access
CREATE POLICY "Sports are viewable by everyone"
  ON sports FOR SELECT
  USING (true);

-- Courts: Public read access
CREATE POLICY "Courts are viewable by everyone"
  ON courts FOR SELECT
  USING (true);

-- Bookings: Users can view their own bookings
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Bookings: Anyone can create bookings (for guest bookings)
CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

-- Bookings: Users can update their own bookings
CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- Bookings: Users can delete their own bookings
CREATE POLICY "Users can delete own bookings"
  ON bookings FOR DELETE
  USING (auth.uid() = user_id);

-- Profiles: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Profiles: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin policies (using service role key bypasses RLS)
-- For admin operations, use service role client
