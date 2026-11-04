'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, ArrowLeft, Sparkles, Heart, User, Check, ShieldCheck, MapPin, Briefcase } from 'lucide-react';
import { BRANDING } from '@/constants/branding';

interface Step4PaymentProps {
  onComplete: (profileData?: any) => void;
  onPrev: () => void;
  language?: 'TA' | 'EN';
  initialData?: any;
}

export function Step4Payment({
  onComplete,
  onPrev,
  language = 'TA',
  initialData,
}: Step4PaymentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [refId, setRefId] = useState('nm-0001');
  const [createdProfile, setCreatedProfile] = useState<any>(null);

  useEffect(() => {
    fetch('/api/register')
      .then((res) => res.json())
      .then((data) => {
        if (data.nextId) setRefId(data.nextId);
      })
      .catch((err) => {
        console.warn('Failed to fetch next registration ID:', err);
      });
  }, []);

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    const payload = {
      ...(initialData || {}),
      paidStatus: 'FREE_COMMUNITY_SERVICE',
    };

    let assignedId = refId || 'nm-0001';

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.registrationId) {
        assignedId = result.registrationId;
        setRefId(result.registrationId);
      }
    } catch (err) {
      console.error('Registration submission error:', err);
    } finally {
      setRefId(assignedId);
      const finalProfileData = {
        ...payload,
        registrationId: assignedId,
        refId: assignedId,
        displayId: assignedId,
        paidStatus: 'FREE_SERVICE',
        timestamp: new Date().toISOString(),
      };
      setCreatedProfile(finalProfileData);
      localStorage.setItem('namma_registration_complete', JSON.stringify(finalProfileData));
      localStorage.setItem('namma_matrimony_profile', JSON.stringify(finalProfileData));
      localStorage.removeItem('namma_matrimony_draft');

      setIsSubmitting(false);
      setShowSuccessModal(true);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* 1. 100% FREE COMMUNITY SERVICE BANNER */}
      <div className="bg-gradient-to-br from-primary via-primary-light to-[#580016] text-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-[#D4AF37]/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-[#D4AF37]/20 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/25 text-[#F3E5AB] text-xs font-bold border border-[#D4AF37]/40">
              <Heart className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37] shrink-0" />
              <span>{language === 'TA' ? 'மக்களுக்கான இலவச சமூக சேவை' : '100% Free Non-Profit Initiative'}</span>
            </div>
            <h3 className="text-xl sm:text-3xl font-serif font-black tracking-tight text-white leading-tight">
              {language === 'TA' ? 'முற்றிலும் இலவச வரன் பதிவு' : '100% Free Matrimonial Registration'}
            </h3>
            <p className="text-xs sm:text-sm text-rose-100/90 max-w-lg leading-relaxed">
              {language === 'TA'
                ? 'எந்தவித தரகு கட்டணமும், உறுப்பினர் கட்டணமும் இன்றி மக்களுக்கு உதவும் உன்னத நோக்கில் உருவாக்கப்பட்ட இலவச மேட்ரிமோனி தளம்.'
                : 'Built purely as a community social service to help families find compatible life partners with zero fees and no intermediaries.'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 sm:p-5 rounded-2xl text-center shrink-0 w-full sm:w-auto">
            <span className="text-[11px] sm:text-xs text-rose-200 uppercase tracking-widest font-bold">Registration Fee</span>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#D4AF37] font-serif my-1">
              ₹0 (FREE)
            </div>
            <span className="text-[11px] text-white/90">
              {language === 'TA' ? 'எப்போதும் இலவசம்' : 'Zero Hidden Charges'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. PROFILE SUMMARY REVIEW */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/15 shadow-sm space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between border-b border-primary/10 pb-3 sm:pb-4 gap-2">
          <div>
            <h3 className="text-base sm:text-xl font-black text-primary font-serif">
              {language === 'TA' ? 'சுயவிவர சுருக்கம் (Profile Summary Review)' : 'Review Your Details'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === 'TA' ? 'சமர்ப்பிப்பதற்கு முன் உங்கள் விவரங்களை சரிபார்க்கவும்' : 'Please check your submitted details before final confirmation'}
            </p>
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 sm:px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1 shrink-0">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Ready</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="bg-[#FFFDF9] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-primary/10">
            <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">
              {language === 'TA' ? 'முழு பெயர் & பாலினம்' : 'Name & Gender'}
            </span>
            <p className="font-bold text-gray-900 text-sm">
              {initialData?.fullName || 'Not specified'} ({initialData?.gender === 'FEMALE' ? 'மணமகள்' : 'மணமகன்'})
            </p>
          </div>

          <div className="bg-[#FFFDF9] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-primary/10">
            <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">
              {language === 'TA' ? 'தொடர்பு எண்' : 'Primary Mobile'}
            </span>
            <p className="font-bold text-gray-900 font-mono text-sm">
              {initialData?.whatsappNumber || 'Not specified'}
            </p>
          </div>

          <div className="bg-[#FFFDF9] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-primary/10">
            <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">
              {language === 'TA' ? 'சமூகம் & குலம்' : 'Caste & Koottam'}
            </span>
            <p className="font-bold text-gray-900 text-sm">
              {initialData?.caste || 'Kongu Vellalar Gounder'} {initialData?.kootam ? `• ${initialData.kootam}` : ''}
            </p>
          </div>

          <div className="bg-[#FFFDF9] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-primary/10">
            <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">
              {language === 'TA' ? 'பிறந்த தேதி' : 'Date of Birth'}
            </span>
            <p className="font-bold text-gray-900 text-sm">
              {initialData?.dob || 'Not specified'}
            </p>
          </div>

          <div className="bg-[#FFFDF9] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-primary/10">
            <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">
              {language === 'TA' ? 'இருப்பிடம் / நகரம்' : 'City / Location'}
            </span>
            <p className="font-bold text-gray-900 text-sm">
              {initialData?.city || 'Tamil Nadu'}
            </p>
          </div>

          <div className="bg-[#FFFDF9] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-primary/10">
            <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">
              {language === 'TA' ? 'பணி & வருமானம்' : 'Career & Income'}
            </span>
            <p className="font-bold text-gray-900 text-sm">
              {initialData?.designation || initialData?.workNature || 'Employed'} {initialData?.annualIncome ? `(${initialData.annualIncome})` : ''}
            </p>
          </div>
        </div>

        {/* Community Pledge */}
        <div className="bg-[#FFFDF9] border border-[#D4AF37]/40 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600 leading-relaxed">
            {language === 'TA'
              ? 'நான் வழங்கியுள்ள தகவல்கள் அனைத்தும் உண்மை என உறுதியளிக்கிறேன். இந்த இலவச மேட்ரிமோனி சேவையின் மூலம் தரமான வரன்களை கண்டறிய சம்மதிக்கிறேன்.'
              : 'I confirm that all details provided are accurate and authentic. I look forward to connecting with compatible families through this free matrimonial platform.'}
          </p>
        </div>
      </div>

      {/* 3. NAVIGATION BUTTONS */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200/60">
        <button
          type="button"
          onClick={onPrev}
          className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 sm:px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>{language === 'TA' ? 'முந்தைய படி' : 'Back to Step 3'}</span>
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleFinalSubmit}
          className="w-full sm:w-auto bg-primary hover:bg-primary-light text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-extrabold text-sm sm:text-base shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <span>
            {isSubmitting
              ? (language === 'TA' ? 'பதிவு செய்யப்படுகிறது...' : 'Submitting Profile...')
              : (language === 'TA' ? 'இலவசமாக பதிவை சமர்ப்பிக்கவும்' : 'Submit Free Registration')}
          </span>
        </button>
      </div>

      {/* 4. CELEBRATORY SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3.5 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-10 max-w-md w-full shadow-2xl border-2 border-[#D4AF37]/50 text-center space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-200 relative overflow-hidden">
            
            <div className="h-2.5 w-full bg-gradient-to-r from-primary via-[#D4AF37] to-primary absolute top-0 inset-x-0"></div>

            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 border-4 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#B45309] text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{language === 'TA' ? 'பதிவு வெற்றிகரமானது!' : 'Registration Successful!'}</span>
              </div>
              <h3 className="text-2xl font-serif font-black text-primary">
                {language === 'TA' ? 'நன்றி! உங்கள் சுயவிவரம் சமர்ப்பிக்கப்பட்டது' : 'Welcome to Namma Matrimony!'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed font-medium">
                {language === 'TA'
                  ? 'உங்கள் சுயவிவரம் வெற்றிகரமாக பதிவு செய்யப்பட்டது. உங்கள் இல்லற வாழ்வு இனிதே அமைய வாழ்த்துகிறோம்.'
                  : 'Your profile has been registered successfully. We wish you the very best in finding your ideal life partner.'}
              </p>
            </div>

            {/* Reference ID Card */}
            <div className="bg-[#FFFDF9] border border-primary/20 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                {language === 'TA' ? 'பதிவு குறிப்பு எண் (Reference ID)' : 'Registration Reference ID'}
              </span>
              <p className="text-xl sm:text-2xl font-mono font-black text-primary mt-0.5 tracking-wider">
                {refId}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={() => onComplete(createdProfile)}
                className="w-full bg-primary hover:bg-primary-light text-white py-3.5 px-6 rounded-full font-extrabold text-sm sm:text-base shadow-lg transition-all cursor-pointer hover:scale-[1.02] flex items-center justify-center gap-2 border-2 border-[#D4AF37]"
              >
                <span>{language === 'TA' ? 'சுயவிவர பயோடேட்டாவைக் காண்க →' : 'View Full Matrimony Profile →'}</span>
              </button>

              <a
                href="/"
                className="block text-gray-500 hover:text-gray-800 text-xs font-bold py-1.5 transition-colors"
              >
                {language === 'TA' ? 'முகப்புப் பக்கத்திற்குச் செல்க' : 'Go to Homepage'}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
