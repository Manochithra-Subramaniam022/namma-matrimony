'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, MapPin, Briefcase, CheckCircle2, ArrowLeft, ArrowRight, Sparkles, Building, Compass } from 'lucide-react';
import { formTranslations } from '@/frontend/utils/formTranslations';
import { HEIGHT_OPTIONS } from '@/constants/demographics';

const AGE_GAP_OPTIONS = [
  { value: 0, labelEn: 'Same Age (0 Yrs)', labelTa: 'ஒரே வயது (Same Age - 0 Yrs)' },
  { value: 1, labelEn: 'Up to 1 Year', labelTa: '1 வருடம் வரை (Up to 1 Yr)' },
  { value: 2, labelEn: 'Up to 2 Years', labelTa: '2 வருடங்கள் வரை (Up to 2 Yrs)' },
  { value: 3, labelEn: 'Up to 3 Years', labelTa: '3 வருடங்கள் வரை (Up to 3 Yrs)' },
  { value: 4, labelEn: 'Up to 4 Years', labelTa: '4 வருடங்கள் வரை (Up to 4 Yrs)' },
  { value: 5, labelEn: 'Up to 5 Years', labelTa: '5 வருடங்கள் வரை (Up to 5 Yrs)' },
  { value: 6, labelEn: 'Up to 6 Years', labelTa: '6 வருடங்கள் வரை (Up to 6 Yrs)' },
  { value: 7, labelEn: 'Up to 7 Years', labelTa: '7 வருடங்கள் வரை (Up to 7 Yrs)' },
  { value: 8, labelEn: 'Up to 8 Years', labelTa: '8 வருடங்கள் வரை (Up to 8 Yrs)' },
  { value: 9, labelEn: 'Up to 9 Years', labelTa: '9 வருடங்கள் வரை (Up to 9 Yrs)' },
  { value: 10, labelEn: 'Up to 10 Years', labelTa: '10 வருடங்கள் வரை (Up to 10 Yrs)' },
  { value: 12, labelEn: 'Up to 12 Years', labelTa: '12 வருடங்கள் வரை (Up to 12 Yrs)' },
  { value: 15, labelEn: 'Up to 15 Years', labelTa: '15 வருடங்கள் வரை (Up to 15 Yrs)' },
];

const DISTANCE_OPTIONS = [
  { value: 25, labelEn: 'Within 25 km', labelTa: '25 கி.மீ க்குள் (Within 25 km)' },
  { value: 50, labelEn: 'Within 50 km', labelTa: '50 கி.மீ க்குள் (Within 50 km)' },
  { value: 75, labelEn: 'Within 75 km', labelTa: '75 கி.மீ க்குள் (Within 75 km)' },
  { value: 100, labelEn: 'Within 100 km (Recommended)', labelTa: '100 கி.மீ க்குள் (Within 100 km - பரிந்துரை)' },
  { value: 150, labelEn: 'Within 150 km', labelTa: '150 கி.மீ க்குள் (Within 150 km)' },
  { value: 200, labelEn: 'Within 200 km', labelTa: '200 கி.மீ க்குள் (Within 200 km)' },
  { value: 300, labelEn: 'Within 300 km', labelTa: '300 கி.மீ க்குள் (Within 300 km)' },
  { value: 500, labelEn: 'Anywhere in Tamil Nadu / India (500+ km)', labelTa: 'எந்த தூரமும் (Anywhere / 500+ கி.மீ)' },
];

const EMPLOYMENT_SECTORS = [
  { id: 'IT_SOFTWARE', nameEn: 'IT / Software', nameTa: 'ஐடி / சாப்ட்வேர்' },
  { id: 'BANKING_FINANCE', nameEn: 'Banking & Finance', nameTa: 'வங்கி & நிதித் துறை' },
  { id: 'GOVT_CIVIL', nameEn: 'Govt & Civil Services', nameTa: 'அரசுப் பணி' },
  { id: 'CORE_ENGINEERING', nameEn: 'Core Engineering / Mech / Auto', nameTa: 'பொறியியல் துறை' },
  { id: 'BUSINESS_SELF', nameEn: 'Business / Self-Employed', nameTa: 'சொந்த தொழில்' },
  { id: 'GARMENTS_TEXTILE', nameEn: 'Garments & Textile Export', nameTa: 'ஆடை & ஏற்றுமதி' },
  { id: 'AGRICULTURE_FARMER', nameEn: 'Agriculture & Farm Business', nameTa: 'விவசாயம் & பண்ணை' },
  { id: 'MEDICAL_HEALTHCARE', nameEn: 'Doctor / Healthcare', nameTa: 'மருத்துவம் / மருத்துவர்' },
  { id: 'TEACHING_PROFESSOR', nameEn: 'Professor / Teacher', nameTa: 'பேராசிரியர் / ஆசிரியர்' },
];

const step3Schema = z.object({
  // Partner Demographics
  expectedAgeGap: z.number().min(0).max(15).default(4),
  expectedMinHeightCm: z.number().min(130).max(210).default(155),
  expectedMaxHeightCm: z.number().min(140).max(220).default(180),
  complexionPreference: z.string().default('ANY'),
  maritalStatusAcceptance: z.array(z.string()).default(['NEVER_MARRIED']),

  // Career Expectations
  careerTypePreference: z.enum(['JOB', 'BUSINESS', 'BOTH']).default('BOTH'),
  preferredSectors: z.array(z.string()).default([]),
  expectedMinMonthlyIncome: z.string().optional(),

  // Asset Expectations
  expectsRentalIncome: z.boolean().default(false),
  expectsThottamLand: z.boolean().default(false),
  expectsVacantLand: z.boolean().default(false),
  openToRemarriage: z.boolean().default(false),

  // Location Preferences
  distanceRadiusKm: z.number().min(10).max(500).default(100),
  preferredCity1: z.string().optional(),
  preferredCity2: z.string().optional(),
  preferredCity3: z.string().optional(),
  livingAreaType: z.enum(['METRO', 'SEMI_URBAN', 'VILLAGE', 'ANY']).default('ANY'),

  // References & Notes
  referredBy: z.string().optional(),
  partnerExpectationsNotes: z.string().optional(),
});

type Step3FormValues = z.infer<typeof step3Schema>;

export function Step3Expectations({
  onNext,
  onPrev,
  language = 'TA',
  initialData,
  gender = 'MALE',
}: {
  onNext: (data: Step3FormValues) => void;
  onPrev: () => void;
  language?: 'TA' | 'EN';
  initialData?: any;
  gender?: string;
}) {
  const t = formTranslations[language];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step3FormValues>({
    resolver: zodResolver(step3Schema) as any,
    defaultValues: {
      expectedAgeGap: initialData?.expectedAgeGap || 4,
      expectedMinHeightCm: initialData?.expectedMinHeightCm || (gender === 'MALE' ? 152 : 165),
      expectedMaxHeightCm: initialData?.expectedMaxHeightCm || (gender === 'MALE' ? 168 : 185),
      complexionPreference: initialData?.complexionPreference || 'ANY',
      maritalStatusAcceptance: initialData?.maritalStatusAcceptance || ['NEVER_MARRIED'],

      careerTypePreference: initialData?.careerTypePreference || 'BOTH',
      preferredSectors: initialData?.preferredSectors || ['IT_SOFTWARE', 'GOVT_CIVIL'],
      expectedMinMonthlyIncome: initialData?.expectedMinMonthlyIncome || '',

      expectsRentalIncome: initialData?.expectsRentalIncome || false,
      expectsThottamLand: initialData?.expectsThottamLand || false,
      expectsVacantLand: initialData?.expectsVacantLand || false,
      openToRemarriage: initialData?.openToRemarriage || false,

      distanceRadiusKm: initialData?.distanceRadiusKm || 100,
      preferredCity1: initialData?.preferredCity1 || '',
      preferredCity2: initialData?.preferredCity2 || '',
      preferredCity3: initialData?.preferredCity3 || '',
      livingAreaType: initialData?.livingAreaType || 'ANY',

      referredBy: initialData?.referredBy || '',
      partnerExpectationsNotes: initialData?.partnerExpectationsNotes || '',
    },
  });

  const watchCareerType = watch('careerTypePreference');
  const watchPreferredSectors = watch('preferredSectors');
  const watchLivingArea = watch('livingAreaType');

  const toggleSector = (sectorId: string) => {
    const current = watchPreferredSectors || [];
    if (current.includes(sectorId)) {
      setValue('preferredSectors', current.filter((s) => s !== sectorId));
    } else {
      setValue('preferredSectors', [...current, sectorId]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* 1. PHYSICAL & AGE PREFERENCES */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/15 shadow-sm space-y-4 sm:space-y-6">
        <div className="border-b border-primary/10 pb-3 sm:pb-4">
          <h3 className="text-base sm:text-xl font-black text-primary font-serif flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#D4AF37] shrink-0" />
            {language === 'TA' ? '1. துணையின் தோற்றம் & வயது எதிர்பார்ப்புகள்' : '1. Physical & Age Preferences'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'அதிகபட்ச வயது வித்தியாசம்' : 'Max Age Gap Limit'}
            </label>
            <select
              {...register('expectedAgeGap', { valueAsNumber: true })}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:bg-white focus:outline-none transition-all"
            >
              {AGE_GAP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {language === 'TA' ? opt.labelTa : opt.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'எதிர்பார்க்கும் உயரம் (குறைந்தபட்சம்)' : 'Min Height'}
            </label>
            <select
              {...register('expectedMinHeightCm', { valueAsNumber: true })}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:bg-white focus:outline-none transition-all"
            >
              {HEIGHT_OPTIONS.map((opt) => (
                <option key={opt.cm} value={opt.cm}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'எதிர்பார்க்கும் உயரம் (அதிகபட்சம்)' : 'Max Height'}
            </label>
            <select
              {...register('expectedMaxHeightCm', { valueAsNumber: true })}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:bg-white focus:outline-none transition-all"
            >
              {HEIGHT_OPTIONS.map((opt) => (
                <option key={opt.cm} value={opt.cm}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'நிற விருப்பம் (Complexion Preference)' : 'Complexion Preference'}
            </label>
            <select
              {...register('complexionPreference')}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
            >
              <option value="ANY">{language === 'TA' ? 'எந்த நிறமும் சம்மதம் (Any)' : 'Any Complexion'}</option>
              <option value="FAIR">{language === 'TA' ? 'சிகப்பு (Fair)' : 'Fair'}</option>
              <option value="VERY_FAIR">{language === 'TA' ? 'மிகவும் சிகப்பு (Very Fair)' : 'Very Fair'}</option>
              <option value="WHEATISH">{language === 'TA' ? 'மாநிறம் (Wheatish)' : 'Wheatish'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. CAREER & INCOME EXPECTATIONS */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/15 shadow-sm space-y-4 sm:space-y-6">
        <div className="border-b border-primary/10 pb-3 sm:pb-4">
          <h3 className="text-base sm:text-xl font-black text-primary font-serif flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#D4AF37] shrink-0" />
            {language === 'TA' ? '2. தொழில் & வேலை எதிர்பார்ப்புகள்' : '2. Career & Income Expectations'}
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
              {language === 'TA' ? 'பணி வகை முன்னுரிமை (Career Preference)' : 'Career Type Preference'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 max-w-md">
              {[
                { id: 'JOB', nameEn: 'Job Only', nameTa: 'மாத சம்பள வேலை' },
                { id: 'BUSINESS', nameEn: 'Business Only', nameTa: 'சொந்த தொழில்' },
                { id: 'BOTH', nameEn: 'Job or Business', nameTa: 'வேலை அல்லது தொழில்' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setValue('careerTypePreference', c.id as any)}
                  className={`h-11 px-2 rounded-xl text-xs font-bold transition-all border ${
                    watchCareerType === c.id
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-[#FFFDF9] text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {language === 'TA' ? c.nameTa : c.nameEn}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
              {language === 'TA' ? 'விருப்பமான பணித் துறைகள் (Preferred Employment Sectors)' : 'Preferred Employment Sectors'}
            </label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {EMPLOYMENT_SECTORS.map((sector) => {
                const isSelected = watchPreferredSectors?.includes(sector.id);
                return (
                  <button
                    key={sector.id}
                    type="button"
                    onClick={() => toggleSector(sector.id)}
                    className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-xs ring-2 ring-[#D4AF37]/50'
                        : 'bg-[#FFFDF9] text-gray-700 border-gray-300 hover:border-primary/40'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />}
                    <span>{language === 'TA' ? sector.nameTa : sector.nameEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="max-w-md pt-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'எதிர்பார்க்கும் குறைந்தபட்ச மாத வருமானம்' : 'Expected Minimum Monthly Income (₹)'}
            </label>
            <input
              type="text"
              {...register('expectedMinMonthlyIncome')}
              placeholder="e.g. ₹50,000+ / Any"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* 3. ASSET & BACKGROUND EXPECTATIONS */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/15 shadow-sm space-y-4 sm:space-y-6">
        <div className="border-b border-primary/10 pb-3 sm:pb-4">
          <h3 className="text-base sm:text-xl font-black text-primary font-serif flex items-center gap-2">
            <Building className="w-5 h-5 text-[#D4AF37] shrink-0" />
            {language === 'TA' ? '3. சொத்து & குடும்ப எதிர்பார்ப்புகள்' : '3. Asset & Background Expectations'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="p-4 rounded-2xl bg-[#FFFDF9] border border-gray-200 hover:border-primary/40 flex items-start gap-3 cursor-pointer select-none transition-all">
            <input
              type="checkbox"
              {...register('expectsRentalIncome')}
              className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 accent-primary mt-0.5"
            />
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-800">
                {language === 'TA' ? 'மாதாந்திர வாடகை வருமானம் உள்ள வரன் தேவை' : 'Expects Monthly Rental Income'}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">Commercial or residential rental properties</p>
            </div>
          </label>

          <label className="p-4 rounded-2xl bg-[#FFFDF9] border border-gray-200 hover:border-primary/40 flex items-start gap-3 cursor-pointer select-none transition-all">
            <input
              type="checkbox"
              {...register('expectsThottamLand')}
              className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 accent-primary mt-0.5"
            />
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-800">
                {language === 'TA' ? 'விவசாய நிலம் / தோட்டம் உள்ள வரன் தேவை' : 'Expects Agricultural Land / Thottam'}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">Agricultural background preferred</p>
            </div>
          </label>

          <label className="p-4 rounded-2xl bg-[#FFFDF9] border border-gray-200 hover:border-primary/40 flex items-start gap-3 cursor-pointer select-none transition-all">
            <input
              type="checkbox"
              {...register('expectsVacantLand')}
              className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 accent-primary mt-0.5"
            />
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-800">
                {language === 'TA' ? 'காலி மனை / அடுக்குமாடி குடியிருப்பு' : 'Expects Commercial / Vacant Land'}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">Plots or urban residential properties</p>
            </div>
          </label>

          <label className="p-4 rounded-2xl bg-[#FFFDF9] border border-gray-200 hover:border-primary/40 flex items-start gap-3 cursor-pointer select-none transition-all">
            <input
              type="checkbox"
              {...register('openToRemarriage')}
              className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 accent-primary mt-0.5"
            />
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-800">
                {language === 'TA' ? 'மறுமணம் / விவாகரத்து வரன்கள் சம்மதம்' : 'Open to Divorced / Remarriage Profiles'}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">Willing to consider divorced or widowed alliances</p>
            </div>
          </label>
        </div>
      </div>

      {/* 4. LOCATION PREFERENCES & NOTES */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/15 shadow-sm space-y-4 sm:space-y-6">
        <div className="border-b border-primary/10 pb-3 sm:pb-4">
          <h3 className="text-base sm:text-xl font-black text-primary font-serif flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#D4AF37] shrink-0" />
            {language === 'TA' ? '4. இருப்பிட விருப்பம் & பரிந்துரை விவரங்கள்' : '4. Location Preferences & Reference'}
          </h3>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'வரன் தேடும் தூர எல்லை (Distance Radius)' : 'Search Distance Radius Limit'}
            </label>
            <select
              {...register('distanceRadiusKm', { valueAsNumber: true })}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:bg-white focus:outline-none transition-all"
            >
              {DISTANCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {language === 'TA' ? opt.labelTa : opt.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
              {language === 'TA' ? 'விருப்பமான பகுதியின் தன்மை' : 'Preferred Living Environment'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
              {[
                { id: 'METRO', nameEn: 'Metro / Tier-1 City', nameTa: 'பெருநகரம் (Metro)' },
                { id: 'SEMI_URBAN', nameEn: 'Town / Semi-Urban', nameTa: 'நகரம் / பேரூர்' },
                { id: 'VILLAGE', nameEn: 'Village / Rural', nameTa: 'கிராமப்புறம்' },
                { id: 'ANY', nameEn: 'Any Location', nameTa: 'எந்த இடமும்' },
              ].map((la) => (
                <button
                  key={la.id}
                  type="button"
                  onClick={() => setValue('livingAreaType', la.id as any)}
                  className={`h-11 px-2 rounded-xl text-xs font-bold transition-all border ${
                    watchLivingArea === la.id
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-[#FFFDF9] text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {language === 'TA' ? la.nameTa : la.nameEn}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                {language === 'TA' ? 'விருப்பமான நகரம் 1 (Priority City 1)' : 'Top Preferred City 1'}
              </label>
              <input
                type="text"
                {...register('preferredCity1')}
                placeholder="e.g. Coimbatore"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                {language === 'TA' ? 'விருப்பமான நகரம் 2 (Priority City 2)' : 'Top Preferred City 2'}
              </label>
              <input
                type="text"
                {...register('preferredCity2')}
                placeholder="e.g. Tiruppur"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                {language === 'TA' ? 'விருப்பமான நகரம் 3 (Priority City 3)' : 'Top Preferred City 3'}
              </label>
              <input
                type="text"
                {...register('preferredCity3')}
                placeholder="e.g. Erode / Chennai"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'அறிமுகம் / பரிந்துரை செய்தவர் (Referred By)' : 'Referred By / Contact Reference'}
            </label>
            <input
              type="text"
              {...register('referredBy')}
              placeholder="Friend / Relative / Family Name & Place"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'பிற எதிர்பார்ப்புகள் & குறிப்புகள்' : 'Open Expectations & Family Notes'}
            </label>
            <textarea
              rows={3}
              {...register('partnerExpectationsNotes')}
              placeholder={language === 'TA'
                ? 'குடும்ப வழக்கம், உணவுப் பழக்கம், வேலை சூழல் போன்றவை குறித்த கூடுதல் எதிர்பார்ப்புகள்...'
                : 'Specific family values, living preferences, or additional partner requirements...'}
              className="w-full p-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-0 justify-between items-center pt-3 sm:pt-4">
        <button
          type="button"
          onClick={onPrev}
          className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 sm:px-8 py-3.5 rounded-full font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>{language === 'TA' ? 'முந்தைய படி' : 'Back to Step 2'}</span>
        </button>

        <button
          type="submit"
          className="w-full sm:w-auto bg-primary hover:bg-primary-light text-white px-8 sm:px-10 py-3.5 rounded-full font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{language === 'TA' ? 'நிறைவு செய்ய →' : 'Continue to Complete →'}</span>
        </button>
      </div>
    </form>
  );
}
