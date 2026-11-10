'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/frontend/context/LanguageContext';
import { BRANDING } from '@/constants/branding';
import BrandLogo from '../BrandLogo';
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
  AlertCircle,
} from 'lucide-react';

const AGE_OPTIONS = Array.from({ length: 55 - 18 + 1 }, (_, i) => 18 + i);

export default function LandingPage() {
  const { language, toggleLanguage } = useLanguage();

  const [lookingFor, setLookingFor] = useState('BRIDE');
  const [ageFrom, setAgeFrom] = useState('21');
  const [ageTo, setAgeTo] = useState('29');
  const [castePreference, setCastePreference] = useState('Any');

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

          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-semibold text-gray-700 shrink-0">
            <a href="#how-it-works" className="hover:text-primary transition-colors whitespace-nowrap">
              {language === 'TA' ? 'எப்படி செயல்படுகிறது' : 'How It Works'}
            </a>
            <a href="#features" className="hover:text-primary transition-colors whitespace-nowrap">
              {language === 'TA' ? 'சிறப்பம்சங்கள்' : 'Features'}
            </a>
            <a href="#about-service" className="hover:text-primary transition-colors whitespace-nowrap">
              {language === 'TA' ? 'இலவச சேவை' : 'About Service'}
            </a>
          </nav>

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

            {/* My Profile Dashboard Link */}
            <Link
              href="/profile"
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/20 text-[11px] sm:text-xs md:text-sm font-bold text-primary transition-all shrink-0 whitespace-nowrap"
              title="View Registered Profiles Dashboard"
            >
              <User className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span>{language === 'TA' ? 'சுயவிவரக் கணக்கு' : 'My Profile'}</span>
            </Link>

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
                <span>{language === 'TA' ? '10 பொருத்தம்' : '10 Porutham Chart'}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 bg-white sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-gray-200/80 shadow-2xs sm:shadow-none min-h-[42px]">
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
                <span>{language === 'TA' ? 'முழு தனியுரிமை' : 'Privacy Protected'}</span>
              </div>
            </div>
          </div>

          {/* Quick Search Widget */}
          <div className="mt-8 sm:mt-12 max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-lg sm:shadow-xl border-2 border-[#D4AF37]/40 relative">
            <div className="flex items-center gap-2 mb-4 sm:mb-6 border-b border-primary/10 pb-3 sm:pb-4">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
              <h3 className="text-sm sm:text-lg font-black text-primary font-serif">
                {language === 'TA' ? 'விரைவு வரன் தேடல் (Quick Match Finder)' : 'Find Your Compatible Partner'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">
                  {language === 'TA' ? 'நான் தேடுவது' : 'Looking For'}
                </label>
                <select
                  value={lookingFor}
                  onChange={(e) => setLookingFor(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-semibold text-xs sm:text-sm focus:border-primary focus:outline-none"
                >
                  <option value="BRIDE">{language === 'TA' ? 'மணமகள் (Bride)' : 'Bride'}</option>
                  <option value="GROOM">{language === 'TA' ? 'மணமகன் (Groom)' : 'Groom'}</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-600">
                    {language === 'TA' ? 'வயது வரம்பு' : 'Age Limit'}
                  </label>
                  <span className={`text-[11px] font-bold ${isAgeInvalid ? 'text-red-600' : 'text-[#800020]'}`}>
                    {isAgeInvalid
                      ? (language === 'TA' ? 'தவறான வரம்பு' : 'Invalid Range')
                      : `${ageFrom} - ${ageTo} ${language === 'TA' ? 'வயது' : 'Yrs'}`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <select
                    value={ageFrom}
                    onChange={(e) => setAgeFrom(e.target.value)}
                    className={`w-full h-11 px-2.5 rounded-xl border text-gray-900 font-semibold text-xs sm:text-sm focus:outline-none transition-all ${
                      isAgeInvalid
                        ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                        : 'border-gray-300 bg-[#FFFDF9] focus:border-primary'
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
                    className={`w-full h-11 px-2.5 rounded-xl border text-gray-900 font-semibold text-xs sm:text-sm focus:outline-none transition-all ${
                      isAgeInvalid
                        ? 'border-red-500 bg-red-50/50 text-red-900 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                        : 'border-gray-300 bg-[#FFFDF9] focus:border-primary'
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
                  <div className="flex items-start gap-1 text-[11px] font-bold text-red-600 mt-1.5 bg-red-50 p-1.5 rounded-lg border border-red-200 animate-in fade-in leading-tight">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                    <span>
                      {language === 'TA'
                        ? `அதிகபட்ச வயது (${ageTo}) குறைந்தபட்ச வயதை (${ageFrom}) விட அதிகமாக இருக்க வேண்டும்.`
                        : `Max age (${ageTo}) should be higher than minimum age (${ageFrom}).`}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">
                  {language === 'TA' ? 'சமூகம் / சாதி' : 'Community'}
                </label>
                <select
                  value={castePreference}
                  onChange={(e) => setCastePreference(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-semibold text-xs sm:text-sm focus:border-primary focus:outline-none"
                >
                  <option value="Any">{language === 'TA' ? 'அனைத்து தமிழ் சமூகம் (All Tamil Communities)' : 'All Tamil Communities (Any)'}</option>
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
                  <option value="Other">{language === 'TA' ? 'இதர தமிழ் சமூகங்கள் (Other)' : 'Other Tamil Communities'}</option>
                </select>
              </div>

              <div className="flex items-end">
                {isAgeInvalid ? (
                  <button
                    type="button"
                    disabled
                    className="w-full h-11 bg-gray-200 text-gray-400 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-gray-300 select-none transition-all"
                    title={
                      language === 'TA'
                        ? 'அதிகபட்ச வயது குறைந்தபட்ச வயதை விட அதிகமாக இருக்க வேண்டும்'
                        : 'Max age should be higher than minimum age'
                    }
                  >
                    <Search className="w-4 h-4 text-gray-400" />
                    <span>{language === 'TA' ? 'வரன்களை காண்க' : 'Search Matches'}</span>
                  </button>
                ) : (
                  <Link
                    href={`/register?lookingFor=${lookingFor}&minAge=${ageFrom}&maxAge=${ageTo}&caste=${encodeURIComponent(castePreference)}`}
                    className="w-full h-11 bg-primary hover:bg-primary-light text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all hover:scale-[1.01] cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>{language === 'TA' ? 'வரன்களை காண்க' : 'Search Matches'}</span>
                  </Link>
                )}
              </div>
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
                  : 'Submit your personal details, Kongu Koottam, career, and South Indian 12-house astrology chart with zero charges.'}
              </p>
            </div>

            <div className="bg-[#FFFDF9] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/15 hover:shadow-lg transition-all text-center space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#D4AF37]/20 border-2 border-[#D4AF37] text-primary flex items-center justify-center font-black text-lg sm:text-xl mx-auto">
                2
              </div>
              <h3 className="text-base sm:text-lg font-bold text-primary font-serif">
                {language === 'TA' ? '2. சரிபார்த்தல் & ஜாதக பொருத்தம்' : '2. Verify & Match'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {language === 'TA'
                  ? 'உண்மையான சுயவிவரங்கள் சரிபார்க்கப்பட்டு, 10 பொருத்தங்களுடன் கூடிய வரன்கள் தேர்ந்தெடுக்கப்படும்.'
                  : 'Profiles are verified to ensure authentic matches with traditional 10-Porutham compatibility.'}
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
                  ? 'தரகர்கள் இன்றி, எந்தவித மறைமுகக் கட்டணங்களும் இன்றி நேரடியாக குடும்பத்தினருடன் பேசி சுபமாக திருமணத்தை முடிவு செய்யலாம்.'
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {BRANDING.features.map((feat, idx) => (
              <div key={idx} className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-primary/15 shadow-sm hover:shadow-md transition-all space-y-2.5 sm:space-y-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  {idx === 0 && <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />}
                  {idx === 1 && <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37]" />}
                  {idx === 2 && <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37]" />}
                  {idx === 3 && <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37]" />}
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
                    ? 'மக்களுக்கு உதவும் உன்னத நோக்கில் அனைத்து வரன் பதிவுகளும், தொடர்புகளும், ஜாதகப் பொருத்தங்களும் எப்போதும் இலவசம்.'
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
            <Link href="/profile" className="text-primary font-bold hover:underline">
              {language === 'TA' ? 'எனது சுயவிவரம் (பயோடேட்டா)' : 'My Profile / Biodata'}
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
    </div>
  );
}