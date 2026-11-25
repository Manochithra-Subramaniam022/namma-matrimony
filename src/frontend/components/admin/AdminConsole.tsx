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
  EyeOff,
  Check,
  X,
  Shield,
  Heart,
  ChevronDown,
  Building,
  Image as ImageIcon,
  Lock,
  LogOut,
  Download,
} from 'lucide-react';
import BrandLogo from '@/frontend/components/BrandLogo';
import AkshayamProfileView from '@/frontend/components/profile/AkshayamProfileView';
import CasteKoottamManager from './CasteKoottamManager';
import { useLanguage } from '@/frontend/context/LanguageContext';
import { BRANDING } from '@/constants/branding';
import {
  DoshamGroupKey,
  DOSHAM_GROUPS,
  getProfileDoshamCategory,
  getDoshamBadgeInfo,
} from '@/frontend/utils/astrology';

export default function AdminConsole() {
  const { language, toggleLanguage } = useLanguage();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUsername, setAdminUsername] = useState('SELSOFT');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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
  const [doshamFilter, setDoshamFilter] = useState<DoshamGroupKey>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedBiodataCandidate, setSelectedBiodataCandidate] = useState<any | null>(null);
  const [candidateToDeny, setCandidateToDeny] = useState<any | null>(null);
  const [denyReason, setDenyReason] = useState('Incomplete or unverified details');
  const [candidateToDelete, setCandidateToDelete] = useState<any | null>(null);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{
    url: string;
    title: string;
    isPdf: boolean;
    candidateName?: string;
    displayId?: string;
  } | null>(null);

  const isPdfUrl = (url?: string | null): boolean => {
    if (!url) return false;
    const clean = url.split('?')[0].toLowerCase();
    return clean.endsWith('.pdf') || url.startsWith('data:application/pdf');
  };

  const getDocumentViewerUrl = (url?: string | null): string => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    if (url.startsWith('/api/storage/document')) return url;
    if (url.includes('/storage/v1/object/')) {
      return `/api/storage/document?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  const openDocPreview = (rawUrl: string, title: string, candidate: any) => {
    const safeUrl = getDocumentViewerUrl(rawUrl);
    setPreviewDoc({
      url: safeUrl,
      title,
      isPdf: isPdfUrl(rawUrl),
      candidateName: candidate.name || candidate.fullName,
      displayId: candidate.displayId || candidate.registrationId,
    });
  };

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

  // Helper to get auth header
  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('namma_admin_token') : null;
    return token ? { 'x-admin-token': token } : {};
  };

  // 1. Fetch profiles from API
  const fetchProfiles = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setIsLoading(true);
    else setIsRefreshing(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/profiles', {
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('namma_admin_token');
        }
        setIsLoading(false);
        return;
      }

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

  // Check auth status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch('/api/admin/auth', {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          fetchProfiles(true);
        } else {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      } catch {
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword,
        }),
      });

      const data = await res.json();
      if (data.success && data.token) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('namma_admin_token', data.token);
        }
        setIsAuthenticated(true);
        setAdminPassword('');
        fetchProfiles(true);
      } else {
        setLoginError(
          data.error ||
          (language === 'TA'
            ? 'தவறான பயனர் பெயர் அல்லது கடவுச்சொல். தயவுசெய்து சரியான கடவுச்சொல்லை உள்ளிடவும்.'
            : 'Invalid username or password. Please try again.')
        );
      }
    } catch (err: any) {
      setLoginError(err.message || 'Failed to authenticate');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch { }
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('namma_admin_token');
    }
    setIsAuthenticated(false);
    setProfiles([]);
    setAdminPassword('');
    showToast(language === 'TA' ? 'நிர்வாக பலகையிலிருந்து வெளியேறப்பட்டது' : 'Logged out from Admin Console');
  };

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

      // 5-Dosham filter
      if (doshamFilter !== 'ALL') {
        const cat = getProfileDoshamCategory(p);
        if (cat !== doshamFilter) return false;
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
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          profileId: targetId,
          status: newStatus,
          rejectedReason: reason || null,
          approvedBy: 'ADMIN_CONSOLE',
        }),
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        showToast('Session expired. Please log in again.', 'error');
        return;
      }

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
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        showToast('Session expired. Please log in again.', 'error');
        return;
      }

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

  // 0. AUTHENTICATION SCREENS
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col justify-center items-center p-4">
        <RefreshCw className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-xs font-bold text-gray-500 font-serif">
          {language === 'TA' ? 'நிர்வாக பலகை சரிபார்க்கப்படுகிறது...' : 'Authenticating Admin Console...'}
        </p>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col justify-center items-center p-4 selection:bg-primary/20">
        <div className="max-w-md w-full bg-white rounded-3xl border-2 border-[#D4AF37]/50 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="h-3 w-full bg-gradient-to-r from-primary via-[#D4AF37] to-primary"></div>
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-1">
                <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-primary">
                {language === 'TA' ? 'நிர்வாக பலகை உள்நுழைவு' : 'Admin Console Login'}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {language === 'TA'
                  ? 'நம்ம மேட்ரிமோனி வரன்களை ஆய்வு செய்து ஒப்புதல் அளிக்க கடவுச்சொல்லை உள்ளிடவும்'
                  : 'Enter admin credentials to review and approve candidate profiles'}
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  {language === 'TA' ? 'பயனர் பெயர் (Username)' : 'Username'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 font-semibold text-sm focus:border-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  {language === 'TA' ? 'கடவுச்சொல் (Password)' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-300 bg-white text-gray-900 font-semibold text-sm focus:border-primary focus:outline-none"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full h-11 bg-primary hover:bg-primary-light text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
                    <span>{language === 'TA' ? 'சரிபார்க்கப்படுகிறது...' : 'Authenticating...'}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                    <span>{language === 'TA' ? 'உள்நுழைக (Sign In)' : 'Sign In'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" />
                <span>{language === 'TA' ? 'முகப்புக்குச் செல்க' : 'Back to Home'}</span>
              </Link>
              <span>{BRANDING.brandName} Secure Admin</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-700 transition-all cursor-pointer shadow-2xs"
              title="Logout from Admin Console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'TA' ? 'வெளியேறு' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 space-y-6">
        
        {/* 1.5 ADMIN NAVIGATION & COMPACT STATS TOOLBAR (DE-CONGESTED / NO QUOTES) */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-primary/15 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAdminActiveTab('PROFILES')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                adminActiveTab === 'PROFILES'
                  ? 'bg-primary text-white shadow-sm'
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
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                adminActiveTab === 'CASTE_KOOTTAM'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-stone-50 text-gray-700 hover:bg-stone-100 hover:text-primary border border-gray-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>{language === 'TA' ? 'சாதி & கூட்டம் மேலாண்மை' : 'Caste & Koottam Manager'}</span>
            </button>
          </div>
        </div>

        {adminActiveTab === 'CASTE_KOOTTAM' ? (
          <CasteKoottamManager language={language} showToast={showToast} />
        ) : (
          <>

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

            {/* 5 Dosham Group Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl overflow-x-auto self-start md:self-auto">
              {DOSHAM_GROUPS.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setDoshamFilter(d.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                    doshamFilter === d.key
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>{d.icon}</span>
                  <span>{language === 'TA' ? d.shortTa : d.shortEn}</span>
                </button>
              ))}
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
                  ? 'வரன் பெயர், எண், ஊர் அல்லது சமூகம் மூலம் தேடுக...'
                  : 'Search by candidate name, ID, city, or community...'
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
          <div className="bg-white rounded-3xl border border-primary/15 p-12 text-center space-y-3 shadow-xs">
            <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
            <h3 className="text-sm sm:text-base font-bold text-primary font-serif">
              {language === 'TA' ? 'வரன் பதிவுகள் தரவுத்தளத்திலிருந்து ஏற்றப்படுகின்றன...' : 'Loading Candidate Registrations...'}
            </h3>
            <p className="text-xs text-gray-400">
              {language === 'TA' ? 'தயவுசெய்து சில வினாடிகள் காத்திருக்கவும்' : 'Please wait a few seconds'}
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
                const rawPhoto = candidate.photoUrl || candidate.profilePhotoUrl;
                const cPhoto = getDocumentViewerUrl(rawPhoto);
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

                            {/* 5-Dosham Badge */}
                            {(() => {
                              const dCat = getProfileDoshamCategory(candidate);
                              const grp = getDoshamBadgeInfo(dCat);
                              return (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${grp.badgeBg} ${grp.badgeBorder} ${grp.badgeText}`}>
                                  <span>{grp.icon}</span>
                                  <span>{language === 'TA' ? grp.shortTa : grp.shortEn}</span>
                                </span>
                              );
                            })()}
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

                          {/* Quick Document Badges (Click to preview directly!) */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            {candidate.idProofUrl && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDocPreview(
                                    candidate.idProofUrl,
                                    language === 'TA' ? 'அரசு அடையாள அட்டை (Govt ID Proof)' : 'Govt ID Proof',
                                    candidate
                                  );
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-2xs transition-all cursor-pointer"
                                title={language === 'TA' ? 'அரசு ID பார்வைக்கு கிளிக் செய்க' : 'Click to preview Govt ID Proof'}
                              >
                                <ShieldCheck className="w-3 h-3 text-blue-600 shrink-0" />
                                <span>{language === 'TA' ? 'அரசு ID' : 'Govt ID'}</span>
                              </button>
                            )}
                            {candidate.casteCertificateUrl && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDocPreview(
                                    candidate.casteCertificateUrl,
                                    language === 'TA' ? 'சாதிச் சான்றிதழ் (Caste Certificate)' : 'Caste Certificate',
                                    candidate
                                  );
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 shadow-2xs transition-all cursor-pointer"
                                title={language === 'TA' ? 'சாதிச் சான்றிதழ் பார்வைக்கு கிளிக் செய்க' : 'Click to preview Caste Certificate'}
                              >
                                <FileText className="w-3 h-3 text-purple-600 shrink-0" />
                                <span>{language === 'TA' ? 'சாதிச் சான்று' : 'Caste Cert'}</span>
                              </button>
                            )}
                            {(candidate.jathakamUrl || candidate.horoscopeUrl) && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDocPreview(
                                    candidate.jathakamUrl || candidate.horoscopeUrl,
                                    language === 'TA' ? 'ஜாதக அசல் நகல் (Horoscope Document)' : 'Horoscope Document',
                                    candidate
                                  );
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs transition-all cursor-pointer"
                                title={language === 'TA' ? 'ஜாதக நகல் பார்வைக்கு கிளிக் செய்க' : 'Click to preview Horoscope Copy'}
                              >
                                <Sparkles className="w-3 h-3 text-[#D4AF37] shrink-0" />
                                <span>{language === 'TA' ? 'ஜாதகம்' : 'Horoscope'}</span>
                              </button>
                            )}
                            {cPhoto && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDocPreview(
                                    cPhoto,
                                    language === 'TA' ? 'சுயவிவரப் புகைப்படம் (Profile Photo)' : 'Profile Photo',
                                    candidate
                                  );
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs transition-all cursor-pointer"
                                title={language === 'TA' ? 'சுயவிவர படம் பார்வைக்கு கிளிக் செய்க' : 'Click to preview Profile Photo'}
                              >
                                <ImageIcon className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>{language === 'TA' ? 'படம்' : 'Photo'}</span>
                              </button>
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
                          onClick={() => cPhoto && setPreviewPhotoUrl(getDocumentViewerUrl(cPhoto))}
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-100 border-2 border-primary/20 shadow-xs relative group cursor-pointer"
                        >
                          {cPhoto ? (
                            <>
                              <img
                                src={getDocumentViewerUrl(cPhoto)}
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
                            onClick={() => setPreviewPhotoUrl(getDocumentViewerUrl(cPhoto))}
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
                          {/* Education (only if present) */}
                          {(candidate.education || candidate.qualification) && (
                            <p className="text-gray-800 flex items-center gap-1">
                              <GraduationCap className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="font-semibold">{candidate.education || candidate.qualification}</span>
                            </p>
                          )}

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
                            const rawIncome = candidate.monthlyIncome || candidate.salary || candidate.income || candidate.annualIncome;
                            const formatIncome = (val: any) => {
                              if (!val || val === 'Not mentioned' || val === 'nil' || val === 'none') return null;
                              const s = String(val).trim();
                              return s.startsWith('₹') ? `${s}/மாதம்` : `₹${s}/மாதம்`;
                            };
                            const income = formatIncome(rawIncome);

                            return (
                              <div className="space-y-0.5">
                                {(role || comp) && (
                                  <p className="text-gray-900 flex items-start gap-1.5 text-xs">
                                    <Briefcase className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                    <span className="leading-tight">
                                      <span className="font-bold">{role || comp}</span>
                                      {role && comp && <span className="text-gray-700"> @ {comp}</span>}
                                      <span className="ml-1 text-[9px] font-black px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">
                                        {natureTag}
                                      </span>
                                    </span>
                                  </p>
                                )}
                                {income && (
                                  <p className="text-gray-700 text-xs">
                                    <span className="font-bold">{language === 'TA' ? 'வருமானம்:' : 'Income:'}</span>{' '}
                                    <span className="font-semibold text-emerald-800">{income}</span>
                                    {candidate.workCity && (
                                      <span className="text-gray-500 font-normal"> • {candidate.workCity}</span>
                                    )}
                                  </p>
                                )}
                              </div>
                            );
                          })()}

                          {/* Parents & Siblings Information */}
                          <div className="pt-1 border-t border-gray-100 text-xs space-y-0.5">
                            {(candidate.fatherName || candidate.family?.fatherName || candidate.jathagamData?.fatherName) && (
                              <p className="text-gray-700">
                                <span className="font-bold">{language === 'TA' ? 'தந்தை:' : 'Father:'}</span>{' '}
                                <span className="font-semibold text-gray-900">
                                  {candidate.fatherName || candidate.family?.fatherName || candidate.jathagamData?.fatherName}
                                </span>
                                {candidate.fatherOccupation && (
                                  <span className="text-gray-500 text-[11px]"> ({candidate.fatherOccupation})</span>
                                )}
                              </p>
                            )}
                            {(candidate.motherName || candidate.family?.motherName || candidate.jathagamData?.motherName) && (
                              <p className="text-gray-700">
                                <span className="font-bold">{language === 'TA' ? 'தாய்:' : 'Mother:'}</span>{' '}
                                <span className="font-semibold text-gray-900">
                                  {candidate.motherName || candidate.family?.motherName || candidate.jathagamData?.motherName}
                                </span>
                                {candidate.motherOccupation && (
                                  <span className="text-gray-500 text-[11px]"> ({candidate.motherOccupation})</span>
                                )}
                              </p>
                            )}
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
                            <span className="font-bold">{language === 'TA' ? 'தோஷம்:' : 'Dosham:'}</span> {candidate.dosham || (language === 'TA' ? 'இல்லை (None)' : 'None')}
                          </p>
                          <p className="text-gray-800 font-mono font-bold flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{candidate.userContact?.mobile || candidate.profileCreatedBy || candidate.whatsappNumber || '-'}</span>
                          </p>
                          {candidate.userContact?.email && !candidate.userContact.email.includes('@nammamatrimony.local') && (
                            <p className="text-gray-600 flex items-center gap-1 truncate text-[11px]">
                              <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="truncate">{candidate.userContact.email}</span>
                            </p>
                          )}

                        </div>
                      </div>
                    </div>

                    {/* DEDICATED VERIFICATION DOCUMENTS SECTION */}
                    <div className="mx-4 sm:mx-6 mb-4 bg-white p-3.5 sm:p-4 rounded-2xl border-2 border-primary/20 shadow-2xs space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/10 pb-2.5">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <h4 className="text-xs sm:text-sm font-black uppercase text-primary tracking-wider font-serif">
                            {language === 'TA' ? 'சரிபார்க்கப்பட வேண்டிய ஆவணங்கள் & சான்றிதழ்கள்' : 'Uploaded Verification Documents'}
                          </h4>
                        </div>
                        <span className="text-[11px] font-bold text-gray-500">
                          {[
                            candidate.idProofUrl ? 'ID' : null,
                            candidate.casteCertificateUrl ? 'Caste' : null,
                            (candidate.jathakamUrl || candidate.horoscopeUrl) ? 'Horoscope' : null,
                            cPhoto ? 'Photo' : null,
                          ].filter(Boolean).length} / 4 {language === 'TA' ? 'ஆவணங்கள் இணைக்கப்பட்டுள்ளன' : 'Documents Uploaded'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Document 1: Govt ID Proof */}
                        <div className={`p-3 rounded-xl border flex flex-col justify-between gap-2.5 transition-all ${
                          candidate.idProofUrl
                            ? 'bg-blue-50/70 border-blue-300 shadow-2xs'
                            : 'bg-gray-50/70 border-gray-200 opacity-60'
                        }`}>
                          <div className="flex items-start gap-2.5">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate">
                                {language === 'TA' ? 'அரசு அடையாள அட்டை' : 'Govt ID Proof'}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {candidate.idProofUrl
                                  ? (isPdfUrl(candidate.idProofUrl) ? 'PDF ஆவணம்' : 'பட ஆவணம் (Image)')
                                  : (language === 'TA' ? 'இணைக்கப்படவில்லை' : 'Not Attached')}
                              </p>
                            </div>
                          </div>

                          {candidate.idProofUrl ? (
                            <div className="flex items-center gap-1.5 pt-2 border-t border-blue-200/80">
                              <button
                                type="button"
                                onClick={() => openDocPreview(
                                  candidate.idProofUrl,
                                  language === 'TA' ? 'அரசு அடையாள அட்டை (Govt ID Proof)' : 'Govt ID Proof',
                                  candidate
                                )}
                                className="flex-1 py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
                              >
                                <Eye className="w-3 h-3" />
                                <span>{language === 'TA' ? 'பார்வை' : 'Preview'}</span>
                              </button>
                              <a
                                href={getDocumentViewerUrl(candidate.idProofUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 transition-all cursor-pointer"
                                title="Open in new tab / Download"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ) : (
                            <div className="text-[10px] text-gray-400 italic pt-1 border-t border-gray-200">
                              {language === 'TA' ? 'பதிவேற்றப்படவில்லை' : 'Not uploaded'}
                            </div>
                          )}
                        </div>

                        {/* Document 2: Caste Certificate */}
                        <div className={`p-3 rounded-xl border flex flex-col justify-between gap-2.5 transition-all ${
                          candidate.casteCertificateUrl
                            ? 'bg-purple-50/70 border-purple-300 shadow-2xs'
                            : 'bg-gray-50/70 border-gray-200 opacity-60'
                        }`}>
                          <div className="flex items-start gap-2.5">
                            <div className="p-2 rounded-lg bg-purple-100 text-purple-700 shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate">
                                {language === 'TA' ? 'சாதிச் சான்றிதழ்' : 'Caste Certificate'}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {candidate.casteCertificateUrl
                                  ? (isPdfUrl(candidate.casteCertificateUrl) ? 'PDF சான்றிதழ்' : 'பட சான்றிதழ் (Image)')
                                  : (language === 'TA' ? 'இணைக்கப்படவில்லை' : 'Not Attached')}
                              </p>
                            </div>
                          </div>

                          {candidate.casteCertificateUrl ? (
                            <div className="flex items-center gap-1.5 pt-2 border-t border-purple-200/80">
                              <button
                                type="button"
                                onClick={() => openDocPreview(
                                  candidate.casteCertificateUrl,
                                  language === 'TA' ? 'சாதிச் சான்றிதழ் (Caste Certificate)' : 'Caste Certificate',
                                  candidate
                                )}
                                className="flex-1 py-1.5 px-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
                              >
                                <Eye className="w-3 h-3" />
                                <span>{language === 'TA' ? 'பார்வை' : 'Preview'}</span>
                              </button>
                              <a
                                href={getDocumentViewerUrl(candidate.casteCertificateUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 transition-all cursor-pointer"
                                title="Open in new tab / Download"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ) : (
                            <div className="text-[10px] text-gray-400 italic pt-1 border-t border-gray-200">
                              {language === 'TA' ? 'பதிவேற்றப்படவில்லை' : 'Not uploaded'}
                            </div>
                          )}
                        </div>

                        {/* Document 3: Horoscope Copy */}
                        <div className={`p-3 rounded-xl border flex flex-col justify-between gap-2.5 transition-all ${
                          (candidate.jathakamUrl || candidate.horoscopeUrl)
                            ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
                            : 'bg-gray-50/70 border-gray-200 opacity-60'
                        }`}>
                          <div className="flex items-start gap-2.5">
                            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate">
                                {language === 'TA' ? 'ஜாதக அசல் நகல்' : 'Horoscope Document'}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {(candidate.jathakamUrl || candidate.horoscopeUrl)
                                  ? (isPdfUrl(candidate.jathakamUrl || candidate.horoscopeUrl) ? 'PDF ஜாதகம்' : 'ஜாதகக் கட்ட படம்')
                                  : (language === 'TA' ? 'இணைக்கப்படவில்லை' : 'Not Attached')}
                              </p>
                            </div>
                          </div>

                          {(candidate.jathakamUrl || candidate.horoscopeUrl) ? (
                            <div className="flex items-center gap-1.5 pt-2 border-t border-amber-200/80">
                              <button
                                type="button"
                                onClick={() => openDocPreview(
                                  candidate.jathakamUrl || candidate.horoscopeUrl,
                                  language === 'TA' ? 'ஜாதக அசல் நகல் (Horoscope Document)' : 'Horoscope Document',
                                  candidate
                                )}
                                className="flex-1 py-1.5 px-2 rounded-lg bg-primary hover:bg-primary-light text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
                              >
                                <Eye className="w-3 h-3 text-[#D4AF37]" />
                                <span>{language === 'TA' ? 'பார்வை' : 'Preview'}</span>
                              </button>
                              <a
                                href={getDocumentViewerUrl(candidate.jathakamUrl || candidate.horoscopeUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-white border border-amber-200 text-amber-800 hover:bg-amber-50 transition-all cursor-pointer"
                                title="Open in new tab / Download"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ) : (
                            <div className="text-[10px] text-gray-400 italic pt-1 border-t border-gray-200">
                              {language === 'TA' ? 'பதிவேற்றப்படவில்லை' : 'Not uploaded'}
                            </div>
                          )}
                        </div>

                        {/* Document 4: Profile Photo */}
                        <div className={`p-3 rounded-xl border flex flex-col justify-between gap-2.5 transition-all ${
                          cPhoto
                            ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                            : 'bg-gray-50/70 border-gray-200 opacity-60'
                        }`}>
                          <div className="flex items-start gap-2.5">
                            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate">
                                {language === 'TA' ? 'சுயவிவர புகைப்படம்' : 'Profile Photo'}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {cPhoto
                                  ? 'நேரடி புகைப்படம்'
                                  : (language === 'TA' ? 'இணைக்கப்படவில்லை' : 'Not Attached')}
                              </p>
                            </div>
                          </div>

                          {cPhoto ? (
                            <div className="flex items-center gap-1.5 pt-2 border-t border-emerald-200/80">
                              <button
                                type="button"
                                onClick={() => openDocPreview(
                                  cPhoto,
                                  language === 'TA' ? 'சுயவிவரப் புகைப்படம் (Profile Photo)' : 'Profile Photo',
                                  candidate
                                )}
                                className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
                              >
                                <Eye className="w-3 h-3" />
                                <span>{language === 'TA' ? 'பார்வை' : 'Preview'}</span>
                              </button>
                              <a
                                href={cPhoto}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 transition-all cursor-pointer"
                                title="Open in new tab / Download"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ) : (
                            <div className="text-[10px] text-gray-400 italic pt-1 border-t border-gray-200">
                              {language === 'TA' ? 'பதிவேற்றப்படவில்லை' : 'Not uploaded'}
                            </div>
                          )}
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

      {/* 8.5 MODAL: IN-APP DOCUMENT PREVIEW (PDF & IMAGE VIEWER) */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden border-2 border-[#D4AF37] shadow-2xl p-3 sm:p-5 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm sm:text-base text-gray-900 truncate">
                    {previewDoc.title}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium truncate">
                    {previewDoc.candidateName} {previewDoc.displayId ? `• ${previewDoc.displayId}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-light transition-all flex items-center gap-1.5 shadow-xs"
                  title="Open in new tab / Download file"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="hidden sm:inline">{language === 'TA' ? 'புதிய தாவலில் திற' : 'Open in New Tab'}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                  title="Close Preview"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="flex-1 overflow-auto p-2 flex items-center justify-center bg-stone-100/70 rounded-2xl mt-3 min-h-[350px]">
              {previewDoc.isPdf ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.title}
                  className="w-full h-[72vh] rounded-xl border border-gray-200 shadow-2xs bg-white"
                />
              ) : (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.title}
                  className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-sm"
                />
              )}
            </div>
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

