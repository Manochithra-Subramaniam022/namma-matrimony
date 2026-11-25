'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Bell,
  Phone,
  Image as ImageIcon,
  Check,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  ShieldCheck,
  Loader2,
  RefreshCw,
  Send,
  ExternalLink
} from 'lucide-react';
import { BRANDING } from '@/constants/branding';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userMobile?: string;
  language?: 'TA' | 'EN';
  onActionComplete?: () => void;
}

export default function NotificationDrawer({
  isOpen,
  onClose,
  userMobile = '',
  language = 'TA',
  onActionComplete,
}: NotificationDrawerProps) {
  const [activeTab, setActiveTab] = useState<'RECEIVED' | 'SENT'>('RECEIVED');
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchRequests = useCallback(async () => {
    let effectiveMobile = userMobile;
    if (!effectiveMobile && typeof window !== 'undefined') {
      effectiveMobile = localStorage.getItem('namma_user_mobile') || '';
    }

    if (!effectiveMobile) {
      // Check if we have registered profiles in localStorage
      try {
        const listStr = localStorage.getItem('namma_registrations');
        if (listStr) {
          const list = JSON.parse(listStr);
          if (Array.isArray(list) && list.length > 0) {
            effectiveMobile = list[0].mobile || list[0].profileCreatedBy || '';
          }
        }
      } catch {}
    }

    if (!effectiveMobile) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // 1. Fetch Received Requests (for profile owner)
      const res1 = await fetch(`/api/requests/data?mobile=${encodeURIComponent(effectiveMobile)}`);
      const data1 = await res1.json();
      if (data1.success && Array.isArray(data1.receivedRequests)) {
        setReceivedRequests(data1.receivedRequests);
      }

      // 2. Fetch Sent Requests (by viewer)
      const res2 = await fetch(`/api/requests/data?requesterMobile=${encodeURIComponent(effectiveMobile)}`);
      const data2 = await res2.json();
      if (data2.success && Array.isArray(data2.sentRequests)) {
        setSentRequests(data2.sentRequests);
      }
    } catch (err) {
      console.error('fetchRequests error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userMobile]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchRequests();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, fetchRequests]);

  // Handle Accept or Decline
  const handleUpdateStatus = async (requestId: string, targetProfileId: string, status: 'ACCEPTED' | 'REJECTED') => {
    setActionInProgressId(requestId);
    try {
      const res = await fetch('/api/requests/data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, targetProfileId, status }),
      });
      const data = await res.json();
      if (data.success) {
        setReceivedRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status, updatedAt: new Date().toISOString() } : r))
        );
        showToast(
          status === 'ACCEPTED'
            ? (language === 'TA' ? 'அனுமதி வெற்றிகரமாக வழங்கப்பட்டது! பார்வையாளர் இப்போது விவரங்களைக் காண முடியும்.' : 'Access granted successfully!')
            : (language === 'TA' ? 'கோரிக்கை நிராகரிக்கப்பட்டது.' : 'Request declined.')
        );
        if (onActionComplete) onActionComplete();
      } else {
        showToast(data.error || 'Failed to update request', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Connection error', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  if (!isOpen) return null;

  const pendingReceivedCount = receivedRequests.filter((r) => r.status === 'PENDING').length;

  return (
    <div
      className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-primary/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-light text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center border border-white/20 relative">
              <Bell className="w-5 h-5 text-[#D4AF37]" />
              {pendingReceivedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-amber-950 font-black text-[10px] flex items-center justify-center animate-pulse">
                  {pendingReceivedCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-serif font-black text-base sm:text-lg">
                {language === 'TA' ? 'அறிவிப்புகள் & தகவல் கோரிக்கைகள்' : 'Notifications & Requests'}
              </h3>
              <p className="text-[11px] text-amber-200 font-medium">
                {language === 'TA' ? 'தொடர்பு எண் & புகைப்படம் கோரிக்கைகள்' : 'Data & Access Approvals'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={fetchRequests}
              disabled={isLoading}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 bg-[#FFFDF9] shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('RECEIVED')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'RECEIVED'
                ? 'border-primary text-primary bg-white shadow-2xs'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>{language === 'TA' ? 'வந்த கோரிக்கைகள்' : 'Received Requests'}</span>
            {pendingReceivedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-mono">
                {pendingReceivedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SENT')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'SENT'
                ? 'border-primary text-primary bg-white shadow-2xs'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>{language === 'TA' ? 'அனுப்பிய கோரிக்கைகள்' : 'Sent by Me'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-200 text-gray-700 font-mono">
              {sentRequests.length}
            </span>
          </button>
        </div>

        {/* Toast Notification */}
        {toastMsg && (
          <div
            className={`mx-4 mt-3 p-3 rounded-xl text-xs font-bold flex items-center gap-2 border animate-in fade-in duration-200 ${
              toastMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span className="flex-1">{toastMsg.text}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading && receivedRequests.length === 0 && sentRequests.length === 0 ? (
            <div className="py-16 text-center space-y-3 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-xs">{language === 'TA' ? 'ஏற்றப்படுகிறது...' : 'Loading notifications...'}</p>
            </div>
          ) : activeTab === 'RECEIVED' ? (
            /* 1. RECEIVED REQUESTS (For Profile Owner) */
            receivedRequests.length === 0 ? (
              <div className="py-16 text-center space-y-3 px-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                  <Bell className="w-6 h-6" />
                </div>
                <h4 className="font-serif font-bold text-gray-700 text-sm">
                  {language === 'TA' ? 'புதிய தகவல் கோரிக்கைகள் இல்லை' : 'No Pending Requests'}
                </h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                  {language === 'TA'
                    ? 'பார்வையாளர்கள் உங்கள் தொடர்பு எண் அல்லது புகைப்படத்தை பார்க்க அனுமதி கோரும்போது அவை இங்கே அறிவிக்கப்படும்.'
                    : 'When other prospective families request your phone number or photo, you will be notified here to approve.'}
                </p>
              </div>
            ) : (
              receivedRequests.map((req) => {
                const isPending = req.status === 'PENDING';
                const isAccepted = req.status === 'ACCEPTED';
                const isRejected = req.status === 'REJECTED';
                const isUpdating = actionInProgressId === req.id;

                const reqDate = new Date(req.createdAt).toLocaleDateString(language === 'TA' ? 'ta-IN' : 'en-US', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={req.id}
                    className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
                      isPending
                        ? 'bg-amber-50/50 border-amber-300 shadow-xs'
                        : isAccepted
                        ? 'bg-emerald-50/30 border-emerald-200'
                        : 'bg-gray-50/50 border-gray-200 opacity-70'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-gray-200/60 pb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                            {req.requesterName || 'பார்வையாளர்'}
                            {req.requesterDisplayId && (
                              <span className="font-mono text-primary font-bold ml-1 text-xs">
                                ({req.requesterDisplayId})
                              </span>
                            )}
                          </h4>
                          <p className="text-[10px] text-gray-500 font-mono">
                            {req.requesterMobile}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] text-gray-400 shrink-0 font-medium">{reqDate}</span>
                    </div>

                    {/* Target & Requested Items */}
                    <div className="bg-white rounded-xl p-2.5 border border-gray-200/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-500 font-medium">
                          {language === 'TA' ? 'யாருடைய தகவல் கோரப்பட்டது:' : 'Target Profile:'}
                        </span>
                        <span className="font-bold text-primary font-mono truncate">
                          {req.targetName} {req.targetDisplayId ? `(${req.targetDisplayId})` : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-gray-100">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">
                          {language === 'TA' ? 'கோரியது:' : 'Requested:'}
                        </span>
                        {(req.requestType === 'PHONE' || req.requestType === 'BOTH') && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-bold text-[10px] border border-blue-200">
                            <Phone className="w-3 h-3 text-blue-600" />
                            <span>{language === 'TA' ? 'தொடர்பு எண்' : 'Phone No'}</span>
                          </span>
                        )}
                        {(req.requestType === 'PHOTO' || req.requestType === 'BOTH') && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 font-bold text-[10px] border border-purple-200">
                            <ImageIcon className="w-3 h-3 text-purple-600" />
                            <span>{language === 'TA' ? 'புகைப்படம்' : 'Photo'}</span>
                          </span>
                        )}
                      </div>

                      {req.note && (
                        <p className="text-[11px] text-gray-600 italic bg-stone-50 p-1.5 rounded-lg border border-stone-200">
                          &quot;{req.note}&quot;
                        </p>
                      )}
                    </div>

                    {/* Status / Action Buttons */}
                    <div className="pt-1">
                      {isPending ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(req.id, req.targetProfileId, 'ACCEPTED')}
                            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            )}
                            <span>{language === 'TA' ? 'அனுமதியளி (Accept)' : 'Grant Access'}</span>
                          </button>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(req.id, req.targetProfileId, 'REJECTED')}
                            className="py-2 px-3 rounded-xl bg-gray-100 hover:bg-rose-50 text-gray-700 hover:text-rose-700 font-bold text-xs flex items-center justify-center gap-1 transition-all border border-gray-200 hover:border-rose-200 cursor-pointer disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>{language === 'TA' ? 'நிராகரி' : 'Decline'}</span>
                          </button>
                        </div>
                      ) : isAccepted ? (
                        <div className="bg-emerald-100/70 border border-emerald-300 text-emerald-800 font-bold text-xs py-1.5 px-3 rounded-xl flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>{language === 'TA' ? 'அனுமதி வழங்கப்பட்டது' : 'Access Granted'}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(req.id, req.targetProfileId, 'REJECTED')}
                            className="text-[10px] text-gray-500 hover:text-rose-600 underline font-medium cursor-pointer"
                          >
                            {language === 'TA' ? 'ரத்துசெய்' : 'Revoke'}
                          </button>
                        </div>
                      ) : (
                        <div className="bg-gray-100 border border-gray-200 text-gray-600 font-bold text-xs py-1.5 px-3 rounded-xl flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <XCircle className="w-4 h-4 text-rose-500" />
                            <span>{language === 'TA' ? 'நிராகரிக்கப்பட்டது' : 'Declined'}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(req.id, req.targetProfileId, 'ACCEPTED')}
                            className="text-[10px] text-primary hover:underline font-bold cursor-pointer"
                          >
                            {language === 'TA' ? 'மீண்டும் அனுமதிக்க' : 'Allow'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )
          ) : (
            /* 2. SENT REQUESTS (By Viewer) */
            sentRequests.length === 0 ? (
              <div className="py-16 text-center space-y-3 px-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                  <Send className="w-6 h-6" />
                </div>
                <h4 className="font-serif font-bold text-gray-700 text-sm">
                  {language === 'TA' ? 'அனுப்பிய கோரிக்கைகள் இல்லை' : 'No Sent Requests'}
                </h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                  {language === 'TA'
                    ? 'நீங்கள் பிற வரன்களின் தொடர்பு எண் அல்லது புகைப்படத்தை பார்க்க கோரிக்கை அனுப்பும்போது அவற்றின் நிலை இங்கே தோன்றும்.'
                    : 'When you request phone numbers or photos of prospective matches, you can track approval status here.'}
                </p>
              </div>
            ) : (
              sentRequests.map((req) => {
                const isPending = req.status === 'PENDING';
                const isAccepted = req.status === 'ACCEPTED';

                return (
                  <div
                    key={req.id}
                    className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                      isAccepted
                        ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs'
                        : isPending
                        ? 'bg-amber-50/40 border-amber-200'
                        : 'bg-gray-50 border-gray-200 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {req.targetDisplayId || 'NM-0001'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-sm text-gray-900">{req.targetName}</h4>
                      <p className="text-xs text-gray-500">
                        {language === 'TA' ? 'கோரப்பட்டவை:' : 'Requested:'}{' '}
                        <strong>
                          {req.requestType === 'BOTH'
                            ? (language === 'TA' ? 'தொடர்பு எண் & புகைப்படம்' : 'Phone & Photo')
                            : req.requestType === 'PHONE'
                            ? (language === 'TA' ? 'தொடர்பு எண்' : 'Phone Number')
                            : (language === 'TA' ? 'புகைப்படம்' : 'Photo')}
                        </strong>
                      </p>
                    </div>

                    <div className="pt-1">
                      {isAccepted ? (
                        <div className="p-2 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{language === 'TA' ? 'அனுமதி வழங்கப்பட்டது! விவரங்கள் திறக்கப்பட்டுள்ளன.' : 'Access Granted! Details are unlocked.'}</span>
                        </div>
                      ) : isPending ? (
                        <div className="p-2 rounded-xl bg-amber-100/70 text-amber-900 font-bold text-xs flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                          <span>{language === 'TA' ? 'குடும்பத்தினரின் ஒப்புதலுக்காக காத்திருக்கிறது...' : 'Awaiting family approval...'}</span>
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-rose-50 text-rose-800 font-bold text-xs flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{language === 'TA' ? 'கோரிக்கை நிராகரிக்கப்பட்டது' : 'Request Declined'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FFFDF9] border-t border-gray-200 text-center shrink-0">
          <p className="text-[11px] text-gray-500 font-medium">
            {BRANDING.brandNameTamil} • {BRANDING.taglineTamil}
          </p>
        </div>
      </div>
    </div>
  );
}
