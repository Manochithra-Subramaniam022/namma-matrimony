'use client';

import React, { useState } from 'react';
import {
  Printer,
  Share2,
  Edit3,
  Home,
  CheckCircle2,
  ShieldCheck,
  Heart,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Clock,
  Sparkles,
  Phone,
  Mail,
  Home as HomeIcon,
  FileText,
  User,
  Eye,
  ExternalLink,
  Lock,
  Layers,
  Award,
  ChevronRight,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import BrandLogo from '@/frontend/components/BrandLogo';
import { BRANDING } from '@/constants/branding';

interface AkshayamProfileViewProps {
  profile: any;
  onEdit?: () => void;
  onDelete?: () => void;
  onBack?: () => void;
  language?: 'TA' | 'EN';
}

export default function AkshayamProfileView({
  profile,
  onEdit,
  onDelete,
  onBack,
  language = 'TA',
}: AkshayamProfileViewProps) {
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Derived Values
  const displayId = profile?.registrationId || profile?.displayId || profile?.refId || 'NM-0001';
  const fullName = profile?.fullName || profile?.name || 'பெயர் குறிப்பிடப்படவில்லை';
  const gender = profile?.gender === 'FEMALE' ? 'மணமகள் (Bride)' : 'மணமகன் (Groom)';
  
  // Calculate Age
  const calculateAge = (dobString?: string) => {
    if (!dobString) return null;
    const bDate = new Date(dobString);
    if (isNaN(bDate.getTime())) return null;
    const diff = Date.now() - bDate.getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };
  const age = calculateAge(profile?.dob) || profile?.age;

  // Format Height
  const formatHeight = (cm?: number) => {
    if (!cm) return null;
    const totalInches = Math.round(cm / 2.54);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${cm} cm (${feet} ft ${inches} in)`;
  };
  const heightDisplay = formatHeight(profile?.heightCm || profile?.height);

  // Clean Date of Birth (No raw ISO timestamp like T00:00:00)
  const formatCleanDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const clean = String(dateStr).split('T')[0].trim();
    const parts = clean.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return clean;
  };
  const cleanDob = formatCleanDate(profile?.dob);

  // Clean Marital Status (No raw enum strings like NEVER_MARRIED)
  const formatMaritalStatus = (status?: string) => {
    if (!status) return language === 'TA' ? 'திருமணமாகாதவர்' : 'Unmarried';
    const s = String(status).toUpperCase().trim();
    if (s.includes('NEVER') || s.includes('UNMARRIED')) {
      return language === 'TA' ? 'திருமணமாகாதவர் (Unmarried)' : 'Never Married';
    }
    if (s.includes('DIVORCE')) {
      return language === 'TA' ? 'விவாகரத்து (Divorced)' : 'Divorced';
    }
    if (s.includes('WIDOW')) {
      return language === 'TA' ? 'விதவை / விதவர் (Widowed)' : 'Widowed';
    }
    if (s.includes('AWAITING')) {
      return language === 'TA' ? 'விவாகரத்து எதிர்பார்ப்பு' : 'Awaiting Divorce';
    }
    return status;
  };
  const cleanMaritalStatus = formatMaritalStatus(profile?.maritalStatus);

  // Format WhatsApp Share Message
  const handleShareWhatsApp = () => {
    const summary = `*${BRANDING.brandNameTamil} - வரன் சுயவிவரம் (Biodata)*
------------------------------------
*பதிவு எண் (ID):* ${displayId}
*பெயர்:* ${fullName}
*பாலினம்:* ${gender}
*வயது & உயரம்:* ${age ? `${age} வயது` : ''} ${heightDisplay ? `• ${heightDisplay}` : ''}
*சமூகம் & குலம்:* ${profile?.caste || 'தமிழ் சமூகம்'} ${profile?.koottam || profile?.kootam ? `(${profile.koottam || profile.kootam})` : ''}
*ராசி & நட்சத்திரம்:* ${profile?.rasi || '-'} • ${profile?.nakshatram || '-'}
*கல்வி:* ${profile?.educationList?.[0]?.degree || profile?.education || '-'}
*பணி & ஊர்:* ${profile?.designation || profile?.workNature || '-'} ${profile?.workCity ? `(${profile.workCity})` : ''}
*சொந்த ஊர்:* ${profile?.city || '-'}
------------------------------------
100% இலவச மேட்ரிமோனி தளம்: ${typeof window !== 'undefined' ? window.location.origin : ''}`;

    const url = `https://wa.me/?text=${encodeURIComponent(summary)}`;
    window.open(url, '_blank');
  };

  const handleCopySummary = () => {
    const text = `Namma Matrimony Profile: ${displayId} | ${fullName} | ${profile?.caste || 'Kongu Vellalar'} | ${age} Yrs | ${profile?.city || 'Tamil Nadu'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-4 sm:py-8 px-2 sm:px-4 lg:px-8 font-sans selection:bg-primary/20 print:p-0 print:bg-white">
      
      {/* Print-specific style adjustments */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-full {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>

      {/* Main Container Card in Traditional Royal Burgundy & Ornate Gold */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-xl border-2 border-[#D4AF37]/50 overflow-hidden relative print:border-none print:shadow-none print-full">
        
        {/* Top Gold & Maroon Traditional Header Border */}
        <div className="h-3 w-full bg-gradient-to-r from-primary via-[#D4AF37] to-primary"></div>

        {/* 1. TOP ACTION TOOLBAR (Hidden in Print) */}
        <div className="no-print bg-[#FFFDF9] border-b border-primary/10 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 shadow-xs">
          {onBack && (
            <button
              onClick={onBack}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all cursor-pointer border border-primary/20 shrink-0"
              title={language === 'TA' ? 'பட்டியலுக்குத் திரும்பு' : 'Back to List'}
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span>{language === 'TA' ? 'பின்செல்க' : 'Back'}</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary-light transition-all cursor-pointer"
              title="Print Biodata"
            >
              <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">{language === 'TA' ? 'அச்சிடு' : 'Print'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 transition-all cursor-pointer"
              title="Share via WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {onEdit && (
              <button
                onClick={onEdit}
                type="button"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all cursor-pointer"
                title="Edit Details"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{language === 'TA' ? 'திருத்து' : 'Edit'}</span>
              </button>
            )}

            {onDelete && (
              <button
                onClick={onDelete}
                type="button"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
                title="Delete Profile"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>{language === 'TA' ? 'நீக்கு' : 'Delete'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. TRADITIONAL AUSPICIOUS HEADER BANNER */}
        <div className="bg-gradient-to-b from-[#580016] to-primary text-white p-3.5 sm:p-5 text-center relative overflow-hidden border-b-2 border-[#D4AF37]">
          {/* Sacred Invocations - Clean without unwanted symbols or pipes */}
          <div className="text-[11px] sm:text-xs font-serif font-bold text-[#F3E5AB] tracking-wide mb-1 flex items-center justify-center gap-2">
            <span>ஸ்ரீ விநாயகர் துணை</span>
            <span className="text-[#D4AF37]">•</span>
            <span>வாழ்க வளமுடன்</span>
            <span className="text-[#D4AF37]">•</span>
            <span>ஸ்ரீ குலதெய்வம் துணை</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-0.5">
            <h1 className="text-lg sm:text-2xl font-serif font-black text-white tracking-tight">
              {BRANDING.brandNameTamil}
            </h1>
            <span className="text-[#D4AF37] font-serif text-sm hidden sm:inline">•</span>
            <span className="text-xs sm:text-base font-bold text-amber-200 font-serif">
              {BRANDING.brandName}
            </span>
          </div>

          <p className="text-[10px] sm:text-xs text-rose-100/90 font-medium max-w-lg mx-auto">
            {language === 'TA'
              ? 'மக்களுக்கு உதவும் 100% முற்றிலும் இலவச திருமண தகவல் மையம்'
              : '100% Free Public Community Matrimonial Service'}
          </p>

          {/* ID & Verification Badge */}
          <div className="mt-2 inline-flex items-center gap-2 bg-black/25 px-3 py-1 rounded-full border border-[#D4AF37]/50 shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              {language === 'TA' ? 'பதிவு எண்' : 'ID'}:
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-[#D4AF37]">
              {displayId}
            </span>
            <span className="text-white/30">•</span>
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-300 font-bold">
              <CheckCircle2 className="w-3 h-3" /> சரிபார்க்கப்பட்டது
            </span>
          </div>
        </div>

        {/* 3. HERO CANDIDATE OVERVIEW CARD */}
        <div className="p-4 sm:p-6 bg-[#FFFDF9] border-b border-primary/10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            
            {/* Candidate Photograph */}
            <div className="shrink-0 text-center">
              <div
                className="relative w-32 h-40 sm:w-40 sm:h-48 rounded-2xl overflow-hidden border-3 border-[#D4AF37] shadow-md bg-gray-100 group cursor-pointer"
                onClick={() => profile?.photoUrl && setPhotoModalOpen(true)}
              >
                {profile?.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt={fullName}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-primary/5 text-primary p-3">
                    <User className="w-12 h-12 sm:w-14 sm:h-14 text-[#D4AF37] mb-1.5" />
                    <span className="text-[11px] font-bold text-gray-500">புகைப்படம் இணைக்கப்படவில்லை</span>
                    <span className="text-[9px] text-gray-400 mt-0.5">(Photo Protected)</span>
                  </div>
                )}

                {profile?.photoUrl && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 no-print">
                    <Eye className="w-4 h-4" /> பெரிதாக்குக
                  </div>
                )}

                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1 text-center">
                  <span className="text-[10px] text-white/90 font-bold tracking-wide">
                    {displayId}
                  </span>
                </div>
              </div>

              <div className="mt-1.5 text-center">
                <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  ✓ சரிபார்க்கப்பட்டது
                </span>
              </div>
            </div>

            {/* Candidate Highlights */}
            <div className="flex-1 text-center sm:text-left space-y-2 sm:space-y-2.5 min-w-0">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-1">
                  <span>{gender}</span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-primary tracking-tight break-words">
                  {fullName}
                </h2>
              </div>

              {/* Quick Summary Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-xs font-bold text-gray-700">
                {age && (
                  <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-xl shadow-2xs">
                    🎂 {age} வயது {cleanDob ? `• (${cleanDob})` : ''}
                  </span>
                )}
                {heightDisplay && (
                  <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-xl shadow-2xs">
                    📏 {heightDisplay}
                  </span>
                )}
                <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-xl shadow-2xs">
                  💍 {cleanMaritalStatus}
                </span>
              </div>

              {/* Community & Koottam Highlights */}
              <div className="bg-white border-2 border-primary/15 rounded-xl p-3 text-xs sm:text-sm space-y-1 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary shrink-0">சமூகம் & குலம்:</span>
                  <span className="font-extrabold text-gray-900">
                    {profile?.caste || 'தமிழ் சமூகம்'}
                    {profile?.subCaste ? ` • ${profile.subCaste}` : ''}
                  </span>
                </div>
                {(profile?.koottam || profile?.kootam || profile?.customKoottam) && (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary shrink-0">கூட்டம்:</span>
                    <span className="font-black text-[#D4AF37] bg-primary/5 px-2 py-0.5 rounded-md">
                      {profile?.koottam || profile?.kootam || profile?.customKoottam}
                    </span>
                  </div>
                )}
                {profile?.kuladeivam && (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary shrink-0">குலதெய்வம்:</span>
                    <span className="font-bold text-gray-800">{profile.kuladeivam}</span>
                  </div>
                )}
              </div>

              {/* Education & Profession Snippet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-gray-700 bg-white p-2 rounded-lg border border-gray-100">
                  <GraduationCap className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate font-semibold">
                    {profile?.educationList?.[0]?.degree || profile?.education || 'Degree not specified'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 bg-white p-2 rounded-lg border border-gray-100">
                  <Briefcase className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate font-semibold">
                    {profile?.designation || profile?.workNature || 'Employed'} {profile?.annualIncome ? `(${profile.annualIncome})` : ''}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 4. STRUCTURED SECTIONS */}
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          
          {/* SECTION 1: PERSONAL & PHYSICAL DETAILS */}
          <div className="bg-white rounded-2xl border border-primary/20 shadow-xs overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary-light text-white px-4 py-2.5 sm:px-6 sm:py-3 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-serif font-black flex items-center gap-2">
                <User className="w-4 h-4 text-[#D4AF37]" />
                <span>1. தனிப்பட்ட & உடல் விவரங்கள் (Personal & Physical Information)</span>
              </h3>
              <span className="text-[11px] text-[#F3E5AB] font-bold">விவரங்கள்</span>
            </div>

            <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 text-xs">
              <div className="p-2.5 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">முழு பெயர்</span>
                <span className="font-bold text-gray-900 text-sm">{fullName}</span>
              </div>
              <div className="p-2.5 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">பாலினம்</span>
                <span className="font-bold text-gray-900 text-sm">{gender}</span>
              </div>
              <div className="p-2.5 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">பிறந்த தேதி & வயது</span>
                <span className="font-bold text-gray-900 text-sm">
                  {cleanDob || 'Not specified'} {age ? `(${age} வயது)` : ''}
                </span>
              </div>
              <div className="p-2.5 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">பிறந்த நேரம்</span>
                <span className="font-bold text-gray-900 text-sm">{profile?.birthTime || profile?.tob || 'Not specified'}</span>
              </div>
              <div className="p-2.5 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">பிறந்த ஊர்</span>
                <span className="font-bold text-gray-900 text-sm">{profile?.birthPlace || profile?.lob || 'Not specified'}</span>
              </div>
              <div className="p-2.5 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">உயரம்</span>
                <span className="font-bold text-gray-900 text-sm">{heightDisplay || 'Not specified'}</span>
              </div>
              <div className="p-2.5 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">எடை</span>
                <span className="font-bold text-gray-900 text-sm">{profile?.weightKg || profile?.weight ? `${profile?.weightKg || profile?.weight} Kg` : 'Not specified'}</span>
              </div>
              <div className="p-2.5 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">நிறம் (Complexion)</span>
                <span className="font-bold text-gray-900 text-sm">{profile?.complexion || profile?.skinColour || 'Wheatish'}</span>
              </div>
              <div className="p-2.5 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">உடல் நிலை</span>
                <span className="font-bold text-gray-900 text-sm">{profile?.physicalCondition === 'NORMAL' || !profile?.physicalCondition ? 'இயல்பானது (Normal)' : profile?.physicalCondition}</span>
              </div>
              <div className="p-2.5 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">தாய்மொழி</span>
                <span className="font-bold text-gray-900 text-sm">{profile?.motherTongue || 'தமிழ் (Tamil)'}</span>
              </div>
              <div className="p-2.5 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">உணவுப் பழக்கம்</span>
                <span className="font-bold text-gray-900 text-sm">{profile?.foodHabit || profile?.foodHabits || 'சைவம் / அசைவம்'}</span>
              </div>
              <div className="p-2.5 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">பழக்கவழக்கம்</span>
                <span className="font-bold text-emerald-700 text-sm">புகை / மது பழக்கம் இல்லை</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: JATHAGAM & ASTROLOGY DETAILS */}
          <div className="bg-white rounded-2xl border-2 border-[#D4AF37]/50 shadow-sm overflow-hidden page-break">
            <div className="bg-gradient-to-r from-primary via-[#580016] to-primary text-white px-4 py-2.5 sm:px-6 sm:py-3 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-serif font-black flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>2. ஜோதிடம் & ஜாதக விவரங்கள் (Astrological Details)</span>
              </h3>
              <span className="text-[11px] text-[#F3E5AB] font-bold">ஜாதக விவரங்கள்</span>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              
              {/* Planetary & Star Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/15 text-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">ராசி (Rasi)</span>
                  <span className="text-base font-black text-primary font-serif">{profile?.rasi || 'Not specified'}</span>
                </div>
                <div className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/15 text-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">நட்சத்திரம் (Nakshatram)</span>
                  <span className="text-base font-black text-primary font-serif">{profile?.nakshatram || profile?.nakshatra || 'Not specified'}</span>
                </div>
                <div className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/15 text-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">பாதம் & லக்னம்</span>
                  <span className="text-sm font-bold text-gray-800">
                    {profile?.paadham ? `${profile.paadham}-ஆம் பாதம்` : '1-ஆம் பாதம்'} • {profile?.lagnam || 'மேஷம்'}
                  </span>
                </div>
                <div className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/15 text-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">தோஷங்கள் (Doshams)</span>
                  <span className="text-sm font-bold text-emerald-700">
                    {Array.isArray(profile?.doshams) && profile.doshams.length > 0 && !profile.doshams.includes('NONE')
                      ? profile.doshams.join(', ')
                      : 'தோஷம் இல்லை (None)'}
                  </span>
                </div>
              </div>

              {/* Dasa Bhukti Balance Banner */}
              {(profile?.dasaPlanet || profile?.dasaYears) && (
                <div className="bg-[#FFFDF9] border border-[#D4AF37]/50 rounded-xl p-3 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">திசை இருப்பு (Dasa Balance):</span>
                    <span className="font-black text-gray-900">
                      {profile.dasaPlanet || 'கேது'} திசை: {profile.dasaYears || 0} ஆண்டுகள், {profile.dasaMonths || 0} மாதங்கள், {profile.dasaDays || 0} நாட்கள்
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">துல்லியமான ஜாதகம்</span>
                </div>
              )}


              {/* Jathagam Copy Document Attachment */}
              {profile?.horoscopeUrl && (
                <div className="no-print bg-[#FFFDF9] border border-primary/20 rounded-xl p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">ஜாதக அசல் நகல் இணைக்கப்பட்டுள்ளது</p>
                      <p className="text-[11px] text-gray-500">Original Horoscope PDF / Image Copy</p>
                    </div>
                  </div>
                  <a
                    href={profile.horoscopeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary-light transition-all"
                  >
                    <span>பார்வையிடுக</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: EDUCATION & PROFESSION DETAILS */}
          <div className="bg-white rounded-2xl border border-primary/20 shadow-xs overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary-light text-white px-4 py-2.5 sm:px-6 sm:py-3 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-serif font-black flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
                <span>3. கல்வி & பணி விவரங்கள் (Education & Career)</span>
              </h3>
              <span className="text-[11px] text-[#F3E5AB] font-bold">தொழில்</span>
            </div>

            <div className="p-4 sm:p-6 space-y-4 text-xs">
              
              {/* Education List */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide block">கல்வித் தகுதிகள்</span>
                {Array.isArray(profile?.educationList) && profile.educationList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {profile.educationList.map((edu: any, idx: number) => (
                      <div key={idx} className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/10">
                        <span className="text-[10px] font-bold text-primary uppercase">{edu.level || 'Degree'}</span>
                        <p className="font-extrabold text-gray-900 text-sm mt-0.5">{edu.degree || 'Degree'}</p>
                        {edu.institution && (
                          <p className="text-gray-600 text-[11px] mt-0.5">{edu.institution}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/10">
                    <p className="font-extrabold text-gray-900 text-sm">
                      {profile?.education || 'Graduation / Post Graduation'}
                    </p>
                  </div>
                )}
              </div>

              {/* Career & Income Grid */}
              <div className="pt-2 border-t border-gray-100">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide block mb-2">தொழில் & வருமானம்</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/10">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">பதவி / பதவிப் பெயர்</span>
                    <span className="font-bold text-gray-900 text-sm">
                      {profile?.designation || profile?.workNature || 'Software Engineer / Professional'}
                    </span>
                  </div>
                  <div className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/10">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">நிறுவனம் / அலுவலகம்</span>
                    <span className="font-bold text-gray-900 text-sm">
                      {profile?.companyName || profile?.organisation || 'Reputed Organization / Business'}
                    </span>
                  </div>
                  <div className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/10">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">பணிபுரியும் இடம் (Work City)</span>
                    <span className="font-bold text-gray-900 text-sm flex items-center justify-between">
                      <span>{profile?.workCity || profile?.workingAddress || profile?.city || 'Coimbatore'}</span>
                      {profile?.workMapLink && (
                        <a
                          href={profile.workMapLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline flex items-center gap-0.5 text-[11px]"
                        >
                          <MapPin className="w-3.5 h-3.5" /> Map
                        </a>
                      )}
                    </span>
                  </div>
                  <div className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/10">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">மாத வருமானம்</span>
                    <span className="font-bold text-gray-900 text-sm">{profile?.monthlyIncome ? `₹${profile.monthlyIncome}` : 'Disclosed during talk'}</span>
                  </div>
                  <div className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/10">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">ஆண்டு வருமானம் (Annual CTC)</span>
                    <span className="font-bold text-emerald-800 text-sm">{profile?.annualIncome || profile?.salary || 'Disclosed during talk'}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 4: FAMILY DETAILS */}
          <div className="bg-white rounded-2xl border border-primary/20 shadow-xs overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary-light text-white px-4 py-2.5 sm:px-6 sm:py-3 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-serif font-black flex items-center gap-2">
                <HomeIcon className="w-4 h-4 text-[#D4AF37]" />
                <span>4. குடும்ப விவரங்கள் (Family Background)</span>
              </h3>
              <span className="text-[11px] text-[#F3E5AB] font-bold">பாரம்பரியம்</span>
            </div>

            <div className="p-4 sm:p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Father Info */}
                <div className="p-3.5 bg-[#FFFDF9] rounded-xl border border-primary/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-400 uppercase">தந்தை பெயர்</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${String(profile?.fatherStatus).toUpperCase() === 'LATE' || profile?.fatherLivingStatus === 'LATE' ? 'bg-gray-200 text-gray-700' : 'bg-emerald-100 text-emerald-800'}`}>
                      {String(profile?.fatherStatus).toUpperCase() === 'LATE' || profile?.fatherLivingStatus === 'LATE' ? 'மறைந்தார் (Late)' : 'உயிருடன் (Alive)'}
                    </span>
                  </div>
                  <p className="font-black text-gray-900 text-base">{profile?.fatherName || 'Not specified'}</p>
                  {String(profile?.fatherStatus).toUpperCase() !== 'LATE' && profile?.fatherLivingStatus !== 'LATE' && (
                    <>
                      <p className="text-gray-700">தொழில்: <span className="font-bold">{profile?.fatherOccupation || 'Business / Agriculture'}</span></p>
                      {profile?.fatherMobile && !profile?.hideMobile && (
                        <p className="text-gray-700">தொடர்பு: <span className="font-bold font-mono">{profile.fatherMobile}</span></p>
                      )}
                    </>
                  )}
                </div>

                {/* Mother Info */}
                <div className="p-3.5 bg-[#FFFDF9] rounded-xl border border-primary/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-400 uppercase">தாய் பெயர்</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${String(profile?.motherStatus).toUpperCase() === 'LATE' || profile?.motherLivingStatus === 'LATE' ? 'bg-gray-200 text-gray-700' : 'bg-emerald-100 text-emerald-800'}`}>
                      {String(profile?.motherStatus).toUpperCase() === 'LATE' || profile?.motherLivingStatus === 'LATE' ? 'மறைந்தார் (Late)' : 'உயிருடன் (Alive)'}
                    </span>
                  </div>
                  <p className="font-black text-gray-900 text-base">{profile?.motherName || 'Not specified'}</p>
                  {String(profile?.motherStatus).toUpperCase() !== 'LATE' && profile?.motherLivingStatus !== 'LATE' && (
                    <>
                      <p className="text-gray-700">தொழில்: <span className="font-bold">{profile?.motherOccupation || 'Homemaker'}</span></p>
                      {profile?.motherMobile && !profile?.hideMobile && (
                        <p className="text-gray-700">தொடர்பு: <span className="font-bold font-mono">{profile.motherMobile}</span></p>
                      )}
                    </>
                  )}
                </div>

              </div>

              {/* Siblings List */}
              <div className="p-3.5 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1.5">உடன்பிறப்புகள் (Siblings)</span>
                {Array.isArray(profile?.siblingsList) && profile.siblingsList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {profile.siblingsList.map((sib: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-100">
                        <span className="font-bold text-gray-800">{sib.name || `உடன்பிறப்பு ${idx + 1}`} ({sib.relation || 'Sibling'})</span>
                        <span className="text-[11px] font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded-md">
                          {sib.maritalStatus === 'MARRIED' ? 'திருமணமானவர்' : 'திருமணமாகாதவர்'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-700 font-semibold">உடன்பிறப்புகள் இல்லை (Only Child / Not specified)</p>
                )}
              </div>

              {/* Family Values & Native */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/10">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">பூர்வீகம் (Native Place)</span>
                  <span className="font-bold text-gray-900">{profile?.nativePlace || profile?.city || 'Tamil Nadu'}</span>
                </div>
                <div className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/10">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">குடும்ப அமைப்பு</span>
                  <span className="font-bold text-gray-900">{profile?.familyType || 'Nuclear / Joint Family'}</span>
                </div>
                <div className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/10">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">குடும்ப மதிப்பு</span>
                  <span className="font-bold text-gray-900">{profile?.familyValue || 'Traditional / Moderate'}</span>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 5: PROPERTY & SEERVARISAI DETAILS */}
          <div className="bg-white rounded-2xl border border-primary/20 shadow-xs overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary-light text-white px-4 py-2.5 sm:px-6 sm:py-3 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-serif font-black flex items-center gap-2">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <span>5. சொத்து & சீர்வரிசை விவரங்கள் (Property & Assets)</span>
              </h3>
              <span className="text-[11px] text-[#F3E5AB] font-bold">வளமை</span>
            </div>

            <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
              <div className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">சொந்த வீடு</span>
                <span className="font-bold text-gray-900 text-sm">
                  {profile?.houseType || 'Own House'} {profile?.houseSqft ? `(${profile.houseSqft})` : ''}
                </span>
              </div>
              <div className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">மாத வாடகை வருமானம்</span>
                <span className="font-bold text-gray-900 text-sm">
                  {profile?.rentalIncomeMonthly || profile?.rentalIncome ? `₹${profile.rentalIncomeMonthly || profile.rentalIncome}` : 'None'}
                </span>
              </div>
              <div className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">தோட்டம் / நஞ்சை-புஞ்சை நிலம்</span>
                <span className="font-bold text-gray-900 text-sm">
                  {profile?.agriculturalLandAcres || profile?.thottam || 'None'}
                </span>
              </div>
              <div className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">காலி மனை (Vacant Land)</span>
                <span className="font-bold text-gray-900 text-sm">
                  {profile?.vacantLandSqft || profile?.vacantLand || 'None'}
                </span>
              </div>
              <div className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">தோராய சொத்து மதிப்பு</span>
                <span className="font-bold text-emerald-800 text-sm">
                  {profile?.totalNetAssets || profile?.totalAssetValue || 'Disclosed during talk'}
                </span>
              </div>
              <div className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">சீர்வரிசை / தங்கம்</span>
                <span className="font-bold text-gray-900 text-sm">
                  {profile?.goldPavun ? `${profile.goldPavun} பவுன்` : 'Mutual Discussion'}
                </span>
              </div>

              {profile?.propertyComments && (
                <div className="col-span-2 sm:col-span-3 p-3 bg-[#FFFDF9] rounded-xl border border-primary/10">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">கூடுதல் சொத்து விவரங்கள்</span>
                  <p className="text-gray-800 text-xs leading-relaxed">{profile.propertyComments}</p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 6: PARTNER EXPECTATIONS */}
          <div className="bg-white rounded-2xl border border-primary/20 shadow-xs overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary-light text-white px-4 py-2.5 sm:px-6 sm:py-3 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-serif font-black flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#D4AF37]" />
                <span>6. துணைவர் எதிர்பார்ப்புகள் (Partner Preferences)</span>
              </h3>
              <span className="text-[11px] text-[#F3E5AB] font-bold">விருப்பங்கள்</span>
            </div>

            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-xs">
              <div className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">எதிர்பார்க்கும் வயது வரம்பு</span>
                <span className="font-bold text-gray-900 text-sm">
                  {profile?.expectedAgeGap ? `Up to ${profile.expectedAgeGap} Yrs difference` : 'Suitable match'}
                </span>
              </div>
              <div className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">எதிர்பார்க்கும் உயரம்</span>
                <span className="font-bold text-gray-900 text-sm">
                  {profile?.expectedMinHeightCm ? `${profile.expectedMinHeightCm} cm to ${profile.expectedMaxHeightCm || 185} cm` : 'Any suitable height'}
                </span>
              </div>
              <div className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">கல்வி & தொழில்</span>
                <span className="font-bold text-gray-900 text-sm">
                  {profile?.expectedEducation || profile?.expectedProfession || 'Any Graduate / Working'}
                </span>
              </div>
              <div className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">விரும்பும் மாவட்டங்கள்</span>
                <span className="font-bold text-gray-900 text-sm">
                  {[profile?.preferredCity1, profile?.preferredCity2, profile?.preferredCity3].filter(Boolean).join(', ') || 'Any Region in Tamil Nadu'}
                </span>
              </div>
              <div className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">மறுமணம் சம்மதம்</span>
                <span className="font-bold text-gray-900 text-sm">
                  {profile?.openToRemarriage ? 'சம்மதம் (Open to Remarriage)' : 'முதல் மணம் மட்டும் (Unmarried Only)'}
                </span>
              </div>
              <div className="p-3 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">மாத வருமான எதிர்பார்ப்பு</span>
                <span className="font-bold text-gray-900 text-sm">
                  {profile?.expectedMinMonthlyIncome || 'Mutual understanding'}
                </span>
              </div>

              {profile?.partnerExpectationsNotes && (
                <div className="col-span-1 sm:col-span-2 md:col-span-3 p-3 bg-[#FFFDF9] rounded-xl border border-primary/10">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">கூடுதல் குறிப்புகள்</span>
                  <p className="text-gray-800 text-xs leading-relaxed">{profile.partnerExpectationsNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 7: CONTACT & VERIFICATION DETAILS */}
          <div className="bg-white rounded-2xl border border-primary/20 shadow-xs overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary-light text-white px-4 py-2.5 sm:px-6 sm:py-3 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-serif font-black flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>7. தொடர்பு & தனியுரிமை (Contact & Privacy Details)</span>
              </h3>
              <span className="text-[11px] text-[#F3E5AB] font-bold">பாதுகாப்பானது</span>
            </div>

            <div className="p-4 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-[#FFFDF9] rounded-xl border border-primary/10">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">முதன்மை தொடர்பு எண்</span>
                  <p className="font-black text-gray-900 text-base font-mono flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    <span>{profile?.whatsappNumber || profile?.primaryMobile || 'Contact protected'}</span>
                  </p>
                </div>

                <div className="p-3.5 bg-[#FFFDF9] rounded-xl border border-primary/10">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">மின்னஞ்சல் முகவரி</span>
                  <p className="font-bold text-gray-900 text-sm font-mono flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <span>{profile?.email || 'Not provided'}</span>
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-[#FFFDF9] rounded-xl border border-primary/10">
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">இருப்பிட முகவரி (Address)</span>
                <p className="font-bold text-gray-800 text-sm leading-relaxed">
                  {profile?.address || profile?.houseAddress || `${profile?.city || 'Coimbatore'}, Tamil Nadu`}
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-xs">100% இலவச மக்கள் சேவை உத்தரவாதம்</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                    எந்தவித கட்டணமும் இன்றி குடும்பங்கள் நேரடியாக தொடர்பு கொண்டு பேச இந்த சுயவிவரம் வழங்கப்படுகிறது.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 5. FOOTER OF BIODATA */}
        <div className="bg-[#FFFDF9] border-t-2 border-[#D4AF37]/40 p-6 sm:p-8 text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <BrandLogo size="md" />
          </div>
          <p className="text-xs text-gray-600 font-medium max-w-md mx-auto">
            {BRANDING.brandNameTamil} • {BRANDING.taglineTamil}
          </p>
          <p className="text-[11px] text-gray-400">
            சுயவிவர பதிவு எண்: <span className="font-bold font-mono text-primary">{displayId}</span> • அச்சிடப்பட்ட நாள்: {new Date().toLocaleDateString('ta-IN')}
          </p>
        </div>

      </div>

      {/* PHOTO LIGHTBOX MODAL */}
      {photoModalOpen && profile?.photoUrl && (
        <div
          className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPhotoModalOpen(false)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden border-4 border-[#D4AF37] shadow-2xl p-2 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={profile.photoUrl}
              alt={fullName}
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
            <div className="p-3 text-center flex items-center justify-between">
              <span className="font-bold text-primary font-serif">{fullName} ({displayId})</span>
              <button
                type="button"
                onClick={() => setPhotoModalOpen(false)}
                className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full cursor-pointer"
              >
                மூடுக (Close)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

