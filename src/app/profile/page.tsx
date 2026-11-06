'use client';

import React, { useState, useEffect } from 'react';
import AkshayamProfileView from '@/frontend/components/profile/AkshayamProfileView';
import { useLanguage } from '@/frontend/context/LanguageContext';
import BrandLogo from '@/frontend/components/BrandLogo';
import { BRANDING } from '@/constants/branding';
import {
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Heart,
  User,
  Users,
  Printer,
  Share2,
  Edit3,
  Phone,
  Search,
  Sparkles,
  ChevronRight,
  ExternalLink,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Lock,
  PlusCircle,
  RotateCcw
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const { language, toggleLanguage } = useLanguage();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [userMobile, setUserMobile] = useState<string>('');
  const [activeViewCandidate, setActiveViewCandidate] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'MALE' | 'FEMALE'>('ALL');
  
  // Phone search / switch state
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [isSearchingPhone, setIsSearchingPhone] = useState(false);
  const [searchError, setSearchError] = useState('');

  // 1. Initial Load from LocalStorage and Supabase API
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const storedMobile =
          localStorage.getItem('namma_user_mobile') ||
          (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('mobile') : null);

        let localList: any[] = [];
        try {
          const listStr = localStorage.getItem('namma_registrations');
          if (listStr) {
            localList = JSON.parse(listStr);
          }
        } catch (e) {
          console.warn('Failed to parse namma_registrations', e);
        }

        // If localList is empty, fallback to single profile if exists
        if (localList.length === 0) {
          const singleProf = localStorage.getItem('namma_matrimony_profile') || localStorage.getItem('namma_registration_complete');
          if (singleProf) {
            try {
              const parsed = JSON.parse(singleProf);
              localList = [parsed];
            } catch (e) {}
          }
        }

        // Detect mobile from local profiles if storedMobile is not yet set
        const effectiveMobile =
          storedMobile ||
          localList[0]?.whatsappNumber ||
          localList[0]?.mobileNumber ||
          localList[0]?.userContact?.mobile ||
          '';

        if (effectiveMobile) {
          setUserMobile(effectiveMobile);
          localStorage.setItem('namma_user_mobile', effectiveMobile);

          // Fetch fresh list from Supabase
          try {
            const res = await fetch(`/api/register?mobile=${encodeURIComponent(effectiveMobile)}`);
            const data = await res.json();
            if (data.success && Array.isArray(data.profiles) && data.profiles.length > 0) {
              setRegistrations(data.profiles);
              localStorage.setItem('namma_registrations', JSON.stringify(data.profiles));
              setIsLoading(false);
              return;
            }
          } catch (apiErr) {
            console.warn('Failed to fetch profiles from API, falling back to local storage', apiErr);
          }
        }

        setRegistrations(localList);
      } catch (err) {
        console.error('ProfilePage load error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Handle searching by mobile number (to load registrations on new device)
  const handleSearchByMobile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = phoneInput.replace(/\D/g, '').slice(-10);
    if (clean.length < 10) {
      setSearchError(language === 'TA' ? 'சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்' : 'Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSearchingPhone(true);
    setSearchError('');
    try {
      const res = await fetch(`/api/register?mobile=${clean}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.profiles) && data.profiles.length > 0) {
        setRegistrations(data.profiles);
        setUserMobile(clean);
        localStorage.setItem('namma_user_mobile', clean);
        localStorage.setItem('namma_registrations', JSON.stringify(data.profiles));
        setShowPhoneModal(false);
        setPhoneInput('');
      } else {
        setSearchError(
          language === 'TA'
            ? 'இந்த தொலைபேசி எண்ணில் வரன் பதிவுகள் எதுவும் கிடைக்கவில்லை.'
            : 'No registrations found for this mobile number.'
        );
      }
    } catch (err: any) {
      setSearchError(err.message || 'Failed to fetch profiles');
    } finally {
      setIsSearchingPhone(false);
    }
  };

  // Calculate age helper
  const calculateAge = (dobString?: string) => {
    if (!dobString) return null;
    const bDate = new Date(dobString);
    if (isNaN(bDate.getTime())) return null;
    const diff = Date.now() - bDate.getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  // Format height helper
  const formatHeight = (cm?: number) => {
    if (!cm) return null;
    const totalInches = Math.round(cm / 2.54);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${cm} cm (${feet}'${inches}")`;
  };

  // WhatsApp share for candidate card
  const handleCardWhatsAppShare = (c: any) => {
    const dispId = c.displayId || c.registrationId || c.refId || 'NM-0001';
    const cName = c.fullName || c.name || 'வரன்';
    const cGender = c.gender === 'FEMALE' ? 'மணமகள்' : 'மணமகன்';
    const cAge = calculateAge(c.dob) || c.age;
    const cHeight = formatHeight(c.heightCm || c.height);

    const text = `*நம்ம மேட்ரிமோனி - ${cGender} சுயவிவரம்*
------------------------------------
*பதிவு எண் (ID):* ${dispId}
*பெயர்:* ${cName}
*வயது & உயரம்:* ${cAge ? `${cAge} வயது` : ''} ${cHeight ? `• ${cHeight}` : ''}
*சமூகம் & குலம்:* ${c.caste || 'தமிழ் சமூகம்'} ${c.koottam || c.kootam ? `(${c.koottam || c.kootam})` : ''}
*ராசி & நட்சத்திரம்:* ${c.rasi || '-'} • ${c.nakshatram || '-'}
*கல்வி & பணி:* ${c.designation || c.workNature || 'பணியில்'} (${c.city || 'Tamil Nadu'})
------------------------------------
100% இலவச மேட்ரிமோனி தளம்: ${typeof window !== 'undefined' ? window.location.origin : ''}`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // If user selected a specific candidate to view in Akshayam format
  if (activeViewCandidate) {
    return (
      <div>
        {/* Sticky Top Navigation Bar */}
        <div className="bg-[#580016] text-white px-4 py-2.5 flex items-center justify-between shadow-md sticky top-0 z-50">
          <button
            onClick={() => setActiveViewCandidate(null)}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full transition-all cursor-pointer border border-[#D4AF37]/50"
          >
            <span>← {language === 'TA' ? 'எனது சுயவிவரக் கணக்குக்குத் திரும்பு' : 'Back to My Profile Dashboard'}</span>
          </button>

          <Link
            href="/register?new=true"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-[#D4AF37] text-gray-900 hover:bg-[#c49f2e] px-3.5 py-1.5 rounded-full transition-all cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{language === 'TA' ? '+ புதிய வரன் பதிவு' : '+ Register Bride/Groom'}</span>
          </Link>
        </div>

        <AkshayamProfileView
          profile={activeViewCandidate}
          language={language}
          onBack={() => setActiveViewCandidate(null)}
          onEdit={() => {
            localStorage.setItem('namma_matrimony_draft', JSON.stringify(activeViewCandidate));
            window.location.href = '/register';
          }}
        />
      </div>
    );
  }

  // Filtered candidate list
  const filteredList = registrations.filter((c) => {
    if (selectedFilter === 'ALL') return true;
    return c.gender === selectedFilter;
  });

  const groomsCount = registrations.filter((c) => c.gender === 'MALE').length;
  const bridesCount = registrations.filter((c) => c.gender === 'FEMALE').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <BrandLogo size="md" />
          <p className="text-xs font-bold text-primary animate-pulse">
            {language === 'TA' ? 'சுயவிவரக் கணக்கு ஏற்றப்படுகிறது...' : 'Loading Your Profile Dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-gray-900 font-sans pb-16">
      
      {/* 1. TOP HEADER & NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-primary/10 shadow-xs">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          <Link href="/" className="inline-flex items-center gap-1.5 shrink-0">
            <BrandLogo size="md" />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/20 text-[11px] sm:text-xs font-bold text-primary transition-all cursor-pointer shrink-0"
              title="Switch Language"
            >
              <span>{language === 'TA' ? 'English' : 'தமிழ்'}</span>
            </button>

            {/* Register New Candidate CTA */}
            <Link
              href="/register?new=true"
              className="bg-primary hover:bg-primary-light text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 hover:scale-[1.02] shrink-0"
            >
              <Heart className="w-3.5 h-3.5 fill-white shrink-0" />
              <span>{language === 'TA' ? '+ புதிய வரன் பதிவு' : '+ Register Bride/Groom'}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. USER ACCOUNT PROFILE HERO BANNER */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="bg-gradient-to-br from-primary via-[#580016] to-primary text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl border-2 border-[#D4AF37]/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-[#D4AF37]/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-5">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-[#D4AF37] flex items-center justify-center shrink-0 shadow-lg text-[#F3E5AB]">
                <Users className="w-7 h-7 sm:w-10 sm:h-10 text-[#D4AF37]" />
              </div>

              <div className="space-y-1 sm:space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/25 text-[#F3E5AB] text-[11px] font-bold border border-[#D4AF37]/40">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <span>{language === 'TA' ? 'உறுதிசெய்யப்பட்ட சுயவிவரக் கணக்கு' : 'Verified User Account'}</span>
                </div>

                <h1 className="text-xl sm:text-3xl font-serif font-black tracking-tight text-white">
                  {language === 'TA' ? 'எனது சுயவிவரக் கணக்கு' : 'My Matrimony Profile Dashboard'}
                </h1>

                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-rose-100 font-medium">
                  {userMobile && (
                    <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                      <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span className="font-mono font-bold">+91 {userMobile}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{language === 'TA' ? '100% இலவச சமூக சேவை' : '100% Free Initiative'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions in Banner */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <Link
                href="/register?new=true"
                className="bg-[#D4AF37] hover:bg-[#c49f2e] text-gray-900 px-5 py-3 rounded-full font-extrabold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-gray-900 shrink-0" />
                <span>{language === 'TA' ? '+ புதிய வரன் பதிவு செய்க' : '+ Register New Bride/Groom'}</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowPhoneModal(true)}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-3 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{language === 'TA' ? 'வேறு தொலைபேசி எண்' : 'Search / Switch Phone'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CANDIDATE REGISTRATIONS SECTION (N PATHIVUGAL) */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
        
        {/* Section Header with Stats and Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-primary/15 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-primary font-serif flex items-center gap-2">
              <span>{language === 'TA' ? 'பதிவு செய்யப்பட்ட வரன்கள்' : 'Registered Candidate Profiles'}</span>
              <span className="text-xs sm:text-sm font-sans font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                {registrations.length} {language === 'TA' ? 'பதிவுகள்' : 'Registrations'}
              </span>
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              {language === 'TA'
                ? 'உங்கள் கணக்கில் நீங்கள் பதிவு செய்துள்ள அனைத்து மணமகன் மற்றும் மணமகள் விவரங்கள் கீழே உள்ளன.'
                : 'All bride and groom candidates registered under your account are listed below.'}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSelectedFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'ALL'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {language === 'TA' ? 'அனைத்தும்' : 'All'} ({registrations.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('MALE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'MALE'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {language === 'TA' ? 'மணமகன்' : 'Grooms'} ({groomsCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('FEMALE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'FEMALE'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {language === 'TA' ? 'மணமகள்' : 'Brides'} ({bridesCount})
            </button>
          </div>
        </div>

        {/* 4. CANDIDATES LIST GRID */}
        {filteredList.length === 0 ? (
          /* EMPTY STATE */
          <div className="bg-white rounded-3xl border-2 border-dashed border-primary/20 p-8 sm:p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-[#D4AF37]" />
            </div>

            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-bold text-primary font-serif">
                {language === 'TA' ? 'வரன் பதிவுகள் எதுவும் இல்லை' : 'No Candidate Registrations Found'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                {language === 'TA'
                  ? 'உங்கள் சுயவிவரக் கணக்கில் எத்தனை வரன்களை வேண்டுமானாலும் (மகன், மகள், சகோதரர், சகோதரி, அல்லது சுயவிவரம்) முற்றிலும் இலவசமாகப் பதிவு செய்யலாம்.'
                  : 'You can register multiple candidates (Son, Daughter, Brother, Sister, Self, or Relative) under this account for free.'}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register?new=true"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white py-3 px-6 rounded-full font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#D4AF37]" />
                <span>{language === 'TA' ? '+ முதல் வரனைப் பதிவு செய்க' : '+ Register First Candidate Now'}</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowPhoneModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-5 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <Search className="w-4 h-4 text-primary" />
                <span>{language === 'TA' ? 'ஏற்கனவே உள்ள பதிவுகளைக் கண்டறிக' : 'Find Existing Registrations'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* CANDIDATE CARDS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredList.map((candidate, idx) => {
              const cDisplayId = candidate.displayId || candidate.registrationId || candidate.refId || `NM-000${idx + 1}`;
              const cName = candidate.fullName || candidate.name || 'பெயர் குறிப்பிடப்படவில்லை';
              const isBride = candidate.gender === 'FEMALE';
              const cAge = calculateAge(candidate.dob) || candidate.age;
              const cHeight = formatHeight(candidate.heightCm || candidate.height);
              const cPhoto = candidate.photoUrl || candidate.profilePhotoUrl;
              const cRelationship = candidate.profileFor || 'SELF';

              // Map relationship tag
              const relationshipLabel = {
                SON: language === 'TA' ? 'மகன் (Son)' : 'Son',
                DAUGHTER: language === 'TA' ? 'மகள் (Daughter)' : 'Daughter',
                SELF: language === 'TA' ? 'சுயவிவரம் (Self)' : 'Self',
                BROTHER: language === 'TA' ? 'சகோதரர் (Brother)' : 'Brother',
                SISTER: language === 'TA' ? 'சகோதரி (Sister)' : 'Sister',
                RELATIVE: language === 'TA' ? 'உறவினர் (Relative)' : 'Relative',
              }[cRelationship as string] || (language === 'TA' ? 'வரன்' : 'Candidate');

              return (
                <div
                  key={candidate.id || cDisplayId}
                  className="bg-white rounded-2xl sm:rounded-3xl border-2 border-primary/20 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  {/* Top Header Row of Card */}
                  <div className="bg-gradient-to-r from-primary/10 via-[#FFFDF9] to-primary/5 px-4 sm:px-6 py-3 border-b border-primary/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide border ${
                        isBride
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-blue-100 text-blue-800 border-blue-300'
                      }`}>
                        {isBride ? (language === 'TA' ? 'மணமகள் (Bride)' : 'Bride') : (language === 'TA' ? 'மணமகன் (Groom)' : 'Groom')}
                      </span>
                      <span className="text-[11px] font-bold text-gray-600 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                        {relationshipLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                        {cDisplayId}
                      </span>
                    </div>
                  </div>

                  {/* Body: Candidate Details & Photo */}
                  <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-5">
                    
                    {/* Candidate Photo / Avatar Thumbnail */}
                    <div className="shrink-0 mx-auto sm:mx-0">
                      <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-xl sm:rounded-2xl border-2 border-[#D4AF37]/60 overflow-hidden shadow-sm bg-[#FAF6F0] relative flex items-center justify-center">
                        {cPhoto ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={cPhoto}
                              alt={cName}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-primary/5 pointer-events-none flex items-center justify-center">
                              <span className="text-[9px] text-white/90 bg-black/40 px-1 py-0.5 rounded backdrop-blur-xs font-bold uppercase tracking-wider">
                                {BRANDING.brandName}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-2 text-primary/60">
                            <User className="w-10 h-10 mx-auto text-[#D4AF37]" />
                            <span className="text-[10px] font-bold text-gray-500 block mt-1">
                              {language === 'TA' ? 'புகைப்படம் இல்லை' : 'No Photo'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Candidate Specs Info */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-primary font-serif">
                          {cName}
                        </h3>
                        <p className="text-xs font-bold text-gray-700">
                          {candidate.caste || (language === 'TA' ? 'அனைத்து தமிழ் சமூகம்' : 'All Tamil Communities')} {candidate.koottam || candidate.kootam ? `• ${candidate.koottam || candidate.kootam}` : ''}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-gray-600 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{cAge ? `${cAge} வயது` : 'வயது குறிக்கப்படவில்லை'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate">{candidate.city || 'Tamil Nadu'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                          <span className="truncate">{candidate.rasi || '-'} • {candidate.nakshatra || candidate.nakshatram || '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate">{candidate.designation || candidate.workNature || 'பணியில்'}</span>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>{language === 'TA' ? 'சரிபார்க்கப்பட்டது' : 'Verified'}</span>
                        </span>
                        {cHeight && (
                          <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                            {cHeight}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4 ACTION BUTTONS FOR EACH CANDIDATE */}
                  <div className="bg-[#FFFDF9] border-t border-primary/10 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveViewCandidate(candidate)}
                      className="bg-primary hover:bg-primary-light text-white px-3.5 sm:px-4 py-2 rounded-full font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{language === 'TA' ? 'பயோடேட்டா காண்க' : 'View Akshayam Biodata'}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </button>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {/* WhatsApp Share */}
                      <button
                        type="button"
                        onClick={() => handleCardWhatsAppShare(candidate)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 p-2 rounded-full transition-all cursor-pointer"
                        title="Share on WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Print Biodata */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveViewCandidate(candidate);
                          setTimeout(() => window.print(), 300);
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 p-2 rounded-full transition-all cursor-pointer"
                        title="Print Biodata"
                      >
                        <Printer className="w-3.5 h-3.5 text-primary" />
                      </button>

                      {/* Edit Candidate */}
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.setItem('namma_matrimony_draft', JSON.stringify(candidate));
                          window.location.href = `/register?edit=${cDisplayId}`;
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 p-2 rounded-full transition-all cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-gray-700" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. COMMUNITY ASSURANCE FOOTER BANNER */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-primary/15 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-bold text-primary font-serif flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{language === 'TA' ? '100% இலவச வரன் பதிவு மற்றும் பாதுகாப்பு' : '100% Free Registration & Privacy Protection'}</span>
            </h4>
            <p className="text-xs text-gray-600 max-w-xl">
              {language === 'TA'
                ? 'உங்கள் தொலைபேசி எண் மற்றும் முகவரி விவரங்கள் உங்கள் அனுமதியின்றி யாருக்கும் பகிரப்படாது.'
                : 'Your contact numbers and house address are protected with strict privacy settings.'}
            </p>
          </div>

          <Link
            href="/register?new=true"
            className="inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-light text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full shadow-md transition-all shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#D4AF37]" />
            <span>{language === 'TA' ? '+ மற்றொரு வரன் பதிவு செய்க' : '+ Register Another Candidate'}</span>
          </Link>
        </div>
      </div>

      {/* 6. SWITCH PHONE / SEARCH MODAL */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-[#D4AF37]/50 space-y-4">
            <div className="flex items-center justify-between border-b border-primary/10 pb-3">
              <h3 className="text-base sm:text-lg font-black text-primary font-serif">
                {language === 'TA' ? 'வரன் பதிவுகளைத் தேடுக' : 'Find Your Registrations'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowPhoneModal(false);
                  setSearchError('');
                }}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {language === 'TA'
                ? 'நீங்கள் பதிவு செய்யும்போது பயன்படுத்திய 10 இலக்க முதன்மை மொபைல் எண்ணை உள்ளிட்டு உங்கள் அனைத்து வரன் பதிவுகளையும் கண்டறியலாம்.'
                : 'Enter your 10-digit registered mobile number to fetch all candidate profiles registered under your account.'}
            </p>

            <form onSubmit={handleSearchByMobile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {language === 'TA' ? 'பதிவு செய்யப்பட்ட மொபைல் எண்' : 'Registered Mobile Number'}
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-700 font-bold text-xs sm:text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="9952562920"
                    className="w-full h-11 px-3.5 rounded-r-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-bold text-sm focus:border-primary focus:outline-none"
                    autoFocus
                  />
                </div>
                {searchError && (
                  <p className="text-xs text-red-600 font-bold mt-1.5">{searchError}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSearchingPhone}
                  className="w-full bg-primary hover:bg-primary-light text-white py-3 rounded-full font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Search className="w-4 h-4 text-[#D4AF37]" />
                  <span>
                    {isSearchingPhone
                      ? (language === 'TA' ? 'தேடப்படுகிறது...' : 'Searching...')
                      : (language === 'TA' ? 'பதிவுகளைக் காண்க' : 'Fetch Registrations')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
