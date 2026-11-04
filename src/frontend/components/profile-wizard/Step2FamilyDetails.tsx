'use client';

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Home, Briefcase, Users, DollarSign, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { formTranslations } from '@/frontend/utils/formTranslations';

const step2Schema = z.object({
  // Parents
  fatherName: z.string().min(2, 'Father name is required'),
  fatherStatus: z.enum(['ALIVE', 'LATE']).default('ALIVE'),
  fatherOccupation: z.string().optional(),
  fatherMobile: z.string().optional(),

  motherName: z.string().min(2, 'Mother name is required'),
  motherStatus: z.enum(['ALIVE', 'LATE']).default('ALIVE'),
  motherOccupation: z.string().optional(),
  motherMobile: z.string().optional(),

  // Dynamic Siblings
  siblingsList: z.array(
    z.object({
      name: z.string().min(1, 'Sibling name required'),
      relation: z.enum(['ELDER_BROTHER', 'YOUNGER_BROTHER', 'ELDER_SISTER', 'YOUNGER_SISTER']),
      maritalStatus: z.enum(['MARRIED', 'UNMARRIED']),
    })
  ).default([]),

  // Career
  workNature: z.enum(['PRIVATE', 'GOVT', 'BUSINESS', 'NRI', 'NOT_WORKING']).default('PRIVATE'),
  companyName: z.string().optional(),
  designation: z.string().optional(),
  monthlyIncome: z.string().optional(),
  annualIncome: z.string().optional(),
  workCity: z.string().optional(),
  workMapLink: z.string().optional(),

  // Property & Assets
  houseType: z.enum(['OWN_HOUSE', 'OWN_APARTMENT', 'RENTED', 'ANCESTRAL']).default('OWN_HOUSE'),
  houseSqft: z.string().optional(),
  rentalIncomeMonthly: z.string().optional(),
  agriculturalLandAcres: z.string().optional(),
  vacantLandSqft: z.string().optional(),
  totalNetAssets: z.string().optional(),
  propertyComments: z.string().optional(),

  // Seer / Dowry Details (dynamically adjusted)
  goldPavun: z.string().optional(),
  seerCash: z.string().optional(),
  seerVehicle: z.string().optional(),
});

type Step2FormValues = z.infer<typeof step2Schema>;

export function Step2FamilyDetails({
  onNext,
  onPrev,
  language = 'TA',
  initialData,
  gender = 'MALE',
}: {
  onNext: (data: Step2FormValues) => void;
  onPrev: () => void;
  language?: 'TA' | 'EN';
  initialData?: any;
  gender?: string;
}) {
  const t = formTranslations[language];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema) as any,
    defaultValues: {
      fatherName: initialData?.fatherName || '',
      fatherStatus: initialData?.fatherStatus || 'ALIVE',
      fatherOccupation: initialData?.fatherOccupation || '',
      fatherMobile: initialData?.fatherMobile || '',

      motherName: initialData?.motherName || '',
      motherStatus: initialData?.motherStatus || 'ALIVE',
      motherOccupation: initialData?.motherOccupation || '',
      motherMobile: initialData?.motherMobile || '',

      siblingsList: initialData?.siblingsList?.length ? initialData.siblingsList : [],

      workNature: initialData?.workNature || 'PRIVATE',
      companyName: initialData?.companyName || '',
      designation: initialData?.designation || '',
      monthlyIncome: initialData?.monthlyIncome || '',
      annualIncome: initialData?.annualIncome || '',
      workCity: initialData?.workCity || '',
      workMapLink: initialData?.workMapLink || '',

      houseType: initialData?.houseType || 'OWN_HOUSE',
      houseSqft: initialData?.houseSqft || '',
      rentalIncomeMonthly: initialData?.rentalIncomeMonthly || '',
      agriculturalLandAcres: initialData?.agriculturalLandAcres || '',
      vacantLandSqft: initialData?.vacantLandSqft || '',
      totalNetAssets: initialData?.totalNetAssets || '',
      propertyComments: initialData?.propertyComments || '',

      goldPavun: initialData?.goldPavun || '',
      seerCash: initialData?.seerCash || '',
      seerVehicle: initialData?.seerVehicle || '',
    },
  });

  const { fields: siblingFields, append: appendSibling, remove: removeSibling } = useFieldArray({
    control,
    name: 'siblingsList',
  });

  const watchFatherStatus = watch('fatherStatus');
  const watchMotherStatus = watch('motherStatus');
  const watchWorkNature = watch('workNature');
  const watchHouseType = watch('houseType');

  const handleFormSubmit = (data: Step2FormValues) => {
    const cleanedData = {
      ...data,
      fatherOccupation: data.fatherStatus === 'LATE' ? '' : data.fatherOccupation,
      fatherMobile: data.fatherStatus === 'LATE' ? '' : data.fatherMobile,
      motherOccupation: data.motherStatus === 'LATE' ? '' : data.motherOccupation,
      motherMobile: data.motherStatus === 'LATE' ? '' : data.motherMobile,
    };
    onNext(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* 1. PARENTS DETAILS */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/15 shadow-sm space-y-4 sm:space-y-6">
        <div className="border-b border-primary/10 pb-3 sm:pb-4">
          <h3 className="text-base sm:text-xl font-black text-primary font-serif flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D4AF37] shrink-0" />
            {language === 'TA' ? '1. பெற்றோர் விவரங்கள் (Parents Information)' : '1. Parents Information'}
          </h3>
        </div>

        {/* Father Details */}
        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#FFFDF9] border border-primary/10 space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center gap-2">
            <h4 className="text-xs sm:text-sm font-bold text-primary font-serif">
              {language === 'TA' ? 'தந்தை விவரங்கள் (Father Details)' : 'Father Information'}
            </h4>
            <div className="flex gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setValue('fatherStatus', 'ALIVE')}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  watchFatherStatus === 'ALIVE' ? 'bg-primary text-white shadow-xs' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {language === 'TA' ? 'உயிருடன் உள்ளார் (Alive)' : 'Alive'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue('fatherStatus', 'LATE');
                  setValue('fatherOccupation', '');
                  setValue('fatherMobile', '');
                }}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  watchFatherStatus === 'LATE' ? 'bg-primary text-white shadow-xs' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {language === 'TA' ? 'மறைந்தார் (Late)' : 'Late'}
              </button>
            </div>
          </div>

          <div className={watchFatherStatus === 'LATE' ? 'max-w-md' : 'grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'}>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 after:content-['*'] after:ml-1 after:text-primary">
                {language === 'TA'
                  ? (watchFatherStatus === 'LATE' ? 'மறைந்த தந்தை பெயர் (Late Father Name)' : 'தந்தை பெயர் (Father Name)')
                  : (watchFatherStatus === 'LATE' ? 'Late Father Name' : 'Father Full Name')}
              </label>
              <input
                type="text"
                {...register('fatherName')}
                placeholder={watchFatherStatus === 'LATE' ? 'e.g. Late S. Subramaniam' : 'e.g. S. Subramaniam'}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
              />
              {errors.fatherName && <p className="text-xs text-red-600 font-semibold mt-1">{errors.fatherName.message}</p>}
            </div>

            {watchFatherStatus !== 'LATE' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    {language === 'TA' ? 'தந்தை தொழில் / நிலை' : 'Father Occupation'}
                  </label>
                  <input
                    type="text"
                    {...register('fatherOccupation')}
                    placeholder="e.g. Business / Agriculture / Retired"
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    {language === 'TA' ? 'தந்தை மொபைல் எண்' : 'Father Mobile Number'}
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    {...register('fatherMobile')}
                    placeholder="9876543210"
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mother Details */}
        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#FFFDF9] border border-primary/10 space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center gap-2">
            <h4 className="text-xs sm:text-sm font-bold text-primary font-serif">
              {language === 'TA' ? 'தாய் விவரங்கள் (Mother Details)' : 'Mother Information'}
            </h4>
            <div className="flex gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setValue('motherStatus', 'ALIVE')}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  watchMotherStatus === 'ALIVE' ? 'bg-primary text-white shadow-xs' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {language === 'TA' ? 'உயிருடன் உள்ளார் (Alive)' : 'Alive'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue('motherStatus', 'LATE');
                  setValue('motherOccupation', '');
                  setValue('motherMobile', '');
                }}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  watchMotherStatus === 'LATE' ? 'bg-primary text-white shadow-xs' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {language === 'TA' ? 'மறைந்தார் (Late)' : 'Late'}
              </button>
            </div>
          </div>

          <div className={watchMotherStatus === 'LATE' ? 'max-w-md' : 'grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'}>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 after:content-['*'] after:ml-1 after:text-primary">
                {language === 'TA'
                  ? (watchMotherStatus === 'LATE' ? 'மறைந்த தாய் பெயர் (Late Mother Name)' : 'தாய் பெயர் (Mother Name)')
                  : (watchMotherStatus === 'LATE' ? 'Late Mother Name' : 'Mother Full Name')}
              </label>
              <input
                type="text"
                {...register('motherName')}
                placeholder={watchMotherStatus === 'LATE' ? 'e.g. Late S. Lakshmi' : 'e.g. S. Lakshmi'}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
              />
              {errors.motherName && <p className="text-xs text-red-600 font-semibold mt-1">{errors.motherName.message}</p>}
            </div>

            {watchMotherStatus !== 'LATE' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    {language === 'TA' ? 'தாய் தொழில் / நிலை' : 'Mother Occupation'}
                  </label>
                  <input
                    type="text"
                    {...register('motherOccupation')}
                    placeholder="e.g. Homemaker / Teacher / Govt"
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    {language === 'TA' ? 'தாய் மொபைல் எண்' : 'Mother Mobile Number'}
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    {...register('motherMobile')}
                    placeholder="9876543210"
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC SIBLINGS DETAILS */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/15 shadow-sm space-y-4 sm:space-y-6">
        <div className="border-b border-primary/10 pb-3 sm:pb-4 flex justify-between items-center gap-2">
          <div>
            <h3 className="text-base sm:text-xl font-black text-primary font-serif">
              {language === 'TA' ? '2. உடன்பிறப்புகள் விவரங்கள் (Siblings Details)' : '2. Siblings Details'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === 'TA' ? 'அண்ணன், தம்பி, அக்கா, தங்கை விவரங்களை சேர்க்கலாம்' : 'Add brothers and sisters'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => appendSibling({ name: '', relation: 'ELDER_BROTHER', maritalStatus: 'UNMARRIED' })}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary text-white hover:bg-primary-light transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            {language === 'TA' ? 'உடன்பிறப்பு சேர்க்க' : 'Add Sibling'}
          </button>
        </div>

        {siblingFields.length === 0 ? (
          <p className="text-xs text-gray-500 italic p-3.5 sm:p-4 text-center bg-gray-50 rounded-xl sm:rounded-2xl border border-dashed border-gray-200">
            {language === 'TA' ? 'உடன்பிறப்புகள் இல்லை என்றால் தவிர்க்கலாம்' : 'No siblings added yet (Optional)'}
          </p>
        ) : (
          <div className="space-y-3">
            {siblingFields.map((field, idx) => (
              <div key={field.id} className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#FFFDF9] border border-gray-200 grid grid-cols-1 sm:grid-cols-4 gap-2.5 sm:gap-3 items-center">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    {...register(`siblingsList.${idx}.name`)}
                    placeholder="Sibling Full Name"
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-white text-xs font-medium"
                  />
                </div>
                <div>
                  <select
                    {...register(`siblingsList.${idx}.relation`)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-white text-xs font-bold"
                  >
                    <option value="ELDER_BROTHER">{language === 'TA' ? 'அண்ணன் (Elder Brother)' : 'Elder Brother'}</option>
                    <option value="YOUNGER_BROTHER">{language === 'TA' ? 'தம்பி (Younger Brother)' : 'Younger Brother'}</option>
                    <option value="ELDER_SISTER">{language === 'TA' ? 'அக்கா (Elder Sister)' : 'Elder Sister'}</option>
                    <option value="YOUNGER_SISTER">{language === 'TA' ? 'தங்கை (Younger Sister)' : 'Younger Sister'}</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    {...register(`siblingsList.${idx}.maritalStatus`)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-white text-xs font-medium"
                  >
                    <option value="UNMARRIED">{language === 'TA' ? 'திருமணம் ஆகாதவர்' : 'Unmarried'}</option>
                    <option value="MARRIED">{language === 'TA' ? 'திருமணம் ஆனவர்' : 'Married'}</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeSibling(idx)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. GROOM / BRIDE CAREER DETAILS */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/15 shadow-sm space-y-4 sm:space-y-6">
        <div className="border-b border-primary/10 pb-3 sm:pb-4">
          <h3 className="text-base sm:text-xl font-black text-primary font-serif flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#D4AF37] shrink-0" />
            {language === 'TA' ? '3. தொழில் & வேலை விவரங்கள் (Career Details)' : '3. Career & Employment Details'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6">
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
              {language === 'TA' ? 'பணியின் தன்மை (Work Nature)' : 'Employment Nature'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
              {[
                { id: 'PRIVATE', nameEn: 'Private Company', nameTa: 'தனியார் நிறுவனம்' },
                { id: 'GOVT', nameEn: 'Govt / PSU', nameTa: 'அரசுப் பணி' },
                { id: 'BUSINESS', nameEn: 'Business / Self', nameTa: 'சொந்த தொழில்' },
                { id: 'NRI', nameEn: 'Abroad / NRI', nameTa: 'வெளிநாடு (NRI)' },
                { id: 'NOT_WORKING', nameEn: 'Not Working', nameTa: 'பணியில் இல்லை' },
              ].map((wn, idx) => (
                <button
                  key={wn.id}
                  type="button"
                  onClick={() => setValue('workNature', wn.id as any)}
                  className={`h-11 px-2 rounded-xl text-xs font-bold transition-all border ${
                    idx === 4 ? 'col-span-2 sm:col-span-1' : ''
                  } ${
                    watchWorkNature === wn.id
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-[#FFFDF9] text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {language === 'TA' ? wn.nameTa : wn.nameEn}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'நிறுவனம் / வணிகப் பெயர்' : 'Company / Business Name'}
            </label>
            <input
              type="text"
              {...register('companyName')}
              placeholder="e.g. TCS / Self Firm"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'பதவி / பொறுப்பு (Role / Designation)' : 'Role / Designation'}
            </label>
            <input
              type="text"
              {...register('designation')}
              placeholder="e.g. Software Engineer / Manager"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'மாத வருமானம் (Monthly Income in ₹)' : 'Monthly Income (₹)'}
            </label>
            <input
              type="text"
              {...register('monthlyIncome')}
              placeholder="e.g. 75,000"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'ஆண்டு வருமானம் (Annual Income in LPA)' : 'Annual Income (LPA)'}
            </label>
            <input
              type="text"
              {...register('annualIncome')}
              placeholder="e.g. 9.5 LPA"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'பணிபுரியும் இடம் (Work Location)' : 'Work Location City'}
            </label>
            <input
              type="text"
              {...register('workCity')}
              placeholder="e.g. Chennai / Bangalore / Coimbatore"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'கூகுள் வரைபட இணைப்பு (Google Map Link)' : 'Google Map Link (Optional)'}
            </label>
            <input
              type="url"
              {...register('workMapLink')}
              placeholder="https://maps.app.goo.gl/..."
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* 4. PROPERTY & ASSETS DETAILS */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/15 shadow-sm space-y-4 sm:space-y-6">
        <div className="border-b border-primary/10 pb-3 sm:pb-4">
          <h3 className="text-base sm:text-xl font-black text-primary font-serif flex items-center gap-2">
            <Home className="w-5 h-5 text-[#D4AF37] shrink-0" />
            {language === 'TA' ? '4. சொத்து மற்றும் பூர்வீக விவரங்கள்' : '4. Property & Asset Details'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6">
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
              {language === 'TA' ? 'வீட்டு வகை (House Ownership)' : 'House Ownership Status'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
              {[
                { id: 'OWN_HOUSE', nameEn: 'Own Independent House', nameTa: 'சொந்த வீடு / பங்களா' },
                { id: 'OWN_APARTMENT', nameEn: 'Own Apartment / Flat', nameTa: 'சொந்த அடுக்குமாடி' },
                { id: 'RENTED', nameEn: 'Rented House', nameTa: 'வாடகை வீடு' },
                { id: 'ANCESTRAL', nameEn: 'Ancestral Village Home', nameTa: 'பூர்வீக வீடு' },
              ].map((ht) => (
                <button
                  key={ht.id}
                  type="button"
                  onClick={() => setValue('houseType', ht.id as any)}
                  className={`h-11 px-2 rounded-xl text-xs font-bold transition-all border ${
                    watchHouseType === ht.id
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-[#FFFDF9] text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {language === 'TA' ? ht.nameTa : ht.nameEn}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'வீட்டு தரைப்பரப்பு (Built-up Area in Sq.Ft)' : 'House Area (Sq.Ft)'}
            </label>
            <input
              type="text"
              {...register('houseSqft')}
              placeholder="e.g. 2400 Sq.Ft"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'மாத வாடகை வருமானம் (Monthly Rental Income)' : 'Monthly Rental Income (₹)'}
            </label>
            <input
              type="text"
              {...register('rentalIncomeMonthly')}
              placeholder="e.g. 30,000"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'விவசாய நிலம் / தோட்டம் (Acres / Cents)' : 'Agricultural Land (Acres / Cents)'}
            </label>
            <input
              type="text"
              {...register('agriculturalLandAcres')}
              placeholder="e.g. 5 Acres / 50 Cents"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'காலி மனை / வணிக இடம் (Vacant Land Sq.Ft)' : 'Vacant Plot / Commercial (Sq.Ft)'}
            </label>
            <input
              type="text"
              {...register('vacantLandSqft')}
              placeholder="e.g. 2400 Sq.Ft"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'மொத்த சொத்து மதிப்பு (Estimated Net Assets)' : 'Total Net Assets Estimate'}
            </label>
            <input
              type="text"
              {...register('totalNetAssets')}
              placeholder="e.g. 2 - 3 Crores"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>

          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'கூடுதல் சொத்து விவரங்கள் / குறிப்புகள்' : 'Additional Asset Notes / Comments'}
            </label>
            <input
              type="text"
              {...register('propertyComments')}
              placeholder="e.g. Borewell with good water source, coconut trees, rental commercial shops"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Dowry / Seer Details */}
        <div className="pt-4 border-t border-primary/10">
          <h4 className="text-xs font-bold text-primary uppercase mb-3 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-[#D4AF37]" />
            {gender === 'FEMALE'
              ? (language === 'TA' ? 'வழங்கும் சீர்வரிசை விவரங்கள் (Seer / Dowry Plan)' : 'Seer / Dowry Expected to Provide')
              : (language === 'TA' ? 'எதிர்பார்க்கும் சீர்வரிசை / அன்பளிப்பு விவரங்கள்' : 'Expected Seer / Dowry Overview')}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                {language === 'TA' ? 'தங்கம் / பவுன் (Gold in Sovereigns / Pavun)' : 'Gold (in Pavun)'}
              </label>
              <input
                type="text"
                {...register('goldPavun')}
                placeholder="e.g. 50 Pavun"
                className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-[#FFFDF9] text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                {language === 'TA' ? 'ரொக்கம் / பணம் (Cash in Lakhs)' : 'Cash / Deposit'}
              </label>
              <input
                type="text"
                {...register('seerCash')}
                placeholder="e.g. 10 Lakhs"
                className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-[#FFFDF9] text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                {language === 'TA' ? 'வாகனம் (Vehicle / Car)' : 'Vehicle (Car / Two Wheeler)'}
              </label>
              <input
                type="text"
                {...register('seerVehicle')}
                placeholder="e.g. SUV / Car"
                className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-[#FFFDF9] text-xs font-medium"
              />
            </div>
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
          <span>{language === 'TA' ? 'முந்தைய படி' : 'Back to Step 1'}</span>
        </button>

        <button
          type="submit"
          className="w-full sm:w-auto bg-primary hover:bg-primary-light text-white px-8 sm:px-10 py-3.5 rounded-full font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{language === 'TA' ? 'அடுத்த படிக்குச் செல்க →' : 'Continue to Step 3 →'}</span>
        </button>
      </div>
    </form>
  );
}
