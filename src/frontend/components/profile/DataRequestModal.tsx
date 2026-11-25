'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Image as ImageIcon,
  Lock,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  User
} from 'lucide-react';
import { BRANDING } from '@/constants/branding';

interface DataRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProfile: {
    id?: string;
    displayId?: string;
    name?: string;
    gender?: string;
    mobile?: string;
  } | null;
  initialType?: 'PHONE' | 'PHOTO' | 'BOTH';
  language?: 'TA' | 'EN';
  onRequestSent?: (request: any) => void;
}

export default function DataRequestModal({
  isOpen,
  onClose,
  targetProfile,
  initialType = 'BOTH',
  language = 'TA',
  onRequestSent,
}: DataRequestModalProps) {
  const [requestType, setRequestType] = useState<'PHONE' | 'PHOTO' | 'BOTH'>(initialType);
  const [requesterMobile, setRequesterMobile] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-fill from localStorage on open
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setRequestType(initialType);
      try {
        const storedMob = localStorage.getItem('namma_user_mobile') || '';
        if (storedMob) setRequesterMobile(storedMob);

        const listStr = localStorage.getItem('namma_registrations');
        if (listStr) {
          const list = JSON.parse(listStr);
          if (Array.isArray(list) && list.length > 0) {
            const first = list[0];
            if (first.name || first.fullName) {
              setRequesterName(first.name || first.fullName);
            }
          }
        }
      } catch {}
    }
  }, [isOpen, initialType]);

  if (!isOpen || !targetProfile) return null;

  const targetName = targetProfile.name || 'மணமகன் / மணமகள்';
  const targetId = targetProfile.displayId || targetProfile.id || 'NM-0001';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanMob = requesterMobile.replace(/[^0-9]/g, '');
    if (cleanMob.length < 10) {
      setErrorMsg(
        language === 'TA'
          ? 'தயவுசெய்து சரியான 10-இலக்க மொபைல் எண்ணை உள்ளிடவும்'
          : 'Please enter a valid 10-digit mobile number'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Find my display ID if registered
      let myDisplayId = '';
      try {
        const listStr = localStorage.getItem('namma_registrations');
        if (listStr) {
          const list = JSON.parse(listStr);
          if (Array.isArray(list) && list.length > 0) {
            myDisplayId = list[0].displayId || list[0].registrationId || '';
          }
        }
      } catch {}

      const res = await fetch('/api/requests/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetProfileId: targetProfile.id || targetProfile.displayId,
          targetDisplayId: targetProfile.displayId,
          targetName: targetProfile.name,
          targetMobile: targetProfile.mobile,
          requesterMobile: cleanMob,
          requesterName: requesterName.trim() || undefined,
          requesterDisplayId: myDisplayId || undefined,
          requestType,
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (data.success && data.request) {
        // Save to localStorage sent requests for immediate persistence
        try {
          const savedStr = localStorage.getItem('namma_sent_requests') || '[]';
          const saved = JSON.parse(savedStr);
          const updated = [data.request, ...saved.filter((r: any) => r.id !== data.request.id)];
          localStorage.setItem('namma_sent_requests', JSON.stringify(updated));
          // Store user mobile if not saved
          if (!localStorage.getItem('namma_user_mobile')) {
            localStorage.setItem('namma_user_mobile', cleanMob);
          }
        } catch {}

        setSuccessMsg(
          language === 'TA'
            ? 'தகவல் அனுமதி கோரிக்கை வெற்றிகரமாக அனுப்பப்பட்டது! மற்றொரு பக்கம் ஒப்புதல் அளித்தவுடன் விவரங்கள் உடனே தோன்றும்.'
            : 'Request sent successfully! Once the profile owner approves, the details will be unlocked.'
        );

        if (onRequestSent) {
          onRequestSent(data.request);
        }

        setTimeout(() => {
          onClose();
        }, 2200);
      } else {
        setErrorMsg(data.error || 'Failed to submit request');
      }
    } catch (err: any) {
      console.error('Submit request error:', err);
      setErrorMsg(err.message || 'Error connecting to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[140] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full bg-white rounded-3xl overflow-hidden border-2 border-[#D4AF37] shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Gradient Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-primary via-[#D4AF37] to-primary"></div>

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-[#FFFDF9]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif font-black text-sm sm:text-base text-primary truncate">
                {language === 'TA' ? 'தகவல் அனுமதி கோரிக்கை' : 'Request Profile Data'}
              </h3>
              <p className="text-xs text-gray-500 font-medium truncate">
                {targetName} <span className="font-mono font-bold text-primary">({targetId})</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        {successMsg ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-300">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="font-serif font-bold text-lg text-emerald-900">
              {language === 'TA' ? 'கோரிக்கை அனுப்பப்பட்டது!' : 'Request Sent!'}
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
              {successMsg}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
            
            {/* Target Explanation Card */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <p className="leading-snug">
                {language === 'TA'
                  ? `இந்த வரனின் குடும்பத்தினர் ஒப்புதல் அளித்தவுடன், நீங்கள் அவர்களின் பாதுகாக்கப்பட்ட தொடர்பு எண் அல்லது புகைப்படத்தை முழுமையாகப் பார்க்கலாம்.`
                  : `Once the family approves your request, you will be granted access to view their contact number and/or photograph.`}
              </p>
            </div>

            {/* Request Type Selector */}
            <div className="space-y-1.5">
              <label className="font-bold text-gray-800 text-xs block">
                {language === 'TA' ? 'நீங்கள் கோர விரும்பும் தகவல் எது?' : 'What data do you want to request?'}
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRequestType('PHONE')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    requestType === 'PHONE'
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-[11px] font-bold leading-tight">
                    {language === 'TA' ? 'தொடர்பு எண்' : 'Phone No'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRequestType('PHOTO')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    requestType === 'PHOTO'
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-[11px] font-bold leading-tight">
                    {language === 'TA' ? 'புகைப்படம்' : 'Photo'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRequestType('BOTH')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    requestType === 'BOTH'
                      ? 'bg-primary text-white border-primary shadow-xs ring-2 ring-[#D4AF37]'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <ImageIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold leading-tight">
                    {language === 'TA' ? 'இரண்டும் (Both)' : 'Both'}
                  </span>
                </button>
              </div>
            </div>

            {/* Requester Mobile */}
            <div className="space-y-1">
              <label className="font-bold text-gray-800 text-xs block">
                {language === 'TA' ? 'உங்கள் தொடர்பு எண் (Your Mobile Number)' : 'Your Mobile Number'} *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">+91</span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={requesterMobile}
                  onChange={(e) => setRequesterMobile(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm font-mono font-bold outline-none"
                />
              </div>
            </div>

            {/* Requester Name */}
            <div className="space-y-1">
              <label className="font-bold text-gray-800 text-xs block">
                {language === 'TA' ? 'உங்கள் பெயர் / குடும்பத்தினர் (Your Name)' : 'Your Name / Family'}
              </label>
              <input
                type="text"
                placeholder={language === 'TA' ? 'எ.கா: ஆனந்த் S (மணமகன் / தந்தை)' : 'e.g. Anand S (Groom / Parent)'}
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm outline-none font-medium"
              />
            </div>

            {/* Optional Note */}
            <div className="space-y-1">
              <label className="font-bold text-gray-800 text-xs block">
                {language === 'TA' ? 'சுருக்கமான தகவல் (Optional Note)' : 'Short Note (Optional)'}
              </label>
              <input
                type="text"
                placeholder={language === 'TA' ? 'எ.கா: ஜாதகப் பொருத்தம் பார்க்க விரும்புகிறோம்' : 'e.g. Interested in horoscope matching'}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs outline-none"
              />
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all cursor-pointer"
              >
                {language === 'TA' ? 'ரத்து செய்' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] py-3 rounded-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{language === 'TA' ? 'அனுப்பப்படுகிறது...' : 'Sending...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{language === 'TA' ? 'கோரிக்கை அனுப்புக' : 'Send Request'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
