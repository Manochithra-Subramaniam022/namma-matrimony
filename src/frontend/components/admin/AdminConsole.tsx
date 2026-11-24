'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Search,
  RefreshCw,
  User,
  Users,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Sparkles,
  FileText,
  ExternalLink,
  Trash2,
  ArrowLeft,
  Eye,
  Check,
  X,
  Shield,
  Heart,
  ChevronDown,
  Building,
  Image as ImageIcon
} from 'lucide-react';
import BrandLogo from '@/frontend/components/BrandLogo';
import AkshayamProfileView from '@/frontend/components/profile/AkshayamProfileView';
import CasteKoottamManager from './CasteKoottamManager';
import { useLanguage } from '@/frontend/context/LanguageContext';

export default function AdminConsole() {
  const { language, toggleLanguage } = useLanguage();

  const [profiles, setProfiles] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [adminActiveTab, setAdminActiveTab] = useState<'PROFILES' | 'CASTE_KOOTTAM'>('PROFILES');

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'MALE' | 'FEMALE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedBiodataCandidate, setSelectedBiodataCandidate] = useState<any | null>(null);
  const [candidateToDeny, setCandidateToDeny] = useState<any | null>(null);
  const [denyReason, setDenyReason] = useState('Incomplete or unverified details');
  const [candidateToDelete, setCandidateToDelete] = useState<any | null>(null);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  // Expandable profile details (collapsed by default, click to view info)
  const [expandedProfileIds, setExpandedProfileIds] = useState<Record<string, boolean>>({});

  const toggleProfileExpand = (id: string) => {
    setExpandedProfileIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 1. Fetch profiles from API
  const fetchProfiles = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setIsLoading(true);
    else setIsRefreshing(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/profiles');
      const data = await res.json();
      if (data.success && Array.isArray(data.profiles)) {
        setProfiles(data.profiles);
        if (data.stats) {
          setStats(data.stats);
        } else {
          setStats({
            total: data.profiles.length,
            pending: data.profiles.filter((p: any) => !p.status || p.status === 'PENDING').length,
            approved: data.profiles.filter((p: any) => p.status === 'APPROVED').length,
            rejected: data.profiles.filter((p: any) => p.status === 'REJECTED').length,
          });
        }
      } else {
        setErrorMsg(data.error || 'Failed to load profiles');
      }
    } catch (err: any) {
      console.error('fetchProfiles error:', err);
      setErrorMsg(err.message || 'Error connecting to server');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfiles(true);
  }, []);

  // 2. Filtered list
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      // Status filter
      if (statusFilter !== 'ALL') {
        const currentStatus = p.status || 'PENDING';
        if (currentStatus !== statusFilter) return false;
      }

      // Gender filter
      if (genderFilter !== 'ALL') {
        if (p.gender !== genderFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = (p.name || '').toLowerCase();
        const displayId = (p.displayId || '').toLowerCase();
        const mobile = (p.userContact?.mobile || p.profileCreatedBy || '').toLowerCase();
        const city = (p.city || '').toLowerCase();
        const caste = (p.caste || '').toLowerCase();
        const koottam = (p.koottam || p.kootam || '').toLowerCase();
        const match =
          name.includes(q) ||
          displayId.includes(q) ||
          mobile.includes(q) ||
          city.includes(q) ||
          caste.includes(q) ||
          koottam.includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [profiles, statusFilter, genderFilter, searchQuery]);

  const isAllExpanded = useMemo(() => {
    if (filteredProfiles.length === 0) return false;
    return filteredProfiles.every((p) => {
      const key = p.id || p.displayId;
      return !!expandedProfileIds[key];
    });
  }, [filteredProfiles, expandedProfileIds]);

  const toggleExpandAll = () => {
    if (isAllExpanded) {
      setExpandedProfileIds({});
    } else {
      const all: Record<string, boolean> = {};
      filteredProfiles.forEach((p) => {
        const key = p.id || p.displayId;
        if (key) all[key] = true;
      });
      setExpandedProfileIds(all);
    }
  };

  // 3. Status Action Handler (Approve / Reject / Reset)
  const handleUpdateStatus = async (
    candidate: any,
    newStatus: 'APPROVED' | 'REJECTED' | 'PENDING',
    reason?: string
  ) => {
    const targetId = candidate.id || candidate.displayId;
    setActionInProgressId(targetId);

    try {
      const res = await fetch('/api/admin/profiles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: targetId,
          status: newStatus,
          rejectedReason: reason || null,
          approvedBy: 'ADMIN_CONSOLE',
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Update local state smoothly
        setProfiles((prev) =>
          prev.map((item) => {
            const itemId = item.id || item.displayId;
            if (itemId === targetId) {
              return {
                ...item,
                status: newStatus,
                isLive: newStatus === 'APPROVED',
                approvedAt: newStatus === 'APPROVED' ? new Date().toISOString() : null,
                rejectedReason: newStatus === 'REJECTED' ? (reason || 'Admin Denied') : null,
              };
            }
            return item;
          })
        );

        // Recalculate stats
        setStats((prev) => {
          const oldStatus = candidate.status || 'PENDING';
          if (oldStatus === newStatus) return prev;
          const next = { ...prev };
          if (oldStatus === 'PENDING') next.pending = Math.max(0, next.pending - 1);
          if (oldStatus === 'APPROVED') next.approved = Math.max(0, next.approved - 1);
          if (oldStatus === 'REJECTED') next.rejected = Math.max(0, next.rejected - 1);

          if (newStatus === 'PENDING') next.pending += 1;
          if (newStatus === 'APPROVED') next.approved += 1;
          if (newStatus === 'REJECTED') next.rejected += 1;
          return next;
        });

        if (newStatus === 'APPROVED') {
          showToast(
            language === 'TA'
              ? `${candidate.name || candidate.displayId} வரன் ஒப்புதல் அளிக்கப்பட்டு நேரலையில் வைக்கப்பட்டது!`
              : `Profile ${candidate.displayId || candidate.name} successfully Approved & Live!`
          );
        } else if (newStatus === 'REJECTED') {
          showToast(
            language === 'TA'
              ? `${candidate.name || candidate.displayId} வரன் நிராகரிக்கப்பட்டது.`
              : `Profile ${candidate.displayId || candidate.name} has been Denied.`
          );
        } else {
          showToast(
            language === 'TA'
              ? `${candidate.name || candidate.displayId} வரன் நிலுவை நிலைக்கு மாற்றப்பட்டது.`
              : `Profile ${candidate.displayId || candidate.name} reset to Pending.`
          );
        }
      } else {
        showToast(data.error || 'Failed to update profile status', 'error');
      }
    } catch (err: any) {
      console.error('Update status error:', err);
      showToast(err.message || 'Network error occurred', 'error');
    } finally {
      setActionInProgressId(null);
      setCandidateToDeny(null);
    }
  };

  // 4. Delete Handler
  const handleConfirmDelete = async () => {
    if (!candidateToDelete) return;
    const targetId = candidateToDelete.id || candidateToDelete.displayId;
    setActionInProgressId(targetId);

    try {
      const res = await fetch(`/api/admin/profiles?id=${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setProfiles((prev) => prev.filter((p) => (p.id || p.displayId) !== targetId));
        setStats((prev) => {
          const oldStatus = candidateToDelete.status || 'PENDING';
          const next = { ...prev, total: Math.max(0, prev.total - 1) };
          if (oldStatus === 'PENDING') next.pending = Math.max(0, next.pending - 1);
          if (oldStatus === 'APPROVED') next.approved = Math.max(0, next.approved - 1);
          if (oldStatus === 'REJECTED') next.rejected = Math.max(0, next.rejected - 1);
          return next;
        });

        showToast(
          language === 'TA'
            ? `வரன் (${candidateToDelete.displayId || ''}) நிரந்தரமாக நீக்கப்பட்டது.`
            : `Profile (${candidateToDelete.displayId || ''}) permanently deleted.`
        );
      } else {
        showToast(data.error || 'Failed to delete profile', 'error');
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      showToast(err.message || 'Error deleting profile', 'error');
    } finally {
      setActionInProgressId(null);
      setCandidateToDelete(null);
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

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-gray-900 font-sans selection:bg-primary/20 pb-20">
      
      {/* 1. TOP ADMIN NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-primary/10 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/20 text-xs font-bold text-primary transition-all cursor-pointer"
              title="Return to Public Site"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'TA' ? 'முகப்பு' : 'Site'}</span>
            </Link>

            <Link href="/admin" className="inline-flex items-center gap-2 group">
              <BrandLogo size="md" />
            </Link>

            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-extrabold uppercase tracking-wider border border-primary/20">
              <Shield className="w-3 h-3 text-[#D4AF37]" />
              <span>Admin Console</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => fetchProfiles(false)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer"
              title="Reload Profiles"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
              <span className="hidden md:inline">{language === 'TA' ? 'புதுப்பி' : 'Refresh'}</span>
            </button>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/20 text-xs font-bold text-primary transition-all cursor-pointer"
              title="Switch Language"
            >
              <span>{language === 'TA' ? 'English' : 'தமிழ்'}</span>
            </button>

            {/* Public Website Link (Port 3000) */}
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-800 transition-all cursor-pointer shadow-2xs"
              title="Open Public Matrimony Website on http://localhost:3000"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
              <span>{language === 'TA' ? 'இணையதளம் (3000)' : 'Website (Port 3000)'}</span>
            </a>

            {/* Registered User Dashboard Link */}
            <Link
              href="/profile"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 border border-[#D4AF37] text-xs font-bold text-gray-900 transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-primary" />
              <span>{language === 'TA' ? 'பயனர் கணக்குகள்' : 'User Profiles'}</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 space-y-6">
        
        {/* 1.5 ADMIN NAVIGATION TABS */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-primary/20 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAdminActiveTab('PROFILES')}
              className={`inline-flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                adminActiveTab === 'PROFILES'
                  ? 'bg-primary text-white shadow-md ring-2 ring-primary/20'
                  : 'bg-stone-50 text-gray-700 hover:bg-stone-100 hover:text-primary border border-gray-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>{language === 'TA' ? 'வரன் சரிபார்ப்பு & ஒப்புதல்' : 'Profile Approvals'}</span>
              {stats.pending > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-amber-950 font-black">
                  {stats.pending}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setAdminActiveTab('CASTE_KOOTTAM')}
              className={`inline-flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                adminActiveTab === 'CASTE_KOOTTAM'
                  ? 'bg-primary text-white shadow-md ring-2 ring-primary/20'
                  : 'bg-stone-50 text-gray-700 hover:bg-stone-100 hover:text-primary border border-gray-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>{language === 'TA' ? 'சாதி & கூட்டம் மேலாண்மை' : 'Caste & Koottam Manager'}</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center text-xs text-gray-500 font-semibold px-2">
            {adminActiveTab === 'PROFILES'
              ? (language === 'TA' ? 'பதிவு செய்யப்பட்ட வரன்களை சரிபார்த்து ஒப்புதல் செய்க' : 'Review & approve registered candidate profiles')
              : (language === 'TA' ? 'ஒவ்வொரு சாதிக்கான கூட்டம் / கோத்ரங்களை நிர்வகிக்கவும்' : 'Manage Koottams & Gotrams per Caste')}
          </div>
        </div>

        {adminActiveTab === 'CASTE_KOOTTAM' ? (
          <CasteKoottamManager language={language} showToast={showToast} />
        ) : (
          <>
            {/* 2. ADMIN HERO TITLE & STATS COUNTERS */}
            <div className="bg-gradient-to-br from-primary via-[#580016] to-primary text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl border-2 border-[#D4AF37]/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-[#D4AF37]/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/25 text-[#F3E5AB] text-xs font-bold border border-[#D4AF37]/40">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{language === 'TA' ? 'வரன் சரிபார்ப்பு & ஒப்புதல் மையம்' : 'Profile Verification & Approval Console'}</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-serif font-black tracking-tight text-white">
                {language === 'TA' ? 'நம்ம மேட்ரிமோனி - நிர்வாகப் பலகை' : 'Namma Matrimony Admin Console'}
              </h1>
              <p className="text-xs sm:text-sm text-rose-100/90 max-w-xl leading-relaxed">
                {language === 'TA'
                  ? 'பதிவு செய்யப்பட்ட வரன் சுயவிவரங்கள், சான்றிதழ்கள் மற்றும் ஜாதகங்களை ஆய்வு செய்து ஒப்புதல் (Approve) அல்லது நிராகரிப்பு (Deny) செய்க.'
                  : 'Review submitted candidate biodatas, documents, and astrology charts. Approve genuine profiles for live matching or deny invalid submissions.'}
              </p>
            </div>

            {/* Quick Stat Counter Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 shrink-0">
              <div
                onClick={() => setStatusFilter('ALL')}
                className={`p-3 sm:p-4 rounded-2xl text-center cursor-pointer transition-all border ${
                  statusFilter === 'ALL' ? 'bg-white/20 border-white ring-2 ring-white/50' : 'bg-white/10 border-white/20 hover:bg-white/15'
                }`}
              >
                <span className="text-[10px] sm:text-xs text-rose-200 uppercase font-bold block">
                  {language === 'TA' ? 'மொத்தம்' : 'Total'}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white font-serif">{stats.total}</span>
              </div>

              <div
                onClick={() => setStatusFilter('PENDING')}
                className={`p-3 sm:p-4 rounded-2xl text-center cursor-pointer transition-all border ${
                  statusFilter === 'PENDING'
                    ? 'bg-amber-500/30 border-amber-300 ring-2 ring-amber-300'
                    : 'bg-amber-500/15 border-amber-400/40 hover:bg-amber-500/20'
                }`}
              >
                <span className="text-[10px] sm:text-xs text-amber-200 uppercase font-bold block flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  {language === 'TA' ? 'நிலுவை' : 'Pending'}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-amber-300 font-serif">{stats.pending}</span>
              </div>

              <div
                onClick={() => setStatusFilter('APPROVED')}
                className={`p-3 sm:p-4 rounded-2xl text-center cursor-pointer transition-all border ${
                  statusFilter === 'APPROVED'
                    ? 'bg-emerald-500/30 border-emerald-300 ring-2 ring-emerald-300'
                    : 'bg-emerald-500/15 border-emerald-400/40 hover:bg-emerald-500/20'
                }`}
              >
                <span className="text-[10px] sm:text-xs text-emerald-200 uppercase font-bold block">
                  {language === 'TA' ? 'ஒப்புதல்' : 'Approved'}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-300 font-serif">{stats.approved}</span>
              </div>

              <div
                onClick={() => setStatusFilter('REJECTED')}
                className={`p-3 sm:p-4 rounded-2xl text-center cursor-pointer transition-all border ${
                  statusFilter === 'REJECTED'
                    ? 'bg-rose-500/30 border-rose-300 ring-2 ring-rose-300'
                    : 'bg-rose-500/15 border-rose-400/40 hover:bg-rose-500/20'
                }`}
              >
                <span className="text-[10px] sm:text-xs text-rose-200 uppercase font-bold block">
                  {language === 'TA' ? 'நிராகரிப்பு' : 'Denied'}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-rose-300 font-serif">{stats.rejected}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. FILTER & SEARCH TOOLBAR */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-primary/15 shadow-sm space-y-3.5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl overflow-x-auto">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'ALL'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {language === 'TA' ? 'அனைத்து வரன்கள்' : 'All Profiles'} ({stats.total})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === 'PENDING'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-gray-700 hover:text-amber-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>{language === 'TA' ? 'பரிசீலனைக்கு (Pending)' : 'Needs Review'}</span>
                <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">{stats.pending}</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('APPROVED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'APPROVED'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-gray-700 hover:text-emerald-800'
                }`}
              >
                {language === 'TA' ? 'ஒப்புதல் பெற்றவை' : 'Approved'} ({stats.approved})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('REJECTED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'REJECTED'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'text-gray-700 hover:text-rose-800'
                }`}
              >
                {language === 'TA' ? 'நிராகரிக்கப்பட்டவை' : 'Denied'} ({stats.rejected})
              </button>
            </div>

            {/* Gender Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl self-start md:self-auto">
              <button
                type="button"
                onClick={() => setGenderFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  genderFilter === 'ALL' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
                }`}
              >
                {language === 'TA' ? 'இருபாலர்' : 'Both'}
              </button>
              <button
                type="button"
                onClick={() => setGenderFilter('MALE')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  genderFilter === 'MALE' ? 'bg-primary text-white shadow-xs' : 'text-gray-600'
                }`}
              >
                {language === 'TA' ? 'மணமகன்' : 'Grooms'}
              </button>
              <button
                type="button"
                onClick={() => setGenderFilter('FEMALE')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  genderFilter === 'FEMALE' ? 'bg-primary text-white shadow-xs' : 'text-gray-600'
                }`}
              >
                {language === 'TA' ? 'மணமகள்' : 'Brides'}
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'TA'
                  ? 'வரன் பெயர், பதிவு எண் (nm-0001), மொபைல் எண், ஊர் அல்லது சமூகம் மூலம் தேடுக...'
                  : 'Search by candidate name, registration ID (nm-0001), mobile, city, or community...'
              }
              className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 text-xs sm:text-sm font-medium focus:border-primary focus:bg-white focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 4. PROFILES LIST */}
        {isLoading ? (
          <div className="bg-white rounded-3xl border border-primary/15 p-12 text-center space-y-3">
            <BrandLogo size="md" />
            <p className="text-xs sm:text-sm font-bold text-primary animate-pulse">
              {language === 'TA' ? 'வரன் பதிவுகள் ஏற்றப்படுகின்றன...' : 'Loading Candidate Registrations...'}
            </p>
          </div>
        ) : errorMsg ? (
          <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-8 text-center space-y-3 text-rose-800">
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
            <h3 className="text-base font-bold">{errorMsg}</h3>
            <button
              onClick={() => fetchProfiles(true)}
              className="px-5 py-2 rounded-full bg-rose-600 text-white font-bold text-xs"
            >
              Retry
            </button>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-primary/20 p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Users className="w-7 h-7 text-[#D4AF37]" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-primary font-serif">
              {language === 'TA' ? 'வரன் பதிவுகள் எதுவும் கிடைக்கவில்லை' : 'No Candidate Registrations Found'}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {language === 'TA'
                ? 'தேர்ந்தெடுக்கப்பட்ட வடிகட்டிகளில் பதிவுகள் இல்லை. வடிகட்டிகளை மாற்றி மீண்டும் முயற்சிக்கவும்.'
                : 'No registered profiles match the selected status or search keywords.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-bold text-gray-500">
              <div className="flex items-center gap-2">
                <span>
                  {language === 'TA' ? 'காட்டப்படும் வரன்கள்' : 'Showing Profiles'}: <strong className="text-gray-800">{filteredProfiles.length}</strong>
                </span>
                <span>•</span>
                <span>
                  {language === 'TA' ? 'நிலுவை' : 'Pending'}: <strong className="text-amber-700">{stats.pending}</strong>
                </span>
              </div>

              {/* Expand / Collapse All Toggle Button */}
              {filteredProfiles.length > 0 && (
                <button
                  type="button"
                  onClick={toggleExpandAll}
                  className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline cursor-pointer bg-primary/5 hover:bg-primary/10 px-3 py-1 rounded-full border border-primary/20 transition-all"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isAllExpanded ? 'rotate-180' : ''}`} />
                  <span>
                    {isAllExpanded
                      ? (language === 'TA' ? 'அனைத்தையும் சுருக்கு' : 'Collapse All')
                      : (language === 'TA' ? 'அனைத்து விவரங்களையும் காண்க' : 'Expand All Details')}
                  </span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {filteredProfiles.map((candidate, idx) => {
                const cDisplayId = candidate.displayId || candidate.registrationId || `nm-000${idx + 1}`;
                const cName = candidate.name || candidate.fullName || 'பெயர் குறிப்பிடப்படவில்லை';
                const isBride = candidate.gender === 'FEMALE';
                const cAge = calculateAge(candidate.dob) || candidate.age;
                const cPhoto = candidate.photoUrl || candidate.profilePhotoUrl;
                const status = candidate.status || 'PENDING';
                const isApproved = status === 'APPROVED';
                const isRejected = status === 'REJECTED';
                const isPending = status === 'PENDING';
                const isUpdating = actionInProgressId === (candidate.id || candidate.displayId);
                const cKey = candidate.id || candidate.displayId || idx.toString();
                const isExpanded = !!expandedProfileIds[cKey];

                return (
                  <div
                    key={cKey}
                    className={`bg-white rounded-2xl sm:rounded-3xl border-2 shadow-xs transition-all overflow-hidden ${
                      isPending
                        ? 'border-amber-300 ring-1 ring-amber-100'
                        : isApproved
                          ? 'border-emerald-300/80'
                          : 'border-rose-200 bg-rose-50/10'
                    }`}
                  >
                    {/* 1. CLICKABLE COMPACT SUMMARY ROW (Always visible - Click to toggle details) */}
                    <div
                      onClick={() => toggleProfileExpand(cKey)}
                      className={`p-3.5 sm:p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer transition-all select-none ${
                        isExpanded
                          ? 'bg-[#FFFDF9] border-b border-gray-100 shadow-2xs'
                          : 'bg-white hover:bg-amber-50/30'
                      }`}
                      title={language === 'TA' ? 'விவரங்களைக் காண / மறைக்க கிளிக் செய்யவும்' : 'Click to view / hide profile details'}
                    >
                      {/* Left: Avatar, ID, Name, Quick Highlights */}
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        {/* Avatar Thumbnail */}
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-gray-100 border border-primary/20 shrink-0 relative shadow-2xs">
                          {cPhoto ? (
                            <img src={cPhoto} alt={cName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <User className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                              {cDisplayId}
                            </span>
                            <h3 className="text-base sm:text-lg font-black text-gray-900 font-serif truncate">
                              {cName}
                            </h3>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isBride ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {isBride ? (language === 'TA' ? 'மணமகள்' : 'Bride') : (language === 'TA' ? 'மணமகன்' : 'Groom')}
                            </span>
                          </div>

                          {/* Quick Highlights Summary Line */}
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-gray-600 font-medium">
                            {cAge && (
                              <span className="text-gray-800 font-bold">
                                {cAge} {language === 'TA' ? 'வயது' : 'Yrs'}
                              </span>
                            )}
                            <span>•</span>
                            <span className="text-gray-800 font-semibold truncate max-w-xs">
                              {candidate.caste || (language === 'TA' ? 'அனைத்து தமிழ் சமூகம்' : 'All Tamil')}
                              {candidate.koottam || candidate.kootam ? ` (${candidate.koottam || candidate.kootam})` : ''}
                            </span>
                            {(candidate.city || candidate.state) && (
                              <>
                                <span>•</span>
                                <span className="text-gray-500 truncate flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-primary/70 shrink-0" />
                                  <span>{[candidate.city, candidate.state].filter(Boolean).join(', ')}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Status Pill, Quick Actions, and Expand Toggle */}
                      <div
                        className="flex items-center justify-between md:justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                            isPending
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : isApproved
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {isPending && <Clock className="w-3 h-3 text-amber-600 animate-pulse" />}
                          {isApproved && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {isRejected && <XCircle className="w-3 h-3 text-rose-600" />}
                          <span>
                            {isPending
                              ? (language === 'TA' ? 'நிலுவை (Pending)' : 'Pending')
                              : isApproved
                                ? (language === 'TA' ? 'ஒப்புதல் (Approved)' : 'Approved')
                                : (language === 'TA' ? 'நிராகரிப்பு (Denied)' : 'Denied')}
                          </span>
                        </span>

                        {/* Quick Action: Approve */}
                        {!isApproved && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(candidate, 'APPROVED')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center gap-1 hover:scale-105"
                            title="Approve Profile"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{language === 'TA' ? 'ஒப்புதல்' : 'Approve'}</span>
                          </button>
                        )}

                        {/* Quick Action: Deny */}
                        {!isRejected && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => {
                              setCandidateToDeny(candidate);
                              setDenyReason('Incomplete or unverified details');
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-full font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
                            title="Deny Profile"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{language === 'TA' ? 'நிராகரி' : 'Deny'}</span>
                          </button>
                        )}

                        {/* Expand / Collapse Button */}
                        <button
                          type="button"
                          onClick={() => toggleProfileExpand(cKey)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs transition-all cursor-pointer ${
                            isExpanded
                              ? 'bg-primary text-white shadow-xs'
                              : 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20'
                          }`}
                        >
                          <span>
                            {isExpanded
                              ? (language === 'TA' ? 'மறைக்க' : 'Hide')
                              : (language === 'TA' ? 'விவரங்கள்' : 'View Info')}
                          </span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => setCandidateToDelete(candidate)}
                          className="bg-gray-100 hover:bg-rose-100 text-gray-500 hover:text-rose-600 p-1.5 rounded-full transition-all cursor-pointer"
                          title="Permanently Delete Profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* 2. EXPANDABLE DETAILS BODY: ONLY SHOWN WHEN CLICKED! */}
                    {isExpanded && (
                      <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                        {/* Candidate Details Grid */}
                        <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 sm:gap-6">
                      
                      {/* Photo Thumbnail */}
                      <div className="shrink-0 flex sm:flex-col items-center gap-3">
                        <div
                          onClick={() => cPhoto && setPreviewPhotoUrl(cPhoto)}
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-100 border-2 border-primary/20 shadow-xs relative group cursor-pointer"
                        >
                          {cPhoto ? (
                            <>
                              <img
                                src={cPhoto}
                                alt={cName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-all"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Eye className="w-5 h-5" />
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-2 text-center">
                              <User className="w-8 h-8 mb-1" />
                              <span className="text-[10px] font-bold">No Photo</span>
                            </div>
                          )}
                        </div>

                        {cPhoto && (
                          <button
                            type="button"
                            onClick={() => setPreviewPhotoUrl(cPhoto)}
                            className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <ImageIcon className="w-3 h-3 text-[#D4AF37]" />
                            <span>{language === 'TA' ? 'படம் பெரிதாக்குக' : 'Zoom Photo'}</span>
                          </button>
                        )}
                      </div>

                      {/* Info Columns */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs">
                        
                        {/* Column 1: Personal & Community */}
                        <div className="space-y-1.5 bg-[#FFFDF9] p-3 rounded-xl border border-primary/10">
                          <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
                            {language === 'TA' ? 'அடிப்படை விவரங்கள்' : 'Personal & Caste'}
                          </h4>
                          <p className="font-extrabold text-gray-900 text-sm font-serif">{cName}</p>
                          <p className="text-gray-700 font-semibold">
                            {cAge ? `${cAge} வயது` : ''} {candidate.dob ? `(${candidate.dob.substring(0, 10)})` : ''}
                          </p>
                          <p className="text-gray-800 font-bold">
                            {candidate.caste || 'அனைத்து தமிழ் சமூகம்'}
                            {candidate.koottam || candidate.kootam ? ` • ${candidate.koottam || candidate.kootam}` : ''}
                          </p>
                          <p className="text-gray-600 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>{candidate.city || 'Tamil Nadu'}, {candidate.state || 'India'}</span>
                          </p>
                        </div>

                        {/* Column 2: Career, Education & Family */}
                        <div className="space-y-1.5 bg-[#FFFDF9] p-3 rounded-xl border border-primary/10">
                          <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
                            {language === 'TA' ? 'பணி & குடும்பம்' : 'Career & Family'}
                          </h4>
                          <p className="text-gray-800 flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="font-semibold">{candidate.education || candidate.qualification || (language === 'TA' ? 'பட்டம் குறிப்பிடப்படவில்லை' : 'Not specified')}</span>
                          </p>

                          {/* Rich Career Display */}
                          {(() => {
                            const isBiz = String(candidate.workNature).toUpperCase().includes('BUSINESS');
                            const isGovt = String(candidate.workNature).toUpperCase().includes('GOVT');
                            const isNri = String(candidate.workNature).toUpperCase().includes('NRI');
                            const role = candidate.designation || (isBiz ? (language === 'TA' ? 'சொந்த தொழில்' : 'Business') : '');
                            const comp = candidate.companyName || candidate.organisation || '';
                            const natureTag = isBiz
                              ? (language === 'TA' ? 'வணிகம்' : 'Business')
                              : isGovt
                              ? (language === 'TA' ? 'அரசு' : 'Govt')
                              : isNri
                              ? 'NRI'
                              : (language === 'TA' ? 'தனியார்' : 'Private');
                            const income = candidate.annualIncome || candidate.salary || candidate.income;

                            return (
                              <div className="space-y-0.5">
                                <p className="text-gray-900 flex items-start gap-1.5 text-xs">
                                  <Briefcase className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                  <span className="leading-tight">
                                    <span className="font-bold">
                                      {role || (language === 'TA' ? 'பணி குறிப்பிடப்படவில்லை' : 'Not specified')}
                                    </span>
                                    {comp && <span className="text-gray-700"> @ {comp}</span>}
                                    <span className="ml-1 text-[9px] font-black px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">
                                      {natureTag}
                                    </span>
                                  </span>
                                </p>
                                <p className="text-gray-700 text-xs">
                                  <span className="font-bold">{language === 'TA' ? 'வருமானம்:' : 'Income:'}</span>{' '}
                                  <span className="font-semibold text-emerald-800">
                                    {income && income !== 'Not mentioned' ? income : (language === 'TA' ? 'நேரடி பேச்சில்' : 'Disclosed during talk')}
                                  </span>
                                  {candidate.workCity && (
                                    <span className="text-gray-500 font-normal"> • {candidate.workCity}</span>
                                  )}
                                </p>
                              </div>
                            );
                          })()}

                          {/* Parents & Siblings Information */}
                          <div className="pt-1 border-t border-gray-100 text-xs space-y-0.5">
                            <p className="text-gray-700">
                              <span className="font-bold">{language === 'TA' ? 'தந்தை:' : 'Father:'}</span>{' '}
                              <span className="font-semibold text-gray-900">
                                {candidate.fatherName || candidate.family?.fatherName || candidate.jathagamData?.fatherName || '-'}
                              </span>
                              {candidate.fatherOccupation && (
                                <span className="text-gray-500 text-[11px]"> ({candidate.fatherOccupation})</span>
                              )}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-bold">{language === 'TA' ? 'தாய்:' : 'Mother:'}</span>{' '}
                              <span className="font-semibold text-gray-900">
                                {candidate.motherName || candidate.family?.motherName || candidate.jathagamData?.motherName || '-'}
                              </span>
                              {candidate.motherOccupation && (
                                <span className="text-gray-500 text-[11px]"> ({candidate.motherOccupation})</span>
                              )}
                            </p>
                            {Array.isArray(candidate.siblingsList) && candidate.siblingsList.length > 0 && (
                              <p className="text-gray-600 text-[11px]">
                                <span className="font-bold">{language === 'TA' ? 'உடன்பிறப்பு:' : 'Siblings:'}</span>{' '}
                                <span className="font-semibold text-primary">{candidate.siblingsList.length} {language === 'TA' ? 'பேர்' : 'members'}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Column 3: Astrology & Contacts */}
                        <div className="space-y-1.5 bg-[#FFFDF9] p-3 rounded-xl border border-primary/10">
                          <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
                            {language === 'TA' ? 'ஜாதகம் & தொடர்பு' : 'Horoscope & Contact'}
                          </h4>
                          <p className="text-gray-800 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                            <span className="font-semibold">
                              {candidate.rasi || '-'} • {candidate.nakshatra || candidate.nakshatram || '-'}
                            </span>
                          </p>
                          <p className="text-gray-700">
                            <span className="font-bold">{language === 'TA' ? 'தோஷம்:' : 'Dosham:'}</span> {candidate.dosham || (language === 'TA' ? 'சுத்த ஜாதகம்' : 'Sutham')}
                          </p>
                          <p className="text-gray-800 font-mono font-bold flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{candidate.userContact?.mobile || candidate.profileCreatedBy || candidate.whatsappNumber || '-'}</span>
                          </p>
                          {candidate.userContact?.email && (
                            <p className="text-gray-600 flex items-center gap-1 truncate text-[11px]">
                              <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="truncate">{candidate.userContact.email}</span>
                            </p>
                          )}

                          {/* Attached Documents Links */}
                          <div className="pt-1 flex flex-wrap gap-1.5">
                            {candidate.jathakamUrl && (
                              <a
                                href={candidate.jathakamUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md text-[10px] font-bold"
                              >
                                <FileText className="w-3 h-3 text-[#D4AF37]" />
                                <span>{language === 'TA' ? 'ஜாதகம் PDF' : 'Horoscope'}</span>
                              </a>
                            )}
                            {candidate.idProofUrl && (
                              <a
                                href={candidate.idProofUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md text-[10px] font-bold"
                              >
                                <ShieldCheck className="w-3 h-3 text-blue-600" />
                                <span>{language === 'TA' ? 'அரசு ID' : 'Govt ID'}</span>
                              </a>
                            )}
                            {candidate.casteCertificateUrl && (
                              <a
                                href={candidate.casteCertificateUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-md text-[10px] font-bold"
                              >
                                <FileText className="w-3 h-3 text-purple-600" />
                                <span>{language === 'TA' ? 'சாதிச் சான்றிதழ்' : 'Caste Cert'}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rejection Reason if any */}
                    {isRejected && candidate.rejectedReason && (
                      <div className="mx-4 sm:mx-6 mb-3 bg-rose-50 border border-rose-200 rounded-xl p-2.5 flex items-center gap-2 text-xs text-rose-800">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>
                          <strong>{language === 'TA' ? 'நிராகரிப்பு காரணம்:' : 'Denial Reason:'}</strong> {candidate.rejectedReason}
                        </span>
                      </div>
                    )}

                    {/* ACTION TOOLBAR: APPROVE / DENY / RESET / VIEW / DELETE */}
                    <div className="bg-[#FFFDF9] border-t border-gray-100 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2.5">
                      
                      {/* Left: View Full Biodata */}
                      <button
                        type="button"
                        onClick={() => setSelectedBiodataCandidate(candidate)}
                        className="bg-primary hover:bg-primary-light text-white px-3.5 sm:px-4 py-2 rounded-full font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{language === 'TA' ? 'முழு பயோடேட்டா காண்க' : 'View Full Akshayam Biodata'}</span>
                      </button>

                      {/* Right: Decision Controls */}
                      <div className="flex items-center gap-2 flex-wrap">
                        
                        {/* APPROVE BUTTON */}
                        {!isApproved && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(candidate, 'APPROVED')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{language === 'TA' ? 'ஒப்புதல் அளி (Approve)' : 'Approve Profile'}</span>
                          </button>
                        )}

                        {/* DENY BUTTON */}
                        {!isRejected && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => {
                              setCandidateToDeny(candidate);
                              setDenyReason('Incomplete or unverified details');
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>{language === 'TA' ? 'நிராகரி (Deny)' : 'Deny / Reject'}</span>
                          </button>
                        )}

                        {/* RESET TO PENDING (If already approved or rejected) */}
                        {!isPending && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(candidate, 'PENDING')}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-full font-bold text-xs transition-all cursor-pointer"
                            title="Reset back to Pending"
                          >
                            <span>{language === 'TA' ? 'நிலுவையில் வை' : 'Reset to Pending'}</span>
                          </button>
                        )}

                        {/* PERMANENT DELETE BUTTON */}
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => setCandidateToDelete(candidate)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 p-2 rounded-full transition-all cursor-pointer"
                          title="Permanently Delete Profile"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
              })}
            </div>
          </div>
        )}
          </>
        )}
      </div>

      {/* 5. MODAL: DENY / REJECT CONFIRMATION */}
      {candidateToDeny && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-primary/20 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-gray-900 font-serif">
                {language === 'TA' ? 'வரனை நிராகரிக்க வேண்டுமா?' : 'Deny Candidate Profile?'}
              </h3>
              <p className="text-xs text-gray-600">
                {language === 'TA'
                  ? `"${candidateToDeny.name || candidateToDeny.displayId}" அவர்களின் பதிவை நிராகரிப்பதற்கான காரணத்தை தேர்வு செய்யவும்.`
                  : `Please specify the reason for denying "${candidateToDeny.name || candidateToDeny.displayId}".`}
              </p>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <label className="font-bold text-gray-700 block">
                {language === 'TA' ? 'நிராகரிப்பு காரணம்:' : 'Reason for Denial:'}
              </label>

              {[
                { ta: 'தவறான அல்லது தெளிவற்ற புகைப்படம்', en: 'Blurry or invalid profile photograph' },
                { ta: 'முழுமையற்ற குடும்ப விவரங்கள்', en: 'Incomplete or missing family background' },
                { ta: 'தவறான தொடர்பு எண்', en: 'Invalid or unreachable mobile number' },
                { ta: 'ஏற்கனவே பதிவு செய்யப்பட்ட வரன்', en: 'Duplicate registration entry' },
                { ta: 'ஜாதகக் கட்ட விவரங்கள் தவறாக உள்ளன', en: 'Astrology chart mismatch' },
              ].map((reasonItem, rIdx) => (
                <label
                  key={rIdx}
                  className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 bg-[#FFFDF9] hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="denyReasonOption"
                    checked={denyReason === (language === 'TA' ? reasonItem.ta : reasonItem.en)}
                    onChange={() => setDenyReason(language === 'TA' ? reasonItem.ta : reasonItem.en)}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="font-medium text-gray-800">
                    {language === 'TA' ? reasonItem.ta : reasonItem.en}
                  </span>
                </label>
              ))}

              <div className="pt-1">
                <input
                  type="text"
                  value={denyReason}
                  onChange={(e) => setDenyReason(e.target.value)}
                  placeholder={language === 'TA' ? 'அல்லது பிற காரணத்தை தட்டச்சு செய்யவும்...' : 'Or enter custom reason...'}
                  className="w-full h-10 px-3 rounded-xl border border-gray-300 text-xs text-gray-900 font-medium focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setCandidateToDeny(null)}
                className="flex-1 py-2.5 px-4 rounded-full border border-gray-300 text-gray-700 font-bold text-xs sm:text-sm hover:bg-gray-100 transition-all cursor-pointer"
              >
                {language === 'TA' ? 'ரத்து செய்க' : 'Cancel'}
              </button>

              <button
                type="button"
                disabled={actionInProgressId !== null}
                onClick={() => handleUpdateStatus(candidateToDeny, 'REJECTED', denyReason)}
                className="flex-1 py-2.5 px-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>
                  {actionInProgressId ? (language === 'TA' ? 'செயல்படுகிறது...' : 'Processing...') : (language === 'TA' ? 'ஆம், நிராகரி' : 'Confirm Deny')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: DELETE CONFIRMATION */}
      {candidateToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-primary/20 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-gray-900 font-serif">
                {language === 'TA' ? 'வரனை நிரந்தரமாக நீக்க வேண்டுமா?' : 'Permanently Delete Profile?'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {language === 'TA'
                  ? `நீங்கள் "${candidateToDelete.name || candidateToDelete.displayId}" அவர்களின் பதிவை தரவுத்தளத்தில் இருந்து நிரந்தரமாக நீக்க விரும்புகிறீர்களா? இதை மீட்டெடுக்க முடியாது.`
                  : `Are you sure you want to permanently delete "${candidateToDelete.name || candidateToDelete.displayId}" from the database? This action cannot be reversed.`}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCandidateToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-full border border-gray-300 text-gray-700 font-bold text-xs sm:text-sm hover:bg-gray-100 transition-all cursor-pointer"
              >
                {language === 'TA' ? 'ரத்து செய்க' : 'Cancel'}
              </button>

              <button
                type="button"
                disabled={actionInProgressId !== null}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>
                  {actionInProgressId ? (language === 'TA' ? 'நீக்கப்படுகிறது...' : 'Deleting...') : (language === 'TA' ? 'ஆம், நீக்குக' : 'Yes, Delete')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: FULL AKSHAYAM BIODATA PREVIEW */}
      {selectedBiodataCandidate && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm overflow-y-auto p-2 sm:p-6 animate-in fade-in duration-200">
          <div className="max-w-5xl mx-auto my-4 space-y-3">
            <div className="flex items-center justify-between bg-[#580016] text-white px-4 py-2.5 rounded-2xl shadow-lg">
              <button
                type="button"
                onClick={() => setSelectedBiodataCandidate(null)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full transition-all cursor-pointer border border-[#D4AF37]/50"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{language === 'TA' ? 'நிர்வாக பலகைக்குத் திரும்பு' : 'Back to Admin Console'}</span>
              </button>

              {/* Quick Decision in Biodata View */}
              <div className="flex items-center gap-2">
                {selectedBiodataCandidate.status !== 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateStatus(selectedBiodataCandidate, 'APPROVED');
                      setSelectedBiodataCandidate({ ...selectedBiodataCandidate, status: 'APPROVED' });
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                )}

                {selectedBiodataCandidate.status !== 'REJECTED' && (
                  <button
                    type="button"
                    onClick={() => {
                      setCandidateToDeny(selectedBiodataCandidate);
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Deny</span>
                  </button>
                )}
              </div>
            </div>

            <AkshayamProfileView
              profile={selectedBiodataCandidate}
              language={language}
              onBack={() => setSelectedBiodataCandidate(null)}
              onDelete={() => {
                setCandidateToDelete(selectedBiodataCandidate);
                setSelectedBiodataCandidate(null);
              }}
            />
          </div>
        </div>
      )}

      {/* 8. MODAL: PHOTO PREVIEW ZOOM */}
      {previewPhotoUrl && (
        <div
          onClick={() => setPreviewPhotoUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-2">
            <button
              onClick={() => setPreviewPhotoUrl(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10"
            >
              ✕
            </button>
            <img src={previewPhotoUrl} alt="Candidate Profile" className="w-full max-h-[80vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}

      {/* 9. FLOATING TOAST NOTIFICATION */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-bold border animate-in slide-in-from-bottom duration-300 ${
            toastMsg.type === 'error'
              ? 'bg-rose-800 border-rose-600'
              : 'bg-emerald-800 border-emerald-600'
          }`}
        >
          {toastMsg.type === 'error' ? (
            <XCircle className="w-4 h-4 text-rose-300 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}
    </div>
  );
}

