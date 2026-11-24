'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AkshayamProfileView from '@/frontend/components/profile/AkshayamProfileView';
import { useLanguage } from '@/frontend/context/LanguageContext';
import BrandLogo from '@/frontend/components/BrandLogo';
import { BRANDING } from '@/constants/branding';
import {
  X,
  User,
  Users,
  Phone,
  Heart,
  ShieldCheck,
  Trash2,
  Edit3,
  Share2,
  Printer,
  Search,
  ArrowLeft,
  ExternalLink,
  PlusCircle,
  Sparkles,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  CheckCircle,
  Maximize2
} from 'lucide-react';
import Link from 'next/link';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const { language } = useLanguage();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [userMobile, setUserMobile] = useState<string>('');
  const [activeViewCandidate, setActiveViewCandidate] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'MALE' | 'FEMALE'>('ALL');

  // Phone search / switch state
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [isSearchingPhone, setIsSearchingPhone] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Delete candidate confirmation state
  const [candidateToDelete, setCandidateToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState('');

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // Reset view candidate on close so next open returns to list
      setActiveViewCandidate(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (candidateToDelete) {
          setCandidateToDelete(null);
        } else if (showPhoneModal) {
          setShowPhoneModal(false);
        } else if (activeViewCandidate) {
          setActiveViewCandidate(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, candidateToDelete, showPhoneModal, activeViewCandidate, onClose]);

  // Fetch or reload profiles
  const loadProfiles = useCallback(async () => {
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

      if (localList.length === 0) {
        const singleProf =
          localStorage.getItem('namma_matrimony_profile') ||
          localStorage.getItem('namma_registration_complete');
        if (singleProf) {
          try {
            const parsed = JSON.parse(singleProf);
            localList = [parsed];
          } catch (e) {}
        }
      }

      const effectiveMobile =
        storedMobile ||
        localList[0]?.whatsappNumber ||
        localList[0]?.mobileNumber ||
        localList[0]?.userContact?.mobile ||
        '';

      if (effectiveMobile) {
        setUserMobile(effectiveMobile);
        localStorage.setItem('namma_user_mobile', effectiveMobile);

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
          console.warn('Failed to fetch profiles from API, using local storage fallback', apiErr);
        }
      }

      setRegistrations(localList);
    } catch (err) {
      console.error('ProfileDrawer load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Trigger load when drawer opens
  useEffect(() => {
    if (isOpen) {
      loadProfiles();
    }
  }, [isOpen, loadProfiles]);

  // Search by mobile number
  const handleSearchByMobile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = phoneInput.replace(/\D/g, '').slice(-10);
    if (clean.length < 10) {
      setSearchError(
        language === 'TA' ? 'சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்' : 'Please enter a valid 10-digit mobile number'
      );
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

  // Delete candidate confirmation handler
  const handleConfirmDelete = async () => {
    if (!candidateToDelete) return;
    setIsDeleting(true);
    const targetId =
      candidateToDelete.id ||
      candidateToDelete.profileId ||
      candidateToDelete.displayId ||
      candidateToDelete.registrationId;
    const targetDisplayId = candidateToDelete.displayId || candidateToDelete.registrationId || '';

    try {
      if (targetId || targetDisplayId) {
        await fetch(`/api/register?id=${encodeURIComponent(targetId || targetDisplayId)}`, {
          method: 'DELETE',
        });
      }

      const updated = registrations.filter((c) => {
        const cId = c.id || c.profileId || c.displayId || c.registrationId;
        const cDisp = c.displayId || c.registrationId;
        return cId !== targetId && cDisp !== targetDisplayId;
      });

      setRegistrations(updated);
      localStorage.setItem('namma_registrations', JSON.stringify(updated));

      const draft = localStorage.getItem('namma_matrimony_draft');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          if (parsed.displayId === targetDisplayId || parsed.id === targetId) {
            localStorage.removeItem('namma_matrimony_draft');
          }
        } catch {}
      }

      if (
        activeViewCandidate &&
        (activeViewCandidate.displayId === targetDisplayId || activeViewCandidate.id === targetId)
      ) {
        setActiveViewCandidate(null);
      }

      setCandidateToDelete(null);
      setDeleteSuccessMsg(
        language === 'TA'
          ? `வரன் பதிவு (${targetDisplayId || ''}) வெற்றிகரமாக நீக்கப்பட்டது.`
          : `Candidate profile (${targetDisplayId || ''}) deleted successfully.`
      );
      setTimeout(() => setDeleteSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Delete candidate error:', err);
      alert(
        language === 'TA' ? 'வரன் பதிவை நீக்குவதில் பிழை ஏற்பட்டது.' : 'Failed to delete profile. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Helpers
  const calculateAge = (dobString?: string) => {
    if (!dobString) return null;
    const bDate = new Date(dobString);
    if (isNaN(bDate.getTime())) return null;
    const diff = Date.now() - bDate.getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  // Open candidate view with fresh full profile from API
  const handleOpenCandidateView = async (candidate: any) => {
    setActiveViewCandidate(candidate);
    const targetId = candidate.displayId || candidate.id || candidate.registrationId;
    if (targetId) {
      try {
        const res = await fetch(`/api/register?id=${encodeURIComponent(targetId)}`);
        const data = await res.json();
        if (data.success && data.profile) {
          setActiveViewCandidate(data.profile);
        }
      } catch (err) {
        console.warn('Failed to fetch full candidate profile:', err);
      }
    }
  };

  const formatHeight = (cm?: number) => {
    if (!cm) return null;
    const totalInches = Math.round(cm / 2.54);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${cm} cm (${feet}'${inches}")`;
  };

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
100% முற்றிலும் இலவச மேட்ரிமோனி தளம்: ${typeof window !== 'undefined' ? window.location.origin : ''}`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const filteredList = registrations.filter((c) => {
    if (selectedFilter === 'ALL') return true;
    return c.gender === selectedFilter;
  });

  const groomsCount = registrations.filter((c) => c.gender === 'MALE').length;
  const bridesCount = registrations.filter((c) => c.gender === 'FEMALE').length;

  return (
    <>
      {/* 1. Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Slide-Over Panel from Right */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="My Profile Drawer"
        className={`fixed inset-y-0 right-0 z-50 w-full sm:max-w-xl md:max-w-2xl bg-[#FFFDF9] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* TOP HEADER BAR */}
        <div className="bg-gradient-to-r from-primary via-[#580016] to-primary text-white px-4 sm:px-6 py-3.5 border-b-2 border-[#D4AF37]/50 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-serif font-black tracking-wide text-white truncate">
                {language === 'TA' ? 'எனது சுயவிவரக் கணக்கு' : 'My Profile Dashboard'}
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[#F3E5AB]">
                <ShieldCheck className="w-3 h-3 text-[#D4AF37] shrink-0" />
                <span className="truncate">
                  {language === 'TA' ? 'உறுதிசெய்யப்பட்ட கணக்கு' : 'Verified Account'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Expand to full page link */}
            <Link
              href="/profile"
              onClick={onClose}
              title={language === 'TA' ? 'முழு பக்கத்தில் காண்க' : 'Open Full Page'}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </Link>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              title={language === 'TA' ? 'மூடுக' : 'Close'}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-white/90 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* INNER CONTENT AREA */}
        {activeViewCandidate ? (
          /* AKSHAYAM BIODATA VIEW INSIDE DRAWER */
          <div className="flex-1 overflow-y-auto flex flex-col bg-[#FFFDF9]">
            <div className="flex-1">
              <AkshayamProfileView
                profile={activeViewCandidate}
                language={language}
                onBack={() => setActiveViewCandidate(null)}
                onEdit={() => {
                  localStorage.setItem('namma_matrimony_draft', JSON.stringify(activeViewCandidate));
                  window.location.href = '/register';
                }}
                onDelete={() => setCandidateToDelete(activeViewCandidate)}
              />
            </div>
          </div>
        ) : (
          /* CANDIDATE DASHBOARD LIST INSIDE DRAWER */
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4">
            {/* SUCCESS BANNER */}
            {deleteSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{deleteSuccessMsg}</span>
              </div>
            )}

            {/* USER MOBILE & ACCOUNT CARD */}
            <div className="bg-gradient-to-br from-[#FAF6F0] via-white to-[#FAF6F0] border border-primary/15 rounded-2xl p-3.5 sm:p-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      {language === 'TA' ? 'பதிவு செய்யப்பட்ட எண்' : 'Registered Mobile'}
                    </div>
                    <div className="text-xs sm:text-sm font-mono font-bold text-gray-900">
                      {userMobile ? `+91 ${userMobile}` : (language === 'TA' ? 'எண் பதிவு செய்யப்படவில்லை' : 'Not set')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchError('');
                      setShowPhoneModal(true);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                  >
                    <Search className="w-3 h-3" />
                    <span>{language === 'TA' ? 'மாற்று / தேடு' : 'Find / Switch'}</span>
                  </button>

                  <Link
                    href="/register?new=true"
                    onClick={onClose}
                    className="inline-flex items-center gap-1 text-[11px] font-bold bg-primary hover:bg-primary-light text-white px-3 py-1 rounded-full shadow-xs transition-colors"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>{language === 'TA' ? '+ பதிவு செய்க' : '+ Add'}</span>
                  </Link>
                </div>
              </div>

              {/* STATS CHIPS */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100 text-center">
                <div className="bg-white rounded-lg p-2 border border-gray-100">
                  <div className="text-[10px] text-gray-500 font-medium">
                    {language === 'TA' ? 'மொத்த வரன்கள்' : 'Total'}
                  </div>
                  <div className="text-sm font-bold text-gray-900">{registrations.length}</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-blue-100">
                  <div className="text-[10px] text-blue-600 font-medium">
                    {language === 'TA' ? 'மணமகன்' : 'Grooms'}
                  </div>
                  <div className="text-sm font-bold text-blue-700">{groomsCount}</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-rose-100">
                  <div className="text-[10px] text-rose-600 font-medium">
                    {language === 'TA' ? 'மணமகள்' : 'Brides'}
                  </div>
                  <div className="text-sm font-bold text-rose-700">{bridesCount}</div>
                </div>
              </div>
            </div>

            {/* FILTER TABS */}
            {registrations.length > 0 && (
              <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSelectedFilter('ALL')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedFilter === 'ALL'
                      ? 'bg-white text-primary shadow-xs font-extrabold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {language === 'TA' ? `அனைத்தும் (${registrations.length})` : `All (${registrations.length})`}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFilter('FEMALE')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedFilter === 'FEMALE'
                      ? 'bg-white text-rose-700 shadow-xs font-extrabold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {language === 'TA' ? `மணமகள் (${bridesCount})` : `Brides (${bridesCount})`}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFilter('MALE')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedFilter === 'MALE'
                      ? 'bg-white text-blue-700 shadow-xs font-extrabold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {language === 'TA' ? `மணமகன் (${groomsCount})` : `Grooms (${groomsCount})`}
                </button>
              </div>
            )}

            {/* CANDIDATE CARDS LIST */}
            {isLoading ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-bold text-primary animate-pulse">
                  {language === 'TA' ? 'வரன்கள் விவரம் ஏற்றப்படுகிறது...' : 'Loading registered profiles...'}
                </p>
              </div>
            ) : filteredList.length === 0 ? (
              /* EMPTY STATE */
              <div className="py-10 text-center space-y-4 bg-white rounded-2xl border-2 border-dashed border-gray-200 p-6">
                <div className="w-14 h-14 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center mx-auto text-primary">
                  <User className="w-7 h-7 text-primary/60" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 font-serif">
                    {language === 'TA'
                      ? 'வரன் பதிவுகள் எதுவும் கிடைக்கவில்லை'
                      : 'No Registered Profiles Found'}
                  </h3>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                    {language === 'TA'
                      ? 'புதிய வரன் பதிவு செய்ய கீழே உள்ள பொத்தானை அழுத்தவும் அல்லது உங்கள் மொபைல் எண்ணை உள்ளிட்டு ஏற்கனவே பதிவு செய்த வரன்களைத் தேடவும்.'
                      : 'Register a new bride/groom candidate or search with your registered 10-digit mobile number.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <Link
                    href="/register?new=true"
                    onClick={onClose}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-light text-white text-xs font-bold py-2 px-4 rounded-full shadow-md transition-all"
                  >
                    <Heart className="w-3.5 h-3.5 fill-white" />
                    <span>{language === 'TA' ? '+ புதிய வரன் பதிவு' : '+ Register Bride/Groom'}</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setSearchError('');
                      setShowPhoneModal(true);
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-xs font-bold py-2 px-4 rounded-full transition-all cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5 text-gray-500" />
                    <span>{language === 'TA' ? 'மொபைல் மூலம் தேடுக' : 'Find by Mobile'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* CANDIDATE CARDS */
              <div className="space-y-3.5">
                {filteredList.map((c, idx) => {
                  const dispId = c.displayId || c.registrationId || c.refId || `NM-000${idx + 1}`;
                  const cName = c.fullName || c.name || (language === 'TA' ? 'பெயர் குறிப்பிடப்படவில்லை' : 'Name not provided');
                  const isFemale = c.gender === 'FEMALE';
                  const cAge = calculateAge(c.dob) || c.age;
                  const cHeight = formatHeight(c.heightCm || c.height);
                  const isApproved = c.approvalStatus === 'APPROVED' || c.status === 'APPROVED';

                  return (
                    <div
                      key={c.id || dispId || idx}
                      className="bg-white rounded-2xl border border-gray-200/90 hover:border-primary/40 p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all space-y-3"
                    >
                      {/* CARD TOP INFO */}
                      <div className="flex items-start gap-3">
                        {/* PHOTO OR AVATAR */}
                        <div className="relative shrink-0">
                          {c.photoUrl ? (
                            <img
                              src={c.photoUrl}
                              alt={cName}
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-[#D4AF37]/50 shadow-xs"
                            />
                          ) : (
                            <div
                              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center border shadow-xs ${
                                isFemale
                                  ? 'bg-rose-50 text-rose-500 border-rose-200'
                                  : 'bg-blue-50 text-blue-500 border-blue-200'
                              }`}
                            >
                              <User className="w-7 h-7" />
                            </div>
                          )}
                          <span
                            className={`absolute -bottom-1 -right-1 text-[9px] font-black px-1.5 py-0.5 rounded-full border shadow-2xs ${
                              isFemale
                                ? 'bg-rose-600 text-white border-white'
                                : 'bg-blue-600 text-white border-white'
                            }`}
                          >
                            {isFemale ? (language === 'TA' ? 'பெண்' : 'F') : (language === 'TA' ? 'ஆண்' : 'M')}
                          </span>
                        </div>

                        {/* NAME & KEY DETAILS */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-sm sm:text-base font-serif font-black text-gray-900 truncate">
                              {cName}
                            </h4>
                            <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full shrink-0">
                              {dispId}
                            </span>
                          </div>

                          <div className="text-[11px] sm:text-xs text-gray-600 font-medium flex flex-wrap items-center gap-1.5 mt-0.5">
                            {cAge && <span>{cAge} {language === 'TA' ? 'வயது' : 'yrs'}</span>}
                            {cHeight && <span>• {cHeight}</span>}
                            <span>• {c.caste || (language === 'TA' ? 'தமிழ் சமூகம்' : 'Tamil Community')}</span>
                            {(c.koottam || c.kootam) && (
                              <span className="text-gray-500">({c.koottam || c.kootam})</span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] sm:text-[11px] text-gray-500">
                            {c.city && (
                              <span className="inline-flex items-center gap-0.5">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                {c.city}
                              </span>
                            )}
                            {(c.education || c.highestEducation) && (
                              <span className="inline-flex items-center gap-0.5">
                                <GraduationCap className="w-3 h-3 text-gray-400" />
                                <span className="truncate max-w-[130px]">{c.education || c.highestEducation}</span>
                              </span>
                            )}
                            {(() => {
                              const isBiz = String(c.workNature).toUpperCase().includes('BUSINESS');
                              const role = c.designation || (isBiz ? (language === 'TA' ? 'சொந்த தொழில்' : 'Business') : '');
                              const comp = c.companyName || c.organisation || '';
                              const workTitle = role ? (comp ? `${role} @ ${comp}` : role) : (comp || (c.workNature && c.workNature !== 'PRIVATE' ? c.workNature : ''));
                              if (!workTitle) return null;
                              return (
                                <span className="inline-flex items-center gap-0.5">
                                  <Briefcase className="w-3 h-3 text-gray-400" />
                                  <span className="truncate max-w-[160px]">{workTitle}</span>
                                </span>
                              );
                            })()}
                          </div>

                          {/* Rasi / Nakshatram if available */}
                          {(c.rasi || c.nakshatram) && (
                            <div className="text-[10px] font-semibold text-amber-900/80 bg-amber-50/80 border border-amber-200/60 rounded-md px-2 py-0.5 mt-1.5 inline-block">
                              {c.rasi && <span>{c.rasi}</span>}
                              {c.rasi && c.nakshatram && <span> • </span>}
                              {c.nakshatram && <span>{c.nakshatram}</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* STATUS & ACTIONS BAR */}
                      <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                        {/* Approval Status Pill */}
                        <div className="flex items-center gap-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isApproved
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-amber-50 text-amber-700 border-amber-300'
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>
                              {isApproved
                                ? (language === 'TA' ? 'சரிபார்க்கப்பட்டது' : 'Verified')
                                : (language === 'TA' ? 'சரிபார்ப்பில் உள்ளது' : 'Under Review')}
                            </span>
                          </span>
                        </div>

                        {/* Action Icons */}
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          {/* View Full Biodata Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenCandidateView(c)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold bg-primary text-white hover:bg-primary-light px-2.5 py-1 rounded-full shadow-2xs transition-all cursor-pointer"
                            title={language === 'TA' ? 'முழு பயோடேட்டாவைக் காண்க' : 'View Full Biodata'}
                          >
                            <span>{language === 'TA' ? 'பயோடேட்டா' : 'Biodata'}</span>
                          </button>

                          {/* WhatsApp Share */}
                          <button
                            type="button"
                            onClick={() => handleCardWhatsAppShare(c)}
                            className="w-7 h-7 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center transition-colors cursor-pointer"
                            title="Share on WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => {
                              localStorage.setItem('namma_matrimony_draft', JSON.stringify(c));
                              onClose();
                              window.location.href = '/register';
                            }}
                            className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center transition-colors cursor-pointer"
                            title={language === 'TA' ? 'திருத்து' : 'Edit'}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setCandidateToDelete(c)}
                            className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center transition-colors cursor-pointer"
                            title={language === 'TA' ? 'நீக்கு' : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* BOTTOM FOOTER LINK */}
        <div className="p-3 bg-[#FAF6F0] border-t border-primary/10 flex items-center justify-between text-xs text-gray-600 shrink-0">
          <Link
            href="/profile"
            onClick={onClose}
            className="text-primary font-bold hover:underline inline-flex items-center gap-1"
          >
            <span>{language === 'TA' ? 'முழு சுயவிவர பக்கத்திற்குச் செல்ல' : 'Go to Full Profile Page'}</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <span className="text-[11px] text-gray-500">
            {BRANDING.brandName} • 100% Free
          </span>
        </div>
      </aside>

      {/* 3. MODAL: SEARCH BY MOBILE NUMBER */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-primary/20 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 font-serif">
                {language === 'TA' ? 'மொபைல் எண் மூலம் தேடுக' : 'Find by Mobile Number'}
              </h3>
              <button
                type="button"
                onClick={() => setShowPhoneModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {language === 'TA'
                ? 'நீங்கள் பதிவு செய்யும்போது அளித்த 10 இலக்க மொபைல் எண்ணை உள்ளிட்டு உங்கள் வரன்களை ஏற்றலாம்.'
                : 'Enter your 10-digit mobile number used during registration to load your profiles.'}
            </p>

            <form onSubmit={handleSearchByMobile} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  {language === 'TA' ? '10 இலக்க மொபைல் எண்' : '10-digit Mobile Number'}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-gray-500 pointer-events-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden"
                    autoFocus
                  />
                </div>
              </div>

              {searchError && (
                <div className="text-rose-600 text-[11px] font-bold bg-rose-50 p-2 rounded-lg">
                  {searchError}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPhoneModal(false)}
                  className="flex-1 py-2 rounded-full border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {language === 'TA' ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSearchingPhone || phoneInput.length < 10}
                  className="flex-1 py-2 rounded-full bg-primary hover:bg-primary-light disabled:opacity-50 text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>
                    {isSearchingPhone
                      ? (language === 'TA' ? 'தேடுகிறது...' : 'Searching...')
                      : (language === 'TA' ? 'தேடுக' : 'Search')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL: DELETE CONFIRMATION */}
      {candidateToDelete && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-primary/20 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-gray-900 font-serif">
                {language === 'TA' ? 'வரன் பதிவை நீக்க வேண்டுமா?' : 'Delete Candidate Profile?'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {language === 'TA'
                  ? `நீங்கள் "${candidateToDelete.fullName || candidateToDelete.name || 'வரன்'}" (${
                      candidateToDelete.displayId || candidateToDelete.registrationId || ''
                    }) அவர்களின் பதிவை நீக்க விரும்புகிறீர்களா? நீக்கிய பிறகு இதை மீட்டெடுக்க முடியாது.`
                  : `Are you sure you want to permanently delete "${
                      candidateToDelete.fullName || candidateToDelete.name || 'Candidate'
                    }" (${candidateToDelete.displayId || candidateToDelete.registrationId || ''})?`}
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setCandidateToDelete(null)}
                className="flex-1 py-2 px-3 rounded-full border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 transition-colors cursor-pointer"
              >
                {language === 'TA' ? 'ரத்து செய்க' : 'Cancel'}
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2 px-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {isDeleting
                    ? (language === 'TA' ? 'நீக்கப்படுகிறது...' : 'Deleting...')
                    : (language === 'TA' ? 'ஆம், நீக்குக' : 'Yes, Delete')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

