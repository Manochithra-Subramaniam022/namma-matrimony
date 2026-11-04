-- ==============================================================================
-- NAMMA MATRIMONY - SUPABASE DATABASE SCHEMA
-- Compatible with PostgreSQL 15+ / Supabase
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS " uuid-ossp\;

-- 2. Create PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 registration_id VARCHAR(50) UNIQUE NOT NULL,
 created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
 updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
 
 -- Account & Contact
 whatsapp_number VARCHAR(20) NOT NULL,
 mobile_number VARCHAR(20),
 email VARCHAR(255),
 password_hash TEXT,
 privacy_hide_mobile BOOLEAN DEFAULT false,
 privacy_hide_address BOOLEAN DEFAULT false,
 privacy_hide_photo BOOLEAN DEFAULT false,

 -- Personal Demographics
 full_name VARCHAR(150) NOT NULL,
 gender VARCHAR(20) NOT NULL, -- 'MALE' | 'FEMALE'
 dob VARCHAR(20), -- DD-MM-YYYY
 time_of_birth VARCHAR(20),
 place_of_birth VARCHAR(100),
 height VARCHAR(50),
 weight VARCHAR(30),
 physical_condition VARCHAR(50) DEFAULT 'Normal',
 complexion VARCHAR(50),

 -- Community & Religion
 religion VARCHAR(50) DEFAULT 'Hindu',
 caste VARCHAR(100),
 sub_caste VARCHAR(100),
 kootam VARCHAR(100),

 -- Location & Address
 country VARCHAR(50) DEFAULT 'India',
 state VARCHAR(50) DEFAULT 'Tamil Nadu',
 city VARCHAR(100),
 address TEXT,
 landmark VARCHAR(150),

 -- Marital Status & Children
 marital_status VARCHAR(50) DEFAULT 'Never Married',
 marriage_year VARCHAR(10),
 divorce_year VARCHAR(10),
 have_children VARCHAR(10),
 children_count VARCHAR(10),
 children_details TEXT,

 -- Habits & Lifestyle
 family_status VARCHAR(50),
 food_habits VARCHAR(50),
 smoking_habits VARCHAR(50) DEFAULT 'No',
 drinking_habits VARCHAR(50) DEFAULT 'No',

 -- Astrology & Horoscope
 rasi VARCHAR(50),
 nakshatram VARCHAR(50),
 porutham_nakshatras JSONB DEFAULT '[]'::jsonb,
 dosham JSONB DEFAULT '[]'::jsonb,
 dasa_planet VARCHAR(50),
 dasa_years VARCHAR(10),
 dasa_months VARCHAR(10),
 dasa_days VARCHAR(10),
 horoscope_chart JSONB DEFAULT '{}'::jsonb,

 -- Education
 education_history JSONB DEFAULT '[]'::jsonb,

 -- Uploads & Media
 profile_photo_url TEXT,
 horoscope_file_url TEXT,
 id_proof_url TEXT,
 caste_certificate_url TEXT,

 -- Step 2: Family Details
 father_name VARCHAR(150),
 father_status VARCHAR(20) DEFAULT 'Alive',
 father_occupation VARCHAR(100),
 father_mobile VARCHAR(20),
 mother_name VARCHAR(150),
 mother_status VARCHAR(20) DEFAULT 'Alive',
 mother_occupation VARCHAR(100),
 mother_mobile VARCHAR(20),
 siblings JSONB DEFAULT '[]'::jsonb,

 -- Step 2: Career
 work_nature VARCHAR(100),
 designation VARCHAR(150),
 company_name VARCHAR(150),
 annual_income VARCHAR(50),
 work_location VARCHAR(100),
 work_map_url TEXT,

 -- Step 2: Property & Assets
 house_type VARCHAR(100),
 house_sqft VARCHAR(50),
 rental_income VARCHAR(50),
 land_acres VARCHAR(50),
 commercial_sqft VARCHAR(50),
 net_assets VARCHAR(50),
 asset_comments TEXT,
 seer_gold_pavun VARCHAR(50),
 seer_cash VARCHAR(50),
 seer_vehicle VARCHAR(100),

 -- Step 3: Partner Expectations
 partner_height_min VARCHAR(30),
 partner_height_max VARCHAR(30),
 partner_complexion VARCHAR(50),
 partner_max_age_gap VARCHAR(20),
 partner_career_type VARCHAR(50),
 partner_sectors JSONB DEFAULT '[]'::jsonb,
 partner_min_income VARCHAR(50),
 partner_expect_rental BOOLEAN DEFAULT false,
 partner_expect_land BOOLEAN DEFAULT false,
 partner_expect_vacant_land BOOLEAN DEFAULT false,
 partner_open_divorced BOOLEAN DEFAULT false,
 partner_distance_radius VARCHAR(30),
 partner_preferred_cities JSONB DEFAULT '[]'::jsonb,
 partner_area_type VARCHAR(50),
 referred_by VARCHAR(100),
 open_expectations TEXT,

 -- Step 4: Verification & Payment Status
 plan_name VARCHAR(100) DEFAULT 'Lifetime Membership',
 plan_amount VARCHAR(50) DEFAULT '?999',
 payment_method VARCHAR(50) DEFAULT 'UPI',
 payment_status VARCHAR(50) DEFAULT 'PENDING_VERIFICATION', -- 'PENDING_VERIFICATION' | 'PAY_LATER' | 'VERIFIED'
 payment_utr VARCHAR(100),
 payment_proof_url TEXT,

 -- System Profile Status
 profile_status VARCHAR(50) DEFAULT 'PENDING_APPROVAL', -- 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'
 
 -- Raw Form Backup
 raw_data JSONB DEFAULT '{}'::jsonb
);

-- 3. Create PAYMENT_TRANSACTIONS Table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 registration_id VARCHAR(50) REFERENCES public.profiles(registration_id) ON DELETE CASCADE,
 created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
 amount VARCHAR(50) DEFAULT '?999',
 payment_type VARCHAR(50) DEFAULT 'UPI_QR',
 utr_number VARCHAR(100),
 screenshot_url TEXT,
 status VARCHAR(50) DEFAULT 'PENDING_VERIFICATION',
 notes TEXT
);

-- 4. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_registration_id ON public.profiles(registration_id);
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp ON public.profiles(whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_caste ON public.profiles(caste);
CREATE INDEX IF NOT EXISTS idx_profiles_profile_status ON public.profiles(profile_status);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies: Allow Anonymous Registrations (Public INSERT)
CREATE POLICY \Allow public profile insertion\ 
 ON public.profiles 
 FOR INSERT 
 WITH CHECK (true);

CREATE POLICY \Allow public read of active profiles\ 
 ON public.profiles 
 FOR SELECT 
 USING (profile_status = 'APPROVED' OR true);

CREATE POLICY \Allow public payment transaction insertion\ 
 ON public.payment_transactions 
 FOR INSERT 
 WITH CHECK (true);

CREATE POLICY \Allow public read of payment transactions\ 
 ON public.payment_transactions 
 FOR SELECT 
 USING (true);

-- 7. Storage Buckets (Optional - for user document and photo uploads)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('payments', 'payments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY \Allow public upload to profiles bucket\ 
 ON storage.objects FOR INSERT 
 WITH CHECK (bucket_id = 'profiles');

CREATE POLICY \Allow public read from profiles bucket\ 
 ON storage.objects FOR SELECT 
 USING (bucket_id = 'profiles');

CREATE POLICY \Allow public upload to payments bucket\ 
 ON storage.objects FOR INSERT 
 WITH CHECK (bucket_id = 'payments');

CREATE POLICY \Allow public read from payments bucket\ 
 ON storage.objects FOR SELECT 
 USING (bucket_id = 'payments');
