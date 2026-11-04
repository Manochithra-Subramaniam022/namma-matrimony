'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Eye, EyeOff, CheckCircle2, ShieldCheck, Sparkles, AlertCircle, FileText } from 'lucide-react';
import { FileUpload } from '../FileUpload';
import { HouseData } from '../JathagamChart';
import { rasiOptions, nakshatraByRasi, allNakshatras } from '@/frontend/utils/astrology';
import { formTranslations } from '@/frontend/utils/formTranslations';
import { RELIGION_OPTIONS, CASTE_OPTIONS, SUB_CASTE_OPTIONS, translateTerm, HEIGHT_OPTIONS } from '@/constants/demographics';

const KVG_KOOTTAMS = [
  "Aandai (ஆந்தை)","Aadar (ஆடர்)","Aadhi (ஆதி / ஆதிக்குலம்)","Aadhirai (ஆதிரை)","Aadhitreya Kumban (ஆதித்தேய கும்பன்)","Aanthuvan (அந்துவன்)","Aavan (ஆவன்)","Agini / Akini (அக்கினி)","Alagan / Azhagu (அழகன் / அழகு)","Anangan (அனகன் / அனங்கன்)","Ariyan / Ashariyan (ஆரியன் / அஷரியன்)","Bharatan (பாரதன்)","Bramman (பிரம்மா)","Dananjayan / Thananjayan (தனஞ்செயன்)","Danavantan (தனவந்தன்)","Devendran (தேவேந்திரன்)","Eenjan (ஈஞ்சன்)","Ennai (எண்ணை)","Kaadan (காடன்)","Kaadai (காடை)","Kaari (காரி)","Kalingarayan (காலிங்கராயன்)","Kanavalan (கணவாளன்)","Kanakkan (கணக்கன்)","Kannan (கண்ணன்)","Kannanthai (கண்ணாந்தை)","Keeran (கீரன்)","Koorai (கூறை)","Koovendhar (கோவேந்தர்)","Kuzhalayan (குழையன்)","Maadar (மாடர்)","Maadai (மாடை)","Maniyan (மணியன்)","Mayilar (மயிலர்)","Medhi (மேதி)","Mulan (மூலன்)","Mutthan (முத்தன்)","Muzhukathan (முழுக்காதன்)","Neerunniyar (நீருண்ணியர்)","Ozukkar (ஒழுக்கர்)","Pallavarayan (பல்லவராயன்)","Panagkaadar (பனங்காடர்)","Pandiyan (பாண்டியன்)","Pannai (பண்ணை)","Pathuman (பதுமன்)","Pavazhalar (பவழர்)","Payiran (பயிரன்)","Periyan (பெரியன்)","Perunkudi (பெருங்குடி)","Pillar (பில்லர்)","Podiyan (பொடியன்)","Ponnar (பொன்னர்)","Poochadhai (பூச்சந்தை)","Poodhiyan (பூதியன்)","Poosan (பூசன்)","Poondhai (பூந்தை)","Porulaanthai (பொருளாந்தை)","Saakadai (சாகாடை)","Sathanthai (சாத்தந்தை)","Sanagan (சனகன்)","Sedan (சேடன்)","Sellan (செல்லன்)","Sembonn (செம்பொன்)","Sempoothan (செம்பூதன்)","Semvan (செம்வன்)","Sengannan (செங்கண்ணன்)","Sengunni (செங்குன்னி)","Seralan (சேரலன்)","Seran (சேரன்)","Sevadi (சேவடி)","Sevvayan (செவ்வாயர்)","Sevvandhi (செவ்வந்தி)","Silamban (சிலம்பன்)","Soman (சோமன்)","Soolan (சூலன்)","Sooriyan (சூரியன்)","Thanakkavan (தனக்கவன்)","Thavalayan (தவளையன்)","Themaan (தேமான்)","Thodai (தோடை)","Thooran (தூரன்)","Thorakkan (தொரக்கன்)","Uvanan (உவணன்)","Uzhavan (உழவன்)","Vaanan (வாணன்)","Vannakkan (வண்ணக்கன்)","Veliyan (வெளியன்)","Vellamban (வெள்ளம்பர்)","Vendhai (வெந்தை)","Viliyan (விளையன்)","Villi (வில்லி)","Other / Not Listed"
];

const step1Schema = z.object({
  // Contact & Auth
  whatsappNumber: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit WhatsApp number'),
  secondaryMobile: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
  hideMobile: z.boolean().default(false),
  hideAddress: z.boolean().default(false),
  hidePhoto: z.boolean().default(false),

  // Demographics
  fullName: z.string().min(2, 'Name is required'),
  gender: z.enum(['MALE', 'FEMALE']),
  dob: z.string().min(1, 'Date of birth is required'),
  birthTime: z.string().optional(),
  birthPlace: z.string().optional(),
  country: z.string().default('India'),
  state: z.string().default('Tamil Nadu'),
  city: z.string().min(1, 'City is required'),
  address: z.string().min(3, 'Address is required'),
  locationLandmark: z.string().optional(),

  // Community
  religion: z.string().default('Hindu'),
  caste: z.string().min(1, 'Caste is required'),
  subCaste: z.string().optional(),
  koottam: z.string().optional(),
  customKoottam: z.string().optional(),

  // Physical Attributes
  heightCm: z.number().min(100).max(250),
  weightKg: z.number().optional(),
  physicalCondition: z.enum(['NORMAL', 'DIFFERENTLY_ABLED']).default('NORMAL'),
  complexion: z.enum(['FAIR', 'VERY_FAIR', 'WHEATISH', 'DUSKY']).default('WHEATISH'),

  // Marital Status
  maritalStatus: z.enum(['NEVER_MARRIED', 'DIVORCED', 'WIDOWED', 'AWAITING_DIVORCE']),
  marriageYear: z.string().optional(),
  divorceYear: z.string().optional(),
  haveChildren: z.boolean().default(false),
  childrenCount: z.number().optional(),
  childrenDetails: z.string().optional(),

  // Habits
  familyStatus: z.enum(['MIDDLE_CLASS', 'UPPER_MIDDLE_CLASS', 'RICH', 'AFFLUENT']).default('MIDDLE_CLASS'),
  foodHabit: z.enum(['VEGETARIAN', 'NON_VEGETARIAN', 'EGGETARIAN']).default('VEGETARIAN'),
  smokingHabit: z.enum(['NO', 'OCCASIONALLY', 'YES']).default('NO'),
  drinkingHabit: z.enum(['NO', 'OCCASIONALLY', 'YES']).default('NO'),

  // Astrology
  rasi: z.string().optional(),
  nakshatram: z.string().optional(),
  poruthaNakshatram: z.array(z.string()).default([]),
  doshams: z.array(z.string()).default([]),
  dasaPlanet: z.string().optional(),
  dasaYears: z.number().optional(),
  dasaMonths: z.number().optional(),
  dasaDays: z.number().optional(),

  // Dynamic Education
  educationList: z.array(
    z.object({
      level: z.string().min(1, 'Level required'),
      degree: z.string().min(1, 'Degree required'),
      institution: z.string().optional(),
    })
  ).default([{ level: 'UG', degree: 'B.E / B.Tech', institution: '' }]),

  // Documents
  photoUrl: z.string().optional(),
  horoscopeUrl: z.string().optional(),
  idProofUrl: z.string().optional(),
  casteCertificateUrl: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type Step1FormValues = z.infer<typeof step1Schema>;

export function Step1PersonalInfo({
  onNext,
  language = 'TA',
  initialData,
  onGenderChange,
}: {
  onNext: (data: Step1FormValues) => void;
  language?: 'TA' | 'EN';
  initialData?: any;
  onGenderChange?: (gender: string) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRasi, setSelectedRasi] = useState<string>(initialData?.rasi || '');
  const [isExtractingOcr, setIsExtractingOcr] = useState(false);
  const [rasiHouses, setRasiHouses] = useState<HouseData[]>([]);
  const [amsamHouses, setAmsamHouses] = useState<HouseData[]>([]);

  const t = formTranslations[language];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema) as any,
    defaultValues: {
      whatsappNumber: initialData?.whatsappNumber || '',
      secondaryMobile: initialData?.secondaryMobile || '',
      email: initialData?.email || '',
      password: initialData?.password || '',
      confirmPassword: initialData?.confirmPassword || '',
      hideMobile: initialData?.hideMobile ?? false,
      hideAddress: initialData?.hideAddress ?? false,
      hidePhoto: initialData?.hidePhoto ?? false,

      fullName: initialData?.fullName || '',
      gender: initialData?.gender || 'MALE',
      dob: initialData?.dob || '',
      birthTime: initialData?.birthTime || '',
      birthPlace: initialData?.birthPlace || '',
      country: initialData?.country || 'India',
      state: initialData?.state || 'Tamil Nadu',
      city: initialData?.city || '',
      address: initialData?.address || '',
      locationLandmark: initialData?.locationLandmark || '',

      religion: initialData?.religion || 'Hindu',
      caste: initialData?.caste || 'Kongu Vellalar Gounder',
      subCaste: initialData?.subCaste || '',
      koottam: initialData?.koottam || '',
      customKoottam: initialData?.customKoottam || '',

      heightCm: initialData?.heightCm || 168,
      weightKg: initialData?.weightKg || 65,
      physicalCondition: initialData?.physicalCondition || 'NORMAL',
      complexion: initialData?.complexion || 'WHEATISH',

      maritalStatus: initialData?.maritalStatus || 'NEVER_MARRIED',
      marriageYear: initialData?.marriageYear || '',
      divorceYear: initialData?.divorceYear || '',
      haveChildren: initialData?.haveChildren || false,
      childrenCount: initialData?.childrenCount || 0,
      childrenDetails: initialData?.childrenDetails || '',

      familyStatus: initialData?.familyStatus || 'MIDDLE_CLASS',
      foodHabit: initialData?.foodHabit || 'VEGETARIAN',
      smokingHabit: initialData?.smokingHabit || 'NO',
      drinkingHabit: initialData?.drinkingHabit || 'NO',

      rasi: initialData?.rasi || '',
      nakshatram: initialData?.nakshatram || '',
      poruthaNakshatram: initialData?.poruthaNakshatram || [],
      doshams: initialData?.doshams || [],
      dasaPlanet: initialData?.dasaPlanet || 'Sun',
      dasaYears: initialData?.dasaYears || 0,
      dasaMonths: initialData?.dasaMonths || 0,
      dasaDays: initialData?.dasaDays || 0,

      educationList: initialData?.educationList?.length
        ? initialData.educationList
        : [{ level: 'UG', degree: 'B.E / B.Tech', institution: '' }],

      photoUrl: initialData?.photoUrl || '',
      horoscopeUrl: initialData?.horoscopeUrl || '',
      idProofUrl: initialData?.idProofUrl || '',
      casteCertificateUrl: initialData?.casteCertificateUrl || '',
    },
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control,
    name: 'educationList',
  });

  const watchGender = watch('gender');
  const watchMaritalStatus = watch('maritalStatus');
  const watchReligion = watch('religion');
  const watchKoottam = watch('koottam');
  const watchDoshams = watch('doshams');
  const watchPorutham = watch('poruthaNakshatram');
  const watchDob = watch('dob');

  useEffect(() => {
    onGenderChange?.(watchGender);
  }, [watchGender, onGenderChange]);

  // Calculate age from DOB
  const calculateAge = (dobString: string) => {
    if (!dobString) return null;
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return null;
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };
  const currentAge = calculateAge(watchDob);

  const handleRasiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedRasi(val);
    setValue('rasi', val);
    setValue('nakshatram', ''); // reset nakshatram when rasi changes
  };

  const toggleDosham = (doshamName: string) => {
    const current = watchDoshams || [];
    if (doshamName === 'NONE') {
      setValue('doshams', ['NONE']);
      return;
    }
    const filtered = current.filter((d) => d !== 'NONE');
    if (filtered.includes(doshamName)) {
      setValue('doshams', filtered.filter((d) => d !== doshamName));
    } else {
      setValue('doshams', [...filtered, doshamName]);
    }
  };

  const togglePoruthaNakshatra = (nak: string) => {
    const current = watchPorutham || [];
    if (current.includes(nak)) {
      setValue('poruthaNakshatram', current.filter((n) => n !== nak));
    } else {
      setValue('poruthaNakshatram', [...current, nak]);
    }
  };

  const handleOcrSimulate = () => {
    setIsExtractingOcr(true);
    setTimeout(() => {
      setValue('rasi', 'Simmam');
      setSelectedRasi('Simmam');
      setValue('nakshatram', 'Magam');
      setValue('doshams', ['NONE']);
      setValue('dasaPlanet', 'Ketu');
      setValue('dasaYears', 4);
      setValue('dasaMonths', 2);
      setValue('dasaDays', 15);
      setIsExtractingOcr(false);
    }, 1500);
  };

  const onFormSubmit = (data: Step1FormValues) => {
    // Attach astrology houses to data payload
    const fullData = {
      ...data,
      rasiHouses,
      amsamHouses,
    };
    onNext(fullData);
  };

  const availableNakshatras = selectedRasi ? nakshatraByRasi[selectedRasi] || [] : allNakshatras;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* 1. ACCOUNT & CONTACT DETAILS */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/15 shadow-sm space-y-4 sm:space-y-6">
        <div className="border-b border-primary/10 pb-3 sm:pb-4 flex items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-xl font-black text-primary font-serif">
              {language === 'TA' ? '1. தொடர்பு & கணக்கு விவரங்கள்' : '1. Contact & Account Details'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === 'TA' ? 'சுயவிவர உள்நுழைவு மற்றும் தொடர்புக்குப் பயன்படும்' : 'Used for profile login and primary contact'}
            </p>
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-[#D4AF37] bg-primary/5 px-2.5 sm:px-3 py-1 rounded-full border border-[#D4AF37]/30 shrink-0">
            Mandatory
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 after:content-['*'] after:ml-1 after:text-primary">
              {language === 'TA' ? 'முதன்மை தொடர்பு எண் (Mobile Number)' : 'Primary Mobile Number'}
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 sm:px-3.5 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-700 font-bold text-xs sm:text-sm shrink-0">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                {...register('whatsappNumber')}
                placeholder="9876543210"
                className="w-full h-11 px-3 sm:px-3.5 rounded-r-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:bg-white focus:outline-none transition-all"
              />
            </div>
            {errors.whatsappNumber && <p className="text-xs text-red-600 font-semibold mt-1">{errors.whatsappNumber.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'கூடுதல் தொலைபேசி எண் (Secondary Mobile)' : 'Secondary Mobile Number (Optional)'}
            </label>
            <input
              type="tel"
              maxLength={10}
              {...register('secondaryMobile')}
              placeholder="9876543210"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'மின்னஞ்சல் முகவரி (Email)' : 'Email Address (Optional)'}
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder="example@gmail.com"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 sm:col-span-1">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 after:content-['*'] after:ml-1 after:text-primary">
                {language === 'TA' ? 'கடவுச்சொல்' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full h-11 px-3.5 pr-10 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:bg-white focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600 font-semibold mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 after:content-['*'] after:ml-1 after:text-primary">
                {language === 'TA' ? 'உறுதி செய்க' : 'Confirm'}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  placeholder="••••••••"
                  className="w-full h-11 px-3.5 pr-10 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:bg-white focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-600 font-semibold mt-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>
        </div>

        {/* Privacy Toggles */}
        <div className="bg-[#FFFDF9] border border-primary/10 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 mt-4">
          <h4 className="text-xs font-bold text-primary uppercase mb-2.5 sm:mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
            {language === 'TA' ? 'தனியுரிமை கட்டுப்பாடுகள் (Privacy Switches)' : 'Privacy Protection Controls'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('hideMobile')}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 accent-primary"
              />
              <span className="text-xs text-gray-700 font-medium">
                {language === 'TA' ? 'மொபைல் எண்ணை மறைக்கவும்' : 'Hide Mobile Number'}
              </span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('hideAddress')}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 accent-primary"
              />
              <span className="text-xs text-gray-700 font-medium">
                {language === 'TA' ? 'வீட்டு முகவரியை மறைக்கவும்' : 'Hide House Address'}
              </span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('hidePhoto')}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 accent-primary"
              />
              <span className="text-xs text-gray-700 font-medium">
                {language === 'TA' ? 'புகைப்படத்தை மறைக்கவும்' : 'Hide Photo from Public'}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* 2. PERSONAL DEMOGRAPHICS */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/15 shadow-sm space-y-4 sm:space-y-6">
        <div className="border-b border-primary/10 pb-3 sm:pb-4">
          <h3 className="text-base sm:text-xl font-black text-primary font-serif">
            {language === 'TA' ? '2. தனிநபர் விவரங்கள் (Personal Details)' : '2. Personal Demographics'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 after:content-['*'] after:ml-1 after:text-primary">
              {language === 'TA' ? 'முழுப்பெயர் (Full Name)' : 'Full Name'}
            </label>
            <input
              type="text"
              {...register('fullName')}
              placeholder="e.g. S. Karthik"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:bg-white focus:outline-none transition-all"
            />
            {errors.fullName && <p className="text-xs text-red-600 font-semibold mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 after:content-['*'] after:ml-1 after:text-primary">
              {language === 'TA' ? 'பாலினம் (Gender)' : 'Gender'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setValue('gender', 'MALE')}
                className={`h-11 rounded-xl text-xs font-bold transition-all border ${
                  watchGender === 'MALE'
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-[#FFFDF9] text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {language === 'TA' ? 'ஆண் (Male)' : 'Male'}
              </button>
              <button
                type="button"
                onClick={() => setValue('gender', 'FEMALE')}
                className={`h-11 rounded-xl text-xs font-bold transition-all border ${
                  watchGender === 'FEMALE'
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-[#FFFDF9] text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {language === 'TA' ? 'பெண் (Female)' : 'Female'}
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase after:content-['*'] after:ml-1 after:text-primary">
                {language === 'TA' ? 'பிறந்த தேதி (DOB)' : 'Date of Birth'}
              </label>
              {currentAge !== null && (
                <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {currentAge} {language === 'TA' ? 'வயது' : 'Years'}
                </span>
              )}
            </div>
            <input
              type="date"
              {...register('dob')}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:bg-white focus:outline-none transition-all"
            />
            {errors.dob && <p className="text-xs text-red-600 font-semibold mt-1">{errors.dob.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'பிறந்த நேரம் (Birth Time - 12h AM/PM)' : 'Birth Time (12h AM/PM)'}
            </label>
            <input
              type="text"
              {...register('birthTime')}
              placeholder="e.g. 10:45 AM"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'பிறந்த இடம் (Place of Birth)' : 'Place of Birth'}
            </label>
            <input
              type="text"
              {...register('birthPlace')}
              placeholder="e.g. Coimbatore, Tamil Nadu"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 after:content-['*'] after:ml-1 after:text-primary">
              {language === 'TA' ? 'உயரம் (Height)' : 'Height'}
            </label>
            <select
              {...register('heightCm', { valueAsNumber: true })}
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
              {language === 'TA' ? 'எடை (Weight in kg)' : 'Weight (kg)'}
            </label>
            <input
              type="number"
              {...register('weightKg', { valueAsNumber: true })}
              placeholder="65"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'நிறம் (Complexion)' : 'Complexion'}
            </label>
            <select
              {...register('complexion')}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:bg-white focus:outline-none transition-all"
            >
              <option value="FAIR">{language === 'TA' ? 'சிகப்பு (Fair)' : 'Fair'}</option>
              <option value="VERY_FAIR">{language === 'TA' ? 'மிகவும் சிகப்பு (Very Fair)' : 'Very Fair'}</option>
              <option value="WHEATISH">{language === 'TA' ? 'மாநிறம் (Wheatish)' : 'Wheatish'}</option>
              <option value="DUSKY">{language === 'TA' ? 'கருப்பு / மாநிறம் (Dusky)' : 'Dusky'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'உடல் நிலை (Physical Condition)' : 'Physical Condition'}
            </label>
            <select
              {...register('physicalCondition')}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:bg-white focus:outline-none transition-all"
            >
              <option value="NORMAL">{language === 'TA' ? 'சாதாரண உடல்நிலை (Normal)' : 'Normal'}</option>
              <option value="DIFFERENTLY_ABLED">{language === 'TA' ? 'மாற்றுத்திறனாளி (Differently Abled)' : 'Differently Abled'}</option>
            </select>
          </div>
        </div>

        {/* Community & Koottam Section */}
        <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'மதம் (Religion)' : 'Religion'}
            </label>
            <select
              {...register('religion')}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:bg-white focus:outline-none transition-all"
            >
              {RELIGION_OPTIONS.map((rel) => (
                <option key={rel.value} value={rel.value}>
                  {language === 'TA' ? rel.labelTa : rel.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 after:content-['*'] after:ml-1 after:text-primary">
              {language === 'TA' ? 'சாதி (Caste)' : 'Caste'}
            </label>
            <select
              {...register('caste')}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:bg-white focus:outline-none transition-all"
            >
              {CASTE_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {language === 'TA' ? c.labelTa : c.labelEn}
                </option>
              ))}
            </select>
            {errors.caste && <p className="text-xs text-red-600 font-semibold mt-1">{errors.caste.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'உட்பிரிவு (Sub-Caste)' : 'Sub-Caste'}
            </label>
            <input
              type="text"
              {...register('subCaste')}
              placeholder="e.g. Kongu, Sengunthar"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'கூட்டம் / குலம் / கிளை (Kongu Koottam / Clan)' : 'Koottam / Kulam / Clan'}
            </label>
            <select
              {...register('koottam')}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:bg-white focus:outline-none transition-all"
            >
              <option value="">-- {language === 'TA' ? 'கூட்டத்தைத் தேர்வு செய்யவும்' : 'Select Koottam / Kulam'} --</option>
              {KVG_KOOTTAMS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            {watchKoottam === 'Other / Not Listed' && (
              <input
                type="text"
                {...register('customKoottam')}
                placeholder={language === 'TA' ? 'உங்கள் கூட்டத்தை உள்ளிடவும்' : 'Enter your specific Koottam'}
                className="w-full h-11 mt-2 px-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 after:content-['*'] after:ml-1 after:text-primary">
              {language === 'TA' ? 'வசிக்கும் ஊர் / நகரம் (City)' : 'City / Town'}
            </label>
            <input
              type="text"
              {...register('city')}
              placeholder="e.g. Coimbatore / Tiruppur / Chennai"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:bg-white focus:outline-none transition-all"
            />
            {errors.city && <p className="text-xs text-red-600 font-semibold mt-1">{errors.city.message}</p>}
          </div>

          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 after:content-['*'] after:ml-1 after:text-primary">
              {language === 'TA' ? 'வீட்டு முகவரி & அடையாளம் (Detailed House Address)' : 'Full House Address & Landmark'}
            </label>
            <textarea
              rows={2}
              {...register('address')}
              placeholder="Door No, Street Name, Landmark, Area, Pincode"
              className="w-full p-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:bg-white focus:outline-none transition-all"
            />
            {errors.address && <p className="text-xs text-red-600 font-semibold mt-1">{errors.address.message}</p>}
          </div>
        </div>

        {/* Marital Status & Conditional Children Logic */}
        <div className="pt-4 border-t border-gray-100">
          <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
            {language === 'TA' ? 'திருமண நிலை (Marital Status)' : 'Marital Status'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'NEVER_MARRIED', nameEn: 'Never Married', nameTa: 'முதல் திருமணம்' },
              { id: 'DIVORCED', nameEn: 'Divorced', nameTa: 'விவாகரத்து ஆனவர்' },
              { id: 'WIDOWED', nameEn: 'Widowed', nameTa: 'துணை இழந்தவர்' },
              { id: 'AWAITING_DIVORCE', nameEn: 'Awaiting Divorce', nameTa: 'விவாகரத்து கோரியவர்' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setValue('maritalStatus', st.id as any)}
                className={`h-11 px-2 rounded-xl text-xs font-bold transition-all border ${
                  watchMaritalStatus === st.id
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-[#FFFDF9] text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {language === 'TA' ? st.nameTa : st.nameEn}
              </button>
            ))}
          </div>

          {watchMaritalStatus !== 'NEVER_MARRIED' && (
            <div className="mt-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-amber-900 uppercase mb-1">
                  {language === 'TA' ? 'திருமண வருடம் (Year of Marriage)' : 'Year of Marriage'}
                </label>
                <input
                  type="text"
                  {...register('marriageYear')}
                  placeholder="e.g. 2018"
                  className="w-full h-10 px-3 rounded-lg border border-amber-300 bg-white text-gray-900 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-amber-900 uppercase mb-1">
                  {language === 'TA' ? 'விவாகரத்து வருடம் (Year of Divorce)' : 'Year of Divorce'}
                </label>
                <input
                  type="text"
                  {...register('divorceYear')}
                  placeholder="e.g. 2022"
                  className="w-full h-10 px-3 rounded-lg border border-amber-300 bg-white text-gray-900 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-amber-900 uppercase mb-1">
                  {language === 'TA' ? 'குழந்தைகள் உள்ளதா?' : 'Have Children?'}
                </label>
                <select
                  {...register('haveChildren', {
                    setValueAs: (v) => v === 'true' || v === true,
                  })}
                  className="w-full h-10 px-3 rounded-lg border border-amber-300 bg-white text-gray-900 text-xs font-medium"
                >
                  <option value="false">{language === 'TA' ? 'இல்லை (No)' : 'No'}</option>
                  <option value="true">{language === 'TA' ? 'ஆம் (Yes)' : 'Yes'}</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. ASTROLOGY & HOROSCOPE SECTION */}
      {watchReligion === 'Hindu' && (
        <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/15 shadow-sm space-y-4 sm:space-y-6">
          <div className="border-b border-primary/10 pb-3 sm:pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-xl font-black text-primary font-serif flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D4AF37] shrink-0" />
                {language === 'TA' ? '3. ஜாதகம் & ஜோதிட விவரங்கள்' : '3. Astrology & Horoscope Information'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {language === 'TA' ? 'துல்லியமான 10 பொருத்தங்கள் மற்றும் தோஷ கணிப்பு' : 'Comprehensive horoscope matching & dosham analysis'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleOcrSimulate}
              disabled={isExtractingOcr}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-[#D4AF37]/15 hover:bg-[#D4AF37]/30 text-primary border border-[#D4AF37]/50 transition-all self-start sm:self-auto cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 text-[#D4AF37] ${isExtractingOcr ? 'animate-spin' : ''}`} />
              {isExtractingOcr ? 'Reading Horoscope...' : (language === 'TA' ? 'ஜாதகத்திலிருந்து தானாக நிரப்ப' : 'Auto-fill from Horoscope OCR')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 after:content-['*'] after:ml-1 after:text-primary">
                {language === 'TA' ? 'ராசி (Rasi)' : 'Rasi'}
              </label>
              <select
                value={selectedRasi}
                onChange={handleRasiChange}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:bg-white focus:outline-none transition-all"
              >
                <option value="">-- {language === 'TA' ? 'ராசியைத் தேர்வு செய்யவும்' : 'Select Rasi'} --</option>
                {rasiOptions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {language === 'TA' ? r.ta : r.en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 after:content-['*'] after:ml-1 after:text-primary">
                {language === 'TA' ? 'நட்சத்திரம் (Nakshatram)' : 'Nakshatram'}
              </label>
              <select
                {...register('nakshatram')}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:bg-white focus:outline-none transition-all"
              >
                <option value="">-- {language === 'TA' ? 'நட்சத்திரத்தைத் தேர்வு செய்யவும்' : 'Select Nakshatram'} --</option>
                {availableNakshatras.map((n) => (
                  <option key={n.value} value={n.value}>
                    {language === 'TA' ? n.ta : n.en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dosham Checkboxes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
              {language === 'TA' ? 'தோஷ அமைப்புகள் (Dosham Details)' : 'Dosham Configuration'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5">
              {[
                { id: 'NONE', nameEn: 'Suddha Jathagam (No Dosham)', nameTa: 'சுத்த ஜாதகம் (தோஷமில்லை)' },
                { id: 'SEVVAI', nameEn: 'Sevvai / Manglik', nameTa: 'செவ்வாய் தோஷம்' },
                { id: 'RAHU_KETHU', nameEn: 'Rahu - Ketu', nameTa: 'ராகு - கேது தோஷம்' },
                { id: 'NAGA', nameEn: 'Naga Dosham', nameTa: 'நாக தோஷம்' },
              ].map((d) => {
                const isChecked = watchDoshams?.includes(d.id);
                return (
                  <div
                    key={d.id}
                    onClick={() => toggleDosham(d.id)}
                    className={`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-2 select-none ${
                      isChecked
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-[#FFFDF9] text-gray-700 border-gray-300 hover:border-primary/40'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isChecked ? 'bg-white text-primary border-white' : 'border-gray-400'}`}>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span>{language === 'TA' ? d.nameTa : d.nameEn}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compatible Porutham Nakshatras Multi-select chips */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
              {language === 'TA' ? 'பொருத்தமான நட்சத்திரங்கள் (Compatible Porutham Nakshatras)' : 'Compatible Porutham Nakshatras'}
            </label>
            <div className="flex flex-wrap gap-1 sm:gap-1.5 max-h-48 overflow-y-auto p-2.5 sm:p-3 rounded-2xl border border-gray-200 bg-[#FFFDF9]">
              {allNakshatras.map((nak) => {
                const isSelected = watchPorutham?.includes(nak.value);
                return (
                  <button
                    key={nak.value}
                    type="button"
                    onClick={() => togglePoruthaNakshatra(nak.value)}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-[#D4AF37] text-white border-[#D4AF37] shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {language === 'TA' ? nak.ta : nak.en}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. DYNAMIC EDUCATION HISTORY */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/15 shadow-sm space-y-4 sm:space-y-6">
        <div className="border-b border-primary/10 pb-3 sm:pb-4 flex justify-between items-center gap-2">
          <div>
            <h3 className="text-base sm:text-xl font-black text-primary font-serif">
              {language === 'TA' ? '4. கல்வி விவரங்கள் (Education Details)' : '4. Education Qualifications'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === 'TA' ? 'படித்த பட்டங்கள் மற்றும் கல்வி நிலையங்கள்' : 'Add multiple degrees or diplomas'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => appendEducation({ level: 'PG', degree: '', institution: '' })}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary text-white hover:bg-primary-light transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            {language === 'TA' ? 'கல்வி சேர்க்க' : 'Add Degree'}
          </button>
        </div>

        <div className="space-y-3">
          {educationFields.map((field, index) => (
            <div key={field.id} className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#FFFDF9] border border-gray-200 flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center">
              <div className="w-full sm:w-1/4">
                <select
                  {...register(`educationList.${index}.level`)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-white text-xs font-bold"
                >
                  <option value="Diploma">Diploma / ITI</option>
                  <option value="UG">Undergraduate (UG / Bachelor)</option>
                  <option value="PG">Postgraduate (PG / Master)</option>
                  <option value="Doctorate">Doctorate / Ph.D</option>
                  <option value="School">School / Higher Secondary</option>
                </select>
              </div>
              <div className="w-full sm:w-2/5">
                <input
                  type="text"
                  {...register(`educationList.${index}.degree`)}
                  placeholder="e.g. B.E Computer Science / MBBS / B.Com"
                  className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-white text-xs font-medium"
                />
              </div>
              <div className="w-full sm:w-1/3">
                <input
                  type="text"
                  {...register(`educationList.${index}.institution`)}
                  placeholder="College / University Name"
                  className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-white text-xs font-medium"
                />
              </div>
              {educationFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="self-end sm:self-center p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. DOCUMENT & PROTECTIVE WATERMARKED PHOTO UPLOADS */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/15 shadow-sm space-y-4 sm:space-y-6">
        <div className="border-b border-primary/10 pb-3 sm:pb-4">
          <h3 className="text-base sm:text-xl font-black text-primary font-serif">
            {language === 'TA' ? '5. ஆவணங்கள் & புகைப்படப் பதிவேற்றம்' : '5. Document & Protective Photo Uploads'}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {language === 'TA'
              ? 'பதிவேற்றப்படும் புகைப்படங்கள் தானாகவே நீர் அடையாளத்துடன் (Watermark) பாதுகாக்கப்படும்'
              : 'Uploaded photos are automatically secured with protective client-side brand watermark.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <FileUpload
            label={language === 'TA' ? 'வரனின் புகைப்படம் (Profile Photo)' : 'Profile Photograph'}
            subLabel="JPEG/PNG (Max 10MB) - Watermarked"
            accept="image/*"
            required={true}
            maxSizeMB={10}
            bucket="profile photo"
            watermarkText="NAMMA MATRIMONY"
            initialUrl={watch('photoUrl')}
            onUploadSuccess={(url) => setValue('photoUrl', url)}
          />

          <FileUpload
            label={language === 'TA' ? 'ஜாதக நகல் (Horoscope PDF / Photo)' : 'Jathagam Copy (PDF / Image)'}
            subLabel="PDF or JPG format (Max 10MB)"
            accept="image/*,application/pdf"
            maxSizeMB={10}
            bucket="horoscope"
            initialUrl={watch('horoscopeUrl')}
            onUploadSuccess={(url) => setValue('horoscopeUrl', url)}
          />

          <FileUpload
            label={language === 'TA' ? 'அரசு அடையாள அட்டை (Govt ID Proof - Optional)' : 'Govt ID Proof (Aadhaar / Voter ID)'}
            subLabel="For 100% verified profile badge (Max 50MB)"
            accept="image/*,application/pdf"
            maxSizeMB={50}
            bucket="Govt id, Community Certificate"
            initialUrl={watch('idProofUrl')}
            onUploadSuccess={(url) => setValue('idProofUrl', url)}
          />

          <FileUpload
            label={language === 'TA' ? 'சாதிச் சான்றிதழ் (Caste Certificate - Optional)' : 'Caste Certificate (Optional)'}
            subLabel="Optional community verification (Max 50MB)"
            accept="image/*,application/pdf"
            maxSizeMB={50}
            bucket="Govt id, Community Certificate"
            initialUrl={watch('casteCertificateUrl')}
            onUploadSuccess={(url) => setValue('casteCertificateUrl', url)}
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-end pt-3 sm:pt-4">
        <button
          type="submit"
          className="w-full sm:w-auto bg-primary hover:bg-primary-light text-white px-8 sm:px-10 py-3.5 rounded-full font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{language === 'TA' ? 'அடுத்த படிக்குச் செல்க →' : 'Continue to Step 2 →'}</span>
        </button>
      </div>
    </form>
  );
}
