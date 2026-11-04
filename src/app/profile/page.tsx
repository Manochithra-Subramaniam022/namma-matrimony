'use client';

import React, { useState, useEffect } from 'react';
import AkshayamProfileView from '@/frontend/components/profile/AkshayamProfileView';
import { useLanguage } from '@/frontend/context/LanguageContext';
import BrandLogo from '@/frontend/components/BrandLogo';
import { UserPlus, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const { language } = useLanguage();
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('namma_matrimony_profile') || localStorage.getItem('namma_registration_complete');
      if (saved) {
        setProfile(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load profile', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <BrandLogo size="md" />
          <p className="text-xs font-bold text-primary animate-pulse">
            சுயவிவரம் ஏற்றப்படுகிறது (Loading Matrimony Profile)...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] py-12 px-4 flex items-center justify-center font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl border-2 border-primary/20 shadow-xl p-8 text-center space-y-5">
          <BrandLogo size="lg" />
          
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 text-[#D4AF37]" />
          </div>

          <div>
            <h2 className="text-xl font-black text-primary font-serif">
              {language === 'TA' ? 'சுயவிவரம் எதுவும் கிடைக்கவில்லை' : 'No Profile Found on this Device'}
            </h2>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              {language === 'TA'
                ? 'உங்கள் வரன் விவரங்களை இலவசமாகப் பதிவு செய்து அக்சயம் பாணி உயர்தர பயோடேட்டாவைப் பெறுங்கள்.'
                : 'Register your matrimonial profile for free in 4 simple steps to generate an Akshayam-style traditional verified biodata.'}
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              href="/register"
              className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white py-3.5 px-6 rounded-full font-extrabold text-sm shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#D4AF37]" />
              <span>{language === 'TA' ? 'இலவசமாக பதிவு செய்க' : 'Register Free Profile Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/"
              className="block text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
            >
              {language === 'TA' ? 'முகப்புக்குச் செல்க (Home)' : 'Go to Homepage'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AkshayamProfileView
      profile={profile}
      language={language}
      onEdit={() => {
        window.location.href = '/register';
      }}
    />
  );
}
