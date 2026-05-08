
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create booking status enum
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Create user role enum for profiles
CREATE TYPE public.user_role AS ENUM ('devotee', 'pandit', 'admin');

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'devotee',
  avatar_url TEXT,
  bio TEXT,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Pandits table
CREATE TABLE public.pandits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  specializations TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  city TEXT,
  bio TEXT,
  photo_url TEXT,
  phone TEXT,
  verified BOOLEAN DEFAULT false,
  rating NUMERIC(3,2) DEFAULT 0,
  total_ceremonies INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pandits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified pandits" ON public.pandits FOR SELECT USING (verified = true);
CREATE POLICY "Admins can manage pandits" ON public.pandits FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Pandits can update own profile" ON public.pandits FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_pandits_updated_at BEFORE UPDATE ON public.pandits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pandit_id UUID REFERENCES public.pandits(id) ON DELETE SET NULL,
  ritual_type TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  address TEXT,
  notes TEXT,
  phone TEXT,
  contact_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Pandits can view assigned bookings" ON public.bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.pandits WHERE pandits.user_id = auth.uid() AND pandits.id = bookings.pandit_id)
);
CREATE POLICY "Admins can manage all bookings" ON public.bookings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Contact messages table
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view messages" ON public.contact_messages FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update messages" ON public.contact_messages FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Seed initial pandit data
INSERT INTO public.pandits (name, specializations, experience_years, city, bio, phone, verified, rating, total_ceremonies) VALUES
('Pt. Ram Prasad Sharma', ARRAY['Vivah', 'Bratabandha', 'Satyanarayan Puja', 'Griha Pravesh'], 25, 'Kathmandu', 'Renowned Vedic scholar with 25 years of experience performing sacred ceremonies across Kathmandu Valley. Specializes in Vivah and Bratabandha ceremonies with authentic Yajurveda traditions.', '+977 9841000001', true, 4.9, 1200),
('Pt. Keshav Acharya', ARRAY['Shraddha', 'Rudri Path', 'Navagraha Puja', 'Graha Shanti'], 18, 'Bhaktapur', 'Expert in ancestral rites and planetary remedies. Pt. Acharya has deep knowledge of Shraddha ceremonies and Vedic astrology, serving families in Bhaktapur and surrounding districts.', '+977 9841000002', true, 4.8, 850),
('Pt. Hari Datta Upadhyay', ARRAY['Namakaran', 'Pasni', 'Chudakarma', 'Annaprashan'], 20, 'Pokhara', 'Specialist in childhood Samskaras and naming ceremonies. Known for conducting serene and meaningful rituals for newborns and young children across Western Nepal.', '+977 9841000003', true, 4.7, 950),
('Pt. Vishnu Dev Pant', ARRAY['Vivah', 'Griha Pravesh', 'Satyanarayan Puja', 'Vastu Puja'], 30, 'Lalitpur', 'One of the most experienced Purohits in Nepal with three decades of service. Expert in Vastu Shastra consultations and elaborate wedding ceremonies.', '+977 9841000004', true, 4.95, 2000),
('Pt. Surya Nath Joshi', ARRAY['Rudri Path', 'Lakshmi Puja', 'Durga Puja', 'Ganesh Puja'], 15, 'Biratnagar', 'Devoted to Shakti worship and devotional ceremonies. Pt. Joshi brings warmth and devotion to every puja, making ceremonies memorable for families in Eastern Nepal.', '+977 9841000005', true, 4.6, 600);

-- Enable realtime for bookings
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
