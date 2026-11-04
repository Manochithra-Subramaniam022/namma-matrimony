'use client';

import React, { useState, useEffect } from 'react';
import { Step1PersonalInfo } from './Step1PersonalInfo';
import { Step2FamilyDetails } from './Step2FamilyDetails';
import { Step3Expectations } from './Step3Expectations';
import { Step4Payment } from './Step4Payment';
import { useLanguage } from '@/frontend/context/LanguageContext';
import { BRANDING } from '@/constants/branding';
import BrandLogo from '../BrandLogo';
import { ShieldCheck, Sparkles, CheckCircle2, Heart } from 'lucide-react';

interface ProfileWizardProps {
  language?: 'TA' | 'EN';
  hideHeader?: boolean;
  initialData?: any;
}

const STORAGE_KEY = 'namma_matrimony_draft';

export default function ProfileWizard({
  language: propLang,
  hideHeader = false,
  initialData,
}: ProfileWizardProps) {
  const { language: contextLang, toggleLanguage } = useLanguage();
  const language = propLang || contextLang || 'TA';

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>(initialData || {});
  const [gender, setGender] = useState<string>(initialData?.gender || 'MALE');

  const steps = [
    { titleEn: 'Basic Details', titleTa: 'அடிப்படை விவரங்கள்' },
    { titleEn: 'Family & Career', titleTa: 'குடும்பம் & பணி' },
    { titleEn: 'Preferences', titleTa: 'எதிர்பார்ப்புகள்' },
    { titleEn: 'Review & Complete', titleTa: 'சரிபார்த்தல் & நிறைவு' },
  ];

  // Restore draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
        if (parsed.gender) setGender(parsed.gender);
      }
    } catch (e) {
      console.error('Failed to restore draft', e);
    }
  }, []);

  // Auto-scroll to top smoothly when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const updateFormData = (stepData: any) => {
    const updated = { ...formData, ...stepData };
    setFormData(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save draft', e);
    }
  };

  const handleStep1Next = (data: any) => {
    updateFormData(data);
    if (data.gender) setGender(data.gender);
    setCurrentStep(1);
  };

  const handleStep2Next = (data: any) => {
    updateFormData(data);
    setCurrentStep(2);
  };

  const handleStep3Next = (data: any) => {
    updateFormData(data);
    setCurrentStep(3);
  };

  return (
    <div className="min-h-screen bg-background py-3 sm:py-8 px-2 sm:px-6 lg:px-8 font-sans selection:bg-primary/20">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl border border-primary/15 overflow-hidden relative">
        
        {/* Top Decorative Border in Royal Burgundy & Warm Gold */}
        <div className="h-2.5 sm:h-3 w-full bg-gradient-to-r from-primary via-[#D4AF37] to-primary"></div>

        <div className="p-3.5 sm:p-8 md:p-10">
          
          {/* Header Bar */}
          {!hideHeader && (
            <div className="flex justify-between items-center mb-6 sm:mb-8 border-b border-primary/10 pb-3 sm:pb-4 gap-2">
              <a href="/" className="inline-flex items-center gap-2 min-w-0 shrink">
                <BrandLogo size="md" />
              </a>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* Bilingual Switcher */}
                <div
                  className="flex items-center gap-1.5 sm:gap-2 cursor-pointer bg-primary/5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-primary/15 select-none"
                  onClick={toggleLanguage}
                  title="Translate English / தமிழ்"
                >
                  <span className={`text-[11px] sm:text-xs font-bold ${language !== 'TA' ? 'text-primary' : 'text-gray-400'}`}>
                    Eng
                  </span>
                  <div className="relative inline-flex h-4.5 w-8 sm:h-5 sm:w-9 shrink-0 items-center rounded-full bg-primary transition-colors shadow-inner">
                    <span
                      className={`inline-block h-3 w-3 sm:h-3.5 sm:w-3.5 transform rounded-full bg-white transition-transform shadow-xs ${
                        language === 'TA' ? 'translate-x-[18px] sm:translate-x-[20px]' : 'translate-x-0.5 sm:translate-x-1'
                      }`}
                    />
                  </div>
                  <span className={`text-[11px] sm:text-xs font-bold ${language === 'TA' ? 'text-primary' : 'text-gray-400'}`}>
                    தமிழ்
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Heading Banner */}
          <div className="mb-6 sm:mb-8 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/20 text-primary text-[11px] sm:text-xs font-semibold mb-2 sm:mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span>
                {language === 'TA' ? BRANDING.brandNameTamil : BRANDING.brandName} • {language === 'TA' ? BRANDING.taglineTamil : BRANDING.tagline}
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-primary font-serif tracking-tight">
              {language === 'TA' ? 'சுயவிவரப் பதிவு (Registration Wizard)' : 'Matrimonial Profile Registration'}
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base font-medium mt-1 sm:mt-1.5 max-w-xl mx-auto px-1">
              {language === 'TA'
                ? 'நம்பிக்கையான தமிழ் மேட்ரிமோனி தளத்தில் இணைந்து உங்கள் விருப்பத்திற்கேற்ற சிறந்த துணைவரனை கண்டறியுங்கள்'
                : 'Complete the 4 simple steps below to register your profile and discover compatible life partners.'}
            </p>
          </div>

          {/* 4-Step Progress Tracker */}
          <div className="mb-6 sm:mb-8 relative z-10">
            {/* Mobile View: Concise Step Label + Progress Bars */}
            <div className="sm:hidden mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">
                    {currentStep + 1}
                  </span>
                  <span>{language === 'TA' ? steps[currentStep].titleTa : steps[currentStep].titleEn}</span>
                </span>
                <span className="text-[11px] font-semibold text-gray-500">
                  {currentStep + 1} / 4
                </span>
              </div>
              <div className="flex gap-1.5">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                      idx < currentStep
                        ? 'bg-[#D4AF37]'
                        : idx === currentStep
                          ? 'bg-primary'
                          : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Tablet & Desktop View */}
            <div className="hidden sm:flex gap-2 sm:gap-3 mb-2">
              {steps.map((st, idx) => {
                const isCompleted = idx < currentStep;
                const isActive = idx === currentStep;
                return (
                  <div key={idx} className="flex-1 flex flex-col gap-1.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 shadow-xs ${
                        isCompleted
                          ? 'bg-[#D4AF37]'
                          : isActive
                            ? 'bg-primary ring-2 ring-primary/20'
                            : 'bg-gray-200'
                      }`}
                    />
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-[#D4AF37] text-white'
                            : isActive
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span
                        className={`text-[11px] sm:text-xs font-bold truncate transition-colors duration-300 ${
                          isActive
                            ? 'text-primary'
                            : isCompleted
                              ? 'text-gray-800'
                              : 'text-gray-400'
                        }`}
                      >
                        {language === 'TA' ? st.titleTa : st.titleEn}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trust Banner */}
          <div className="bg-[#FFFDF9] border border-[#D4AF37]/40 p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 flex items-start gap-2.5 sm:gap-3 shadow-xs">
            <div className="p-1.5 sm:p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-bold text-primary flex items-center gap-1.5">
                {language === 'TA' ? '100% தனியுரிமை & பாதுகாப்பு உத்தரவாதம்' : '100% Privacy Protected Registration'}
              </p>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed font-medium">
                {language === 'TA'
                  ? 'உங்கள் தொலைபேசி எண் மற்றும் வீட்டு முகவரி இயல்பாகவே மறைக்கப்படும். பரஸ்பர சம்மதத்துடன் மட்டுமே பகிரப்படும்.'
                  : 'Your mobile number and exact address remain confidential and are shared strictly upon mutual confirmation.'}
              </p>
            </div>
          </div>

          {/* Step Views */}
          <div className="relative">
            {currentStep === 0 && (
              <Step1PersonalInfo
                onNext={handleStep1Next}
                language={language}
                initialData={formData}
                onGenderChange={setGender}
              />
            )}

            {currentStep === 1 && (
              <Step2FamilyDetails
                onNext={handleStep2Next}
                onPrev={() => setCurrentStep(0)}
                language={language}
                initialData={formData}
                gender={gender}
              />
            )}

            {currentStep === 2 && (
              <Step3Expectations
                onNext={handleStep3Next}
                onPrev={() => setCurrentStep(1)}
                language={language}
                initialData={formData}
                gender={gender}
              />
            )}

            {currentStep === 3 && (
              <Step4Payment
                onComplete={() => {
                  window.location.href = '/';
                }}
                onPrev={() => setCurrentStep(2)}
                language={language}
                initialData={formData}
              />
            )}
          </div>
        </div>
      </div>

      {/* FOOTER - 100% Free Community Service with Zero Contact Details */}
      <footer className="mt-8 sm:mt-12 border-t border-primary/10 py-8 sm:py-10 max-w-4xl mx-auto px-2 sm:px-4 text-center">
        <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4">
          <BrandLogo size="md" />
          <p className="text-gray-600 text-xs sm:text-sm max-w-lg leading-relaxed px-2 break-words">
            {language === 'TA' ? BRANDING.subTaglineTamil : BRANDING.subTagline}
          </p>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-emerald-50 text-emerald-800 text-[11px] sm:text-xs font-semibold px-3 sm:px-4 py-1.5 rounded-full border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {language === 'TA'
                ? 'மக்களுக்கு உதவும் 100% முற்றிலும் இலவச சேவை'
                : '100% Free Public Community Initiative'}
            </span>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-4 border-t border-gray-200/60 text-center text-xs text-gray-400 px-2 leading-relaxed break-words">
          © {new Date().getFullYear()} {BRANDING.brandName}. {language === 'TA' ? 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை • 100% இலவச சேவை' : 'All rights reserved • 100% Free Service'}
        </div>
      </footer>
    </div>
  );
}
