'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/frontend/context/LanguageContext';
import { BRANDING } from '@/constants/branding';
import BrandLogo from '../BrandLogo';
import ProfileDrawer from '@/frontend/components/profile/ProfileDrawer';
import {
  Sparkles,
  ShieldCheck,
  Heart,
  Search,
  ArrowRight,
  Compass,
  Lock,
  CheckCircle,
  User,
  Users,
  AlertCircle,
  MapPin,
  Building,
  Moon,
  Star,
  Calendar,
  RotateCcw,
  SlidersHorizontal,
  CheckCircle2,
} from 'lucide-react';
import { rasiOptions, nakshatraByRasi, allNakshatras } from '@/frontend/utils/astrology';

const AGE_OPTIONS = Array.from({ length: 55 - 18 + 1 }, (_, i) => 18 + i);

export default function LandingPage() {
  const { language, toggleLanguage } = useLanguage();
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  const [lookingFor, setLookingFor] = useState('BRIDE');
  const [ageFrom, setAgeFrom] = useState('21');
  const [ageTo, setAgeTo] = useState('29');
  const [castePreference, setCastePreference] = useState('Any');
  const [areaPreference, setAreaPreference] = useState('Any');
  const [financialCapacity, setFinancialCapacity] = useState('Any');
  const [doshamPreference, setDoshamPreference] = useState('Any');
  const [rasiPreference, setRasiPreference] = useState('Any');
  const [nakshatraPreference, setNakshatraPreference] = useState('Any');

  const availableNakshatras = useMemo(() => {
    if (!rasiPreference || rasiPreference === 'Any') {
      return allNakshatras;
    }
    return nakshatraByRasi[rasiPreference] || allNakshatras;
  }, [rasiPreference]);

  const handleRasiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRasi = e.target.value;
    setRasiPreference(newRasi);
    if (newRasi !== 'Any' && nakshatraPreference !== 'Any') {
      const allowed = nakshatraByRasi[newRasi] || [];
      const stillValid = allowed.some((n) => n.value === nakshatraPreference || n.ta === nakshatraPreference);
      if (!stillValid) {
        setNakshatraPreference('Any');
      }
    }
  };

  const handleResetFilters = () => {
    setLookingFor('BRIDE');
    setAgeFrom('21');
    setAgeTo('29');
    setCastePreference('Any');
    setAreaPreference('Any');
    setFinancialCapacity('Any');
    setDoshamPreference('Any');
    setRasiPreference('Any');
    setNakshatraPreference('Any');
  };

  const numAgeFrom = parseInt(ageFrom, 10);
  const numAgeTo = parseInt(ageTo, 10);
  const isAgeInvalid = !isNaN(numAgeFrom) && !isNaN(numAgeTo) && numAgeTo <= numAgeFrom;

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-gray-900 font-sans selection:bg-primary/20 flex flex-col">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-primary via-[#5e0018] to-primary text-white text-[11px] sm:text-xs py-2 px-3 sm:px-4 text-center font-medium border-b border-[#D4AF37]/30 flex items-center justify-center gap-1.5 leading-snug">
        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
        <span>
          {language === 'TA'
            ? 'மக்களுக்கு உதவும் உன்னத நோக்கில் தொடங்கப்பட்ட 100% முற்றிலும் இலவச மேட்ரிமோனி தளம் • எந்தவித கட்டணமும் இல்லை'
            : '100% Free Non-Profit Community Matrimonial Platform • Helping Families Connect With Zero Fees'}
        </span>
      </div>

      {/* 2. NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-primary/10 shadow-xs">
        <div className="max-w-6xl mx-auto px-2.5 sm:px-6 lg:px-8 h-14 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="inline-flex items-center gap-1.5 sm:gap-2 group shrink-0">
            <BrandLogo size="md" />
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Language Toggle */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/20 text-[11px] sm:text-xs font-bold text-primary transition-all cursor-pointer shrink-0 whitespace-nowrap"
              title="Switch Language"
            >
              <span>{language === 'TA' ? 'English' : 'தமிழ்'}</span>
            </button>

            {/* My Profile Dashboard Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsProfileDrawerOpen(true)}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/20 text-[11px] sm:text-xs md:text-sm font-bold text-primary transition-all shrink-0 whitespace-nowrap cursor-pointer hover:shadow-xs"
              title={language === 'TA' ? 'எனது சுயவிவரக் கணக்கு (வலப்புறம் திறக்கும்)' : 'My Profile Dashboard (Opens from right)'}
            >
              <User className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span>{language === 'TA' ? 'சுயவிவரக் கணக்கு' : 'My Profile'}</span>
            </button>

            {/* Free Register CTA */}
            <Link
              href="/register?new=true"
              className="bg-primary hover:bg-primary-light text-white px-2.5 sm:px-4 md:px-5 py-1.5 sm:py-2.5 rounded-full font-bold text-[11px] sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-1 sm:gap-1.5 hover:scale-[1.02] shrink-0 whitespace-nowrap"
            >
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 fill-white shrink-0" />
              <span>{language === 'TA' ? '+ புதிய வரன் பதிவு' : '+ Register Candidate'}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-14 sm:pt-16 sm:pb-28 bg-gradient-to-b from-[#FFFDF9] via-[#FAF6F0] to-[#FFFDF9]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-5">
            {/* Auspicious Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-primary/10 border border-[#D4AF37]/40 text-primary text-[11px] sm:text-sm font-bold shadow-xs leading-snug">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37] shrink-0" />
              <span>
                {language === 'TA'
                  ? 'மக்களுக்கு உதவும் 100% முற்றிலும் இலவச மேட்ரிமோனி சேவை'
                  : '100% Free Community Matrimonial Service to Help People'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-primary font-serif tracking-tight leading-snug sm:leading-tight max-w-2xl mx-auto px-1">
              {language === 'TA' ? (
                <>
                  உங்கள் இல்லறத்திற்கான <br className="hidden sm:inline" />
                  <span className="text-[#800020]">சிறந்த தமிழ் வரன்</span> இலவசமாக இணையுங்கள்
                </>
              ) : (
                <>
                  Find Your Ideal Life Partner with <br className="hidden sm:inline" />
                  <span className="text-[#800020]">100% Free Community Service</span>
                </>
              )}
            </h1>

            {/* Subheading */}
            <p className="text-xs sm:text-sm md:text-base text-gray-700 font-medium max-w-xl mx-auto leading-relaxed px-1">
              {language === 'TA'
                ? 'எந்தவித கட்டணமும் இன்றி, அனைத்து தமிழ் சமூக வரன்களையும் நேரடியாகவும் முற்றிலும் இலவசமாகவும் கண்டறியலாம்.'
                : 'A genuine non-profit community platform to help families connect directly, verify authentic profiles, and match horoscopes completely free across all Tamil communities.'}
            </p>

            {/* Hero CTA Button */}
            <div className="flex items-center justify-center pt-2 px-2">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-primary hover:bg-primary-light text-white px-5 sm:px-10 py-3 sm:py-4 rounded-full font-extrabold text-xs sm:text-base shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <span>{language === 'TA' ? 'இலவசமாக பதிவு செய்க' : 'Register Profile for Free'}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 sm:pt-6 grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] sm:text-xs font-bold text-gray-700">
              <div className="flex items-center justify-center gap-1.5 bg-white sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-gray-200/80 shadow-2xs sm:shadow-none min-h-[42px]">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                <span>{language === 'TA' ? '100% இலவசம் (₹0)' : 'Free Forever (₹0)'}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 bg-white sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-gray-200/80 shadow-2xs sm:shadow-none min-h-[42px]">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                <span>{language === 'TA' ? 'உறுதி செய்த வரன்' : '100% Verified'}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 bg-white sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-gray-200/80 shadow-2xs sm:shadow-none min-h-[42px]">
                <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37] shrink-0" />
                <span>{language === 'TA' ? 'சரியான வரன் பொருத்தம்' : 'Right Matching Partners'}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 bg-white sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-gray-200/80 shadow-2xs sm:shadow-none min-h-[42px]">
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
                <span>{language === 'TA' ? 'முழு தனியுரிமை' : 'Privacy Protected'}</span>
              </div>
            </div>
          </div>

          {/* Quick Search Widget - Premium Matrimonial Filter */}
          <div className="mt-8 sm:mt-12 max-w-5xl mx-auto bg-gradient-to-b from-white via-[#FFFDF9] to-[#FFFBF2] rounded-3xl p-4 sm:p-8 md:p-10 shadow-2xl border-2 border-[#D4AF37]/50 relative overflow-hidden">
            {/* Ambient Gold Glows */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-52 h-52 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-52 h-52 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header: Title + Premium Badge + Reset Button */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-5 mb-5 sm:mb-6 border-b border-primary/15 gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-primary text-[11px] font-black uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                  <span>{language === 'TA' ? 'பிரீமியம் வரன் வடிகட்டி' : 'Premium Match Filter'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-primary font-serif tracking-tight flex items-center gap-2">
                  <Search className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37] shrink-0" />
                  <span>{language === 'TA' ? 'விரைவு வரன் தேடல்' : 'Quick Match Finder'}</span>
                  <span className="text-xs sm:text-sm font-sans font-normal text-gray-500 hidden md:inline">
                    {language === 'TA' ? '(ஜாதகம், சமூகம் & இருப்பிடம்)' : '(Astrology, Community & Location)'}
                  </span>
                </h3>
              </div>

              {/* Reset Filters CTA */}
              <button
                type="button"
                onClick={handleResetFilters}
                className="self-start sm:self-center inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-600 hover:text-primary transition-all shadow-2xs group cursor-pointer"
                title={language === 'TA' ? 'அனைத்து வடிகட்டிகளையும் மீட்டமை' : 'Reset all filter selections'}
              >
                <RotateCcw className="w-3.5 h-3.5 text-gray-400 group-hover:rotate-180 transition-all duration-500" />
                <span>{language === 'TA' ? 'மீட்டமை' : 'Reset Filters'}</span>
              </button>
            </div>

            {/* 8 Premium Filter Cards Grid */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              
              {/* 1. Looking For */}
              <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-primary/15 hover:border-[#D4AF37] transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                    <Heart className="w-3.5 h-3.5 fill-rose-600" />
                  </div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wide">
                    {language === 'TA' ? 'நான் தேடுவது' : 'Looking For'}
                  </label>
                </div>
                <select
                  value={lookingFor}
                  onChange={(e) => setLookingFor(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-[#FFFDF9] text-gray-900 font-bold text-xs sm:text-sm focus:border-primary focus:bg-white focus:outline-none transition-all cursor-pointer"
                >
                  <option value="BRIDE">{language === 'TA' ? 'மணமகள் (Bride)' : 'Bride'}</option>
                  <option value="GROOM">{language === 'TA' ? 'மணமகன் (Groom)' : 'Groom'}</option>
                </select>
              </div>

              {/* 2. Age Limit with Real-Time Validation */}
              <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-primary/15 hover:border-[#D4AF37] transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <label className="text-xs font-black text-gray-700 uppercase tracking-wide">
                      {language === 'TA' ? 'வயது வரம்பு' : 'Age Limit'}
                    </label>
                  </div>
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${isAgeInvalid ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-primary/5 text-primary border border-primary/20'}`}>
                    {isAgeInvalid ? (language === 'TA' ? 'தவறு' : 'Invalid') : `${ageFrom} - ${ageTo} ${language === 'TA' ? 'வயது' : 'Yrs'}`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <select
                    value={ageFrom}
                    onChange={(e) => setAgeFrom(e.target.value)}
                    className={`w-full h-11 px-2.5 rounded-xl border text-gray-900 font-bold text-xs sm:text-sm focus:outline-none transition-all cursor-pointer ${
                      isAgeInvalid
                        ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                        : 'border-gray-200 bg-[#FFFDF9] focus:border-primary focus:bg-white'
                    }`}
                    aria-label={language === 'TA' ? 'குறைந்தபட்ச வயது' : 'Minimum Age'}
                  >
                    {AGE_OPTIONS.map((a) => (
                      <option key={a} value={a}>
                        {a} {language === 'TA' ? 'வயது' : 'Yrs'}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs font-bold text-gray-400 shrink-0">
                    {language === 'TA' ? 'முதல்' : 'to'}
                  </span>
                  <select
                    value={ageTo}
                    onChange={(e) => setAgeTo(e.target.value)}
                    className={`w-full h-11 px-2.5 rounded-xl border text-gray-900 font-bold text-xs sm:text-sm focus:outline-none transition-all cursor-pointer ${
                      isAgeInvalid
                        ? 'border-red-500 bg-red-50/50 text-red-900 focus:border-red-600'
                        : 'border-gray-200 bg-[#FFFDF9] focus:border-primary focus:bg-white'
                    }`}
                    aria-label={language === 'TA' ? 'அதிகபட்ச வயது' : 'Maximum Age'}
                  >
                    {AGE_OPTIONS.map((a) => (
                      <option key={a} value={a}>
                        {a} {language === 'TA' ? 'வயது' : 'Yrs'}
                      </option>
                    ))}
                  </select>
                </div>
                {isAgeInvalid && (
                  <p className="text-[10px] font-bold text-red-600 mt-1">
                    {language === 'TA' ? 'அதிகபட்ச வயது > குறைந்தபட்ச வயது' : 'Max age must be > min age'}
                  </p>
                )}
              </div>

              {/* 3. Community / Caste */}
              <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-primary/15 hover:border-[#D4AF37] transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wide">
                    {language === 'TA' ? 'சமூகம் / சாதி' : 'Community'}
                  </label>
                </div>
                <select
                  value={castePreference}
                  onChange={(e) => setCastePreference(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-[#FFFDF9] text-gray-900 font-bold text-xs sm:text-sm focus:border-primary focus:bg-white focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Any">{language === 'TA' ? 'அனைத்து சமூகம் (All Tamil)' : 'All Tamil Communities (Any)'}</option>
                  <option value="Kongu Vellalar Gounder">கொங்கு வேளாளர் கவுண்டர்</option>
                  <option value="Vanniyar">வன்னியர்</option>
                  <option value="Nadar">நாடார்</option>
                  <option value="Chettiar">செட்டியார்</option>
                  <option value="Mudaliar">முதலியார்</option>
                  <option value="Brahmin">பிராமணர்</option>
                  <option value="Pillai">பிள்ளை</option>
                  <option value="Thevar">தேவர் / முக்குலத்தோர்</option>
                  <option value="Naidu">நாயுடு</option>
                  <option value="Reddiar">ரெட்டியார்</option>
                  <option value="Viswakarma">விஸ்வகர்மா</option>
                  <option value="Yadav">யாதவர்</option>
                  <option value="AdiDravidar">ஆதி திராவிடர்</option>
                  <option value="Other">{language === 'TA' ? 'இதர தமிழ் சமூகம்' : 'Other Tamil Communities'}</option>
                </select>
              </div>

              {/* 4. Area / Location Filter */}
              <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-primary/15 hover:border-[#D4AF37] transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wide">
                    {language === 'TA' ? 'பகுதி / மாவட்டம்' : 'Area / District'}
                  </label>
                </div>
                <select
                  value={areaPreference}
                  onChange={(e) => setAreaPreference(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-[#FFFDF9] text-gray-900 font-bold text-xs sm:text-sm focus:border-primary focus:bg-white focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Any">{language === 'TA' ? 'அனைத்து பகுதிகள் (All TN / Any)' : 'All Districts / Any'}</option>
                  <option value="Coimbatore">கோயம்புத்தூர் (Coimbatore)</option>
                  <option value="Erode">ஈரோடு (Erode)</option>
                  <option value="Tirupur">திருப்பூர் (Tirupur)</option>
                  <option value="Salem">சேலம் (Salem)</option>
                  <option value="Namakkal">நாமக்கல் (Namakkal)</option>
                  <option value="Karur">கரூர் (Karur)</option>
                  <option value="Dindigul">திண்டுக்கல் (Dindigul)</option>
                  <option value="Madurai">மதுரை (Madurai)</option>
                  <option value="Trichy">திருச்சி (Trichy)</option>
                  <option value="Chennai">சென்னை (Chennai)</option>
                  <option value="Dharmapuri">தர்மபுரி / கிருஷ்ணகிரி</option>
                  <option value="Thanjavur">தஞ்சாவூர் / டெல்டா</option>
                  <option value="Tirunelveli">திருநெல்வேலி / தென் தமிழகம்</option>
                  <option value="Bangalore">பெங்களூர் / கர்நாடகா</option>
                  <option value="Abroad">வெளிநாடு (NRI / Abroad)</option>
                  <option value="Other">இதர பகுதிகள்</option>
                </select>
              </div>

              {/* 5. Financial Capacity in Plans Filter */}
              <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-primary/15 hover:border-[#D4AF37] transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                    <Building className="w-3.5 h-3.5" />
                  </div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wide">
                    {language === 'TA' ? 'பொருளாதார நிலை' : 'Financial Status'}
                  </label>
                </div>
                <select
                  value={financialCapacity}
                  onChange={(e) => setFinancialCapacity(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-[#FFFDF9] text-gray-900 font-bold text-xs sm:text-sm focus:border-primary focus:bg-white focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Any">{language === 'TA' ? 'அனைத்து நிலைகள் (Any Status)' : 'Any Status / Plan'}</option>
                  <option value="MIDDLE_CLASS">{language === 'TA' ? 'நடுத்தர குடும்பம் (Middle Class)' : 'Middle Class'}</option>
                  <option value="UPPER_MIDDLE_CLASS">{language === 'TA' ? 'உயர் நடுத்தர குடும்பம்' : 'Upper Middle Class'}</option>
                  <option value="RICH">{language === 'TA' ? 'வசதியான குடும்பம் (Rich)' : 'Rich / Well Settled'}</option>
                  <option value="AFFLUENT">{language === 'TA' ? 'பெரும் செல்வந்தர் (VIP)' : 'Affluent / VIP'}</option>
                  <option value="ASSETS_50L_1CR">{language === 'TA' ? 'சொத்து: ரூ. 50L - 1 கோடி' : 'Assets: ₹50L - ₹1 Cr'}</option>
                  <option value="ASSETS_1CR_3CR">{language === 'TA' ? 'சொத்து: ரூ. 1 - 3 கோடி' : 'Assets: ₹1 - ₹3 Cr'}</option>
                  <option value="ASSETS_3CR_PLUS">{language === 'TA' ? 'சொத்து: ரூ. 3+ கோடி' : 'Assets: ₹3+ Cr'}</option>
                </select>
              </div>

              {/* 6. Sutham or Ragu Kethu / Dosham Filter */}
              <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-primary/15 hover:border-[#D4AF37] transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-[#D4AF37]/20 text-primary flex items-center justify-center shrink-0 border border-[#D4AF37]/40">
                    <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
                  </div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wide">
                    {language === 'TA' ? 'சுத்தம் / ராகு கேது' : 'Dosham Filter'}
                  </label>
                </div>
                <select
                  value={doshamPreference}
                  onChange={(e) => setDoshamPreference(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-[#FFFDF9] text-gray-900 font-bold text-xs sm:text-sm focus:border-primary focus:bg-white focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Any">{language === 'TA' ? 'அனைத்து ஜாதகம் (Any Horoscope)' : 'Any Horoscope'}</option>
                  <option value="SUTHAM">{language === 'TA' ? 'சுத்த ஜாதகம் (தோஷமில்லை)' : 'Sutham (No Dosham)'}</option>
                  <option value="RAGU_KETHU">{language === 'TA' ? 'ராகு - கேது தோஷம்' : 'Ragu Kethu Dosham'}</option>
                  <option value="SEVVAI">{language === 'TA' ? 'செவ்வாய் தோஷம்' : 'Sevvai Dosham'}</option>
                  <option value="SEVVAI_RAGU_KETHU">{language === 'TA' ? 'செவ்வாய் & ராகு-கேது' : 'Sevvai & Ragu Kethu'}</option>
                </select>
              </div>

              {/* 7. Raasi (Zodiac Sign) Filter */}
              <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-primary/15 hover:border-[#D4AF37] transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-200">
                    <Moon className="w-3.5 h-3.5" />
                  </div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wide">
                    {language === 'TA' ? 'ராசி (Raasi)' : 'Raasi (Zodiac)'}
                  </label>
                </div>
                <select
                  value={rasiPreference}
                  onChange={handleRasiChange}
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-[#FFFDF9] text-gray-900 font-bold text-xs sm:text-sm focus:border-primary focus:bg-white focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Any">{language === 'TA' ? 'அனைத்து ராசி (Any Raasi)' : 'All Zodiac Signs (Any)'}</option>
                  {rasiOptions.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.ta} ({r.en})
                    </option>
                  ))}
                </select>
              </div>

              {/* 8. Nakshatram (Birth Star) Filter */}
              <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-primary/15 hover:border-[#D4AF37] transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-300">
                    <Star className="w-3.5 h-3.5 fill-amber-500/20" />
                  </div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wide">
                    {language === 'TA' ? 'நட்சத்திரம் (Star)' : 'Nakshatram (Star)'}
                  </label>
                </div>
                <select
                  value={nakshatraPreference}
                  onChange={(e) => setNakshatraPreference(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-[#FFFDF9] text-gray-900 font-bold text-xs sm:text-sm focus:border-primary focus:bg-white focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Any">
                    {rasiPreference !== 'Any'
                      ? (language === 'TA' ? `${rasiPreference} - அனைத்து நட்சத்திரங்கள்` : `All ${rasiPreference} Stars`)
                      : (language === 'TA' ? 'அனைத்து நட்சத்திரம் (Any)' : 'All Stars (Any)')}
                  </option>
                  {availableNakshatras.map((n, nIdx) => (
                    <option key={`${n.value}-${nIdx}`} value={n.value}>
                      {n.ta} ({n.en})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Criteria Preview Bar */}
            <div className="relative z-10 mt-4 sm:mt-5 p-2.5 sm:p-3 rounded-xl bg-white/80 border border-[#D4AF37]/30 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-gray-600 flex-wrap font-medium">
                <span className="font-bold text-primary flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'TA' ? 'தேர்வு:' : 'Active:'}</span>
                </span>
                <span className="bg-primary/5 text-primary px-2 py-0.5 rounded-md font-bold">
                  {lookingFor === 'BRIDE' ? (language === 'TA' ? 'மணமகள்' : 'Bride') : (language === 'TA' ? 'மணமகன்' : 'Groom')}
                </span>
                <span>•</span>
                <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md font-bold">
                  {ageFrom} - {ageTo} {language === 'TA' ? 'வயது' : 'Yrs'}
                </span>
                {castePreference !== 'Any' && (
                  <>
                    <span>•</span>
                    <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md font-bold">{castePreference}</span>
                  </>
                )}
                {areaPreference !== 'Any' && (
                  <>
                    <span>•</span>
                    <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-bold">{areaPreference}</span>
                  </>
                )}
                {rasiPreference !== 'Any' && (
                  <>
                    <span>•</span>
                    <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-md font-bold">ராசி: {rasiPreference}</span>
                  </>
                )}
                {nakshatraPreference !== 'Any' && (
                  <>
                    <span>•</span>
                    <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md font-bold">நட்சத்திரம்: {nakshatraPreference}</span>
                  </>
                )}
              </div>

              <span className="text-[11px] font-bold text-[#800020] uppercase tracking-wider">
                100% Free Lifetime
              </span>
            </div>

            {/* Search Matches CTA Button */}
            <div className="relative z-10 pt-4 sm:pt-5">
              {isAgeInvalid ? (
                <button
                  type="button"
                  disabled
                  className="w-full h-13 sm:h-14 bg-gray-200 text-gray-400 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 cursor-not-allowed border border-gray-300 select-none transition-all"
                  title={
                    language === 'TA'
                      ? 'அதிகபட்ச வயது குறைந்தபட்ச வயதை விட அதிகமாக இருக்க வேண்டும்'
                      : 'Max age should be higher than minimum age'
                  }
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  <span>{language === 'TA' ? 'பொருத்தமான வரன்களைக் காண்க' : 'Search Matching Profiles'}</span>
                </button>
              ) : (
                <Link
                  href={`/register?lookingFor=${lookingFor}&minAge=${ageFrom}&maxAge=${ageTo}&caste=${encodeURIComponent(castePreference)}&area=${encodeURIComponent(areaPreference)}&financial=${encodeURIComponent(financialCapacity)}&dosham=${encodeURIComponent(doshamPreference)}&rasi=${encodeURIComponent(rasiPreference)}&nakshatra=${encodeURIComponent(nakshatraPreference)}`}
                  className="w-full h-13 sm:h-14 bg-gradient-to-r from-primary via-[#950026] to-primary hover:from-primary-light hover:to-primary text-white rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.01] cursor-pointer border-2 border-[#D4AF37]/50"
                >
                  <Search className="w-5 h-5 text-[#D4AF37]" />
                  <span>{language === 'TA' ? 'பொருத்தமான வரன்களைக் காண்க' : 'Find Matching Profiles'}</span>
                  <ArrowRight className="w-5 h-5 text-white" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-12 sm:py-20 bg-white border-y border-primary/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">
              {language === 'TA' ? 'எளிய 3 படிகள்' : 'Simple 3-Step Process'}
            </span>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-primary font-serif mt-1">
              {language === 'TA' ? 'எப்படி செயல்படுகிறது நம்ம மேட்ரிமோனி?' : 'How Namma Matrimony Works'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              {language === 'TA'
                ? 'மக்களுக்கு உதவும் நோக்கில் முற்றிலும் இலவசமாக வடிவமைக்கப்பட்ட நேரடி வரன் தேடல்'
                : 'A transparent community initiative to connect families with zero subscription fees or charges'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            <div className="bg-[#FFFDF9] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/15 hover:shadow-lg transition-all text-center space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 border-2 border-primary/20 text-primary flex items-center justify-center font-black text-lg sm:text-xl mx-auto">
                1
              </div>
              <h3 className="text-base sm:text-lg font-bold text-primary font-serif">
                {language === 'TA' ? '1. இலவச சுயவிவர பதிவு' : '1. Free Registration'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {language === 'TA'
                  ? 'உங்கள் அடிப்படை விவரங்கள், குலம், கல்வி, பணி மற்றும் ஜாதகக் கட்டங்களை 4 எளிய படிகளில் கட்டணமின்றி பதிவு செய்யவும்.'
                  : 'Submit your personal details, community, career, and South Indian 12-house astrology chart with zero charges.'}
              </p>
            </div>

            <div className="bg-[#FFFDF9] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/15 hover:shadow-lg transition-all text-center space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#D4AF37]/20 border-2 border-[#D4AF37] text-primary flex items-center justify-center font-black text-lg sm:text-xl mx-auto">
                2
              </div>
              <h3 className="text-base sm:text-lg font-bold text-primary font-serif">
                {language === 'TA' ? '2. சரிபார்த்தல் & வரன் பொருத்தம்' : '2. Verify & Match'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {language === 'TA'
                  ? 'உண்மையான சுயவிவரங்கள் சரிபார்க்கப்பட்டு, சரியான பொருந்தும் வரன்களை தேர்ந்தெடுக்கலாம்.'
                  : 'Profiles are verified so you can choose the right matching partners.'}
              </p>
            </div>

            <div className="bg-[#FFFDF9] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/15 hover:shadow-lg transition-all text-center space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100 border-2 border-emerald-300 text-emerald-700 flex items-center justify-center font-black text-lg sm:text-xl mx-auto">
                3
              </div>
              <h3 className="text-base sm:text-lg font-bold text-primary font-serif">
                {language === 'TA' ? '3. குடும்பத்தினர் நேரடி தொடர்பு' : '3. Direct Family Connect'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {language === 'TA'
                  ? 'எந்தவித மறைமுகக் கட்டணங்களும் இன்றி நேரடியாக குடும்பத்தினருடன் பேசி சுபமாக திருமணத்தை முடிவு செய்யலாம்.'
                  : 'Speak directly with prospective families with complete transparency and zero commission charges.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. KEY ADVANTAGES */}
      <section id="features" className="py-12 sm:py-20 bg-[#FFFDF9]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">
              {language === 'TA' ? 'நமது சிறப்பம்சங்கள்' : 'Key Advantages'}
            </span>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-primary font-serif mt-1">
              {language === 'TA' ? 'ஏன் நம்ம மேட்ரிமோனியை தேர்ந்தெடுக்க வேண்டும்?' : 'Why Choose Namma Matrimony'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {BRANDING.features.map((feat, idx) => (
              <div key={idx} className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-primary/15 shadow-sm hover:shadow-md transition-all space-y-2.5 sm:space-y-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  {idx === 0 && <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />}
                  {idx === 1 && <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37]" />}
                  {idx === 2 && <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37]" />}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-primary font-serif">
                  {language === 'TA' ? feat.titleTa : feat.titleEn}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {language === 'TA' ? feat.descTa : feat.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 100% FREE COMMUNITY SERVICE INITIATIVE BANNER */}
      <section id="about-service" className="py-12 sm:py-16 bg-white border-t border-primary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary via-primary-light to-[#580016] text-white p-5 sm:p-10 md:p-12 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-[#D4AF37]/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-[#D4AF37]/20 rounded-full blur-2xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#D4AF37]/25 text-[#F3E5AB] text-xs font-bold border border-[#D4AF37]/40">
                  <Heart className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                  <span>{language === 'TA' ? 'மக்கள் சேவை மனப்பான்மை' : 'Pure Social Service'}</span>
                </div>
                <h3 className="text-xl sm:text-3xl md:text-4xl font-serif font-black tracking-tight text-white leading-tight">
                  {language === 'TA' ? '100% முற்றிலும் இலவச சேவை' : '100% Free Lifetime Service'}
                </h3>
                <p className="text-xs sm:text-sm text-rose-100/90 max-w-md leading-relaxed">
                  {language === 'TA'
                    ? 'மக்களுக்கு உதவும் உன்னத நோக்கில் அனைத்து வரன் பதிவுகளும், தொடர்புகளும், வரன் பொருத்தங்களும் எப்போதும் இலவசம்.'
                    : 'Created solely to help families find suitable life partners without financial burden or commercial motives.'}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 sm:p-6 rounded-2xl text-center shrink-0 w-full md:w-auto">
                <span className="text-[11px] sm:text-xs text-rose-200 uppercase tracking-widest font-bold">Registration Cost</span>
                <div className="text-3xl sm:text-5xl font-extrabold text-[#D4AF37] font-serif my-1">
                  ₹0
                </div>
                <span className="text-[11px] text-white/90 block mb-3 sm:mb-4">
                  {language === 'TA' ? 'எப்போதும் இலவசம்' : 'Free for Everyone'}
                </span>
                <Link
                  href="/register"
                  className="w-full bg-[#D4AF37] hover:bg-[#c49f2e] text-gray-900 font-extrabold text-xs sm:text-sm py-3 px-6 rounded-full shadow-lg block transition-all hover:scale-105 text-center"
                >
                  {language === 'TA' ? 'இலவசமாக பதிவு செய்க' : 'Register Free Now'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CLEAN COMMUNITY FOOTER (NO CONTACT DETAILS) */}
      <footer className="mt-auto bg-white border-t border-primary/10 py-8 sm:py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex justify-center">
            <BrandLogo size="md" />
          </div>

          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed px-2">
            {language === 'TA'
              ? `${BRANDING.taglineTamil} • ${BRANDING.subTaglineTamil}`
              : `${BRANDING.tagline} • ${BRANDING.subTagline}`}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-6 gap-y-2 text-xs font-semibold text-gray-500 pt-2 px-2">
            <a href="#how-it-works" className="hover:text-primary transition-colors">
              {language === 'TA' ? 'எப்படி செயல்படுகிறது' : 'How It Works'}
            </a>
            <span className="hidden sm:inline text-gray-300">•</span>
            <a href="#features" className="hover:text-primary transition-colors">
              {language === 'TA' ? 'சிறப்பம்சங்கள்' : 'Features'}
            </a>
            <span className="hidden sm:inline text-gray-300">•</span>
            <Link href="/register" className="text-primary font-bold hover:underline">
              {language === 'TA' ? 'இலவச பதிவு' : 'Free Registration'}
            </Link>
            <span className="hidden sm:inline text-gray-300">•</span>
            <button
              type="button"
              onClick={() => setIsProfileDrawerOpen(true)}
              className="text-primary font-bold hover:underline cursor-pointer"
            >
              {language === 'TA' ? 'எனது சுயவிவரம் (பயோடேட்டா)' : 'My Profile / Biodata'}
            </button>
            <span className="hidden sm:inline text-gray-300">•</span>
            <Link href="/admin" className="text-gray-400 hover:text-primary transition-colors">
              {language === 'TA' ? 'நிர்வாக பலகை' : 'Admin Console'}
            </Link>
          </div>

          <div className="pt-4 sm:pt-6 border-t border-gray-100 text-xs text-gray-400 px-2 leading-relaxed">
            <p>
              © {new Date().getFullYear()} {BRANDING.brandName}.{' '}
              {language === 'TA'
                ? 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை • 100% இலவச மக்கள் சேவை.'
                : 'All rights reserved • 100% Free Community Service.'}
            </p>
          </div>
        </div>
      </footer>

      {/* Slide-over Profile Drawer from the Right */}
      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
      />
    </div>
  );
}