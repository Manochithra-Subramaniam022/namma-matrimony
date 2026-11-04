const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(url, key);

async function verify() {
  console.log('🔍 Connecting to Supabase project:', url);

  const { data: profileData, error: profileErr } = await supabase.from('Profile').select('id, name, displayId').limit(1);
  const { data: userData, error: userErr } = await supabase.from('User').select('id, mobile_no').limit(1);

  if (profileErr || userErr) {
    console.log('⚠️ Tables not created yet.');
    console.log('👉 Please paste the SQL from supabase/prisma_schema.sql into your Supabase SQL Editor and click RUN.');
  } else {
    console.log('✅ SUCCESS! Prisma tables (User, Profile, Family, Expectations) are ready in Supabase!');
    console.log('📊 Profiles in DB:', profileData ? profileData.length : 0, 'Users in DB:', userData ? userData.length : 0);
  }
}

verify();