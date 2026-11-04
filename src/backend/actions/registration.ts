import prisma from '@/backend/prisma';
import { supabase } from '@/lib/supabase';

export async function getNextRegistrationId(): Promise<string> {
  // 1. Try Prisma if DATABASE_URL is available
  if (process.env.DATABASE_URL || process.env.DIRECT_URL) {
    try {
      const profiles = await prisma.profile.findMany({
        where: {
          displayId: { not: null },
        },
        select: { displayId: true },
      });

      let maxNum = 0;
      for (const p of profiles) {
        if (p.displayId) {
          const match = p.displayId.match(/nm-(\d+)/i);
          if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxNum) {
              maxNum = num;
            }
          }
        }
      }
      const nextNum = maxNum + 1;
      return `nm-${String(nextNum).padStart(4, '0')}`;
    } catch (err) {
      console.warn('Prisma getNextRegistrationId error:', err);
    }
  }

  // 2. Query Supabase
  try {
    const { data: profiles, error } = await supabase
      .from('Profile')
      .select('displayId')
      .not('displayId', 'is', null);

    if (error) {
      console.error('Supabase getNextRegistrationId query error:', error);
      return 'nm-0001';
    }

    let maxNum = 0;
    if (profiles && profiles.length > 0) {
      for (const p of profiles) {
        if (p.displayId) {
          const match = p.displayId.match(/nm-(\d+)/i);
          if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxNum) {
              maxNum = num;
            }
          }
        }
      }
    }
    const nextNum = maxNum + 1;
    return `nm-${String(nextNum).padStart(4, '0')}`;
  } catch (err) {
    console.error('getNextRegistrationId fallback failed:', err);
    return 'nm-0001';
  }
}

export async function registerProfileWithPrisma(formData: any) {
  try {
    const displayId = await getNextRegistrationId();

    const cleanMobile = formData.whatsappNumber
      ? formData.whatsappNumber.replace(/\D/g, '').slice(-10)
      : formData.mobileNumber
      ? formData.mobileNumber.replace(/\D/g, '').slice(-10)
      : `99${randomCode}0000`.slice(0, 10);

    const email = formData.email || `${cleanMobile}@nammamatrimony.local`;

    // Map gender enum
    const gender = formData.gender === 'FEMALE' ? 'FEMALE' : 'MALE';

    // Map marital status
    let maritalStatus: any = 'NEVER_MARRIED';
    if (formData.maritalStatus?.toLowerCase().includes('divorced')) maritalStatus = 'DIVORCED';
    else if (formData.maritalStatus?.toLowerCase().includes('widow')) maritalStatus = 'WIDOWED';
    else if (formData.maritalStatus?.toLowerCase().includes('awaiting')) maritalStatus = 'AWAITING_DIVORCE';

    // Map physical condition
    let physicalCondition: any = 'AVERAGE';
    if (formData.physicalCondition?.toLowerCase().includes('differently')) physicalCondition = 'AVERAGE';

    // Map family status
    let familyStatus: any = 'MIDDLE';
    if (formData.familyStatus?.toLowerCase().includes('upper')) familyStatus = 'UPPER_MIDDLE';
    else if (formData.familyStatus?.toLowerCase().includes('rich') || formData.familyStatus?.toLowerCase().includes('affluent')) familyStatus = 'HIGH';

    // Map habits
    const habitMap = (val: string): any => {
      if (!val || val.toLowerCase() === 'no') return 'NONE';
      if (val.toLowerCase().includes('occasion')) return 'OCCASIONAL';
      return 'REGULAR';
    };

    // Parse DOB
    let dob = new Date('1998-01-01');
    if (formData.dob) {
      if (formData.dob.includes('-')) {
        const parts = formData.dob.split('-');
        if (parts[0].length === 4) {
          dob = new Date(formData.dob);
        } else if (parts[2].length === 4) {
          dob = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
      }
    }

    // Work nature enum
    let workNature: any = 'JOB';
    if (formData.workNature?.toLowerCase().includes('business') || formData.workNature?.toLowerCase().includes('self')) {
      workNature = 'BUSINESS';
    } else if (formData.workNature?.toLowerCase().includes('not')) {
      workNature = 'NOT_WORKING';
    }

    // If DATABASE_URL is set, execute Prisma operations
    if (process.env.DATABASE_URL || process.env.DIRECT_URL) {
      // 1. Create or Update User
      const user = await prisma.user.upsert({
        where: { mobile_no: cleanMobile },
        create: {
          mobile_no: cleanMobile,
          email,
          password: formData.password || null,
          whatsappProfileDeliveryNumber: formData.whatsappNumber || null,
          userid: displayId,
          role: 'USER',
          status: 'ACTIVE',
        },
        update: {
          email,
          whatsappProfileDeliveryNumber: formData.whatsappNumber || null,
        },
      });

      // 2. Create or Update Profile
      const profile = await prisma.profile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          name: formData.fullName || 'Member',
          gender,
          livingCountry: formData.country || 'India',
          state: formData.state || 'Tamil Nadu',
          city: formData.city || 'Coimbatore',
          religion: formData.religion || 'Hindu',
          caste: formData.caste || 'Kongu Vellalar Gounder',
          subCaste: formData.subCaste || null,
          koottam: formData.kootam || null,
          dob,
          tob: formData.timeOfBirth || null,
          lob: formData.placeOfBirth || null,
          height: parseFloat(formData.height) || 165,
          weight: parseFloat(formData.weight) || 60,
          physicalCondition,
          skinColour: formData.complexion || 'Wheatish',
          maritalStatus,
          familyStatus,
          foodHabits: habitMap(formData.foodHabits),
          drinkingHabits: habitMap(formData.drinkingHabits),
          smokingHabits: habitMap(formData.smokingHabits),
          rasi: formData.rasi || null,
          nakshatra: formData.nakshatram || null,
          poruthaNakshatram: Array.isArray(formData.poruthamNakshatras) ? formData.poruthamNakshatras : [],
          dosham: Array.isArray(formData.dosham) ? formData.dosham.join(', ') : formData.dosham || null,
          displayId,
          status: 'PENDING',
          isLive: false,
          houseAddress: formData.address || null,
          houseLocation: formData.landmark || null,
          hideMobileNo: Boolean(formData.hideMobile ?? true),
          hideHouseAddress: Boolean(formData.hideAddress ?? true),
          hidePhoto: Boolean(formData.hidePhoto ?? false),
          photoUrl: formData.profilePhotoUrl || null,
          jathakamUrl: formData.horoscopeFileUrl || null,
          idProofUrl: formData.idProofUrl || null,
          casteCertificateUrl: formData.casteCertificateUrl || null,
          rasiGrid: formData.horoscopeChart || null,
          amsamGrid: formData.horoscopeChart || null,
          haveChildren: Boolean(formData.haveChildren === 'Yes'),
          numberOfChildren: parseInt(formData.childrenCount) || 0,
          childrenAge: formData.childrenDetails || null,
          yearOfMarriage: formData.marriageYear || null,
          yearOfDivorce: formData.divorceYear || null,
          educations: {
            create: Array.isArray(formData.education)
              ? formData.education.map((edu: any) => ({
                  level: edu.level || 'UG',
                  degreeName: edu.degree || 'Degree',
                  institution: edu.institution || 'University',
                }))
              : [],
          },
        },
        update: {
          name: formData.fullName || 'Member',
          gender,
          caste: formData.caste || 'Kongu Vellalar Gounder',
          koottam: formData.kootam || null,
          displayId,
        },
      });

      // 3. Create or Update Family
      await prisma.family.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          fatherName: formData.fatherName || null,
          fatherLivingStatus: String(formData.fatherStatus).toUpperCase() === 'LATE' ? 'LATE' : 'ALIVE',
          fatherStatus: String(formData.fatherStatus).toUpperCase() === 'LATE' ? null : (formData.fatherOccupation || null),
          fatherMobile: String(formData.fatherStatus).toUpperCase() === 'LATE' ? null : (formData.fatherMobile || null),
          motherName: formData.motherName || null,
          motherLivingStatus: String(formData.motherStatus).toUpperCase() === 'LATE' ? 'LATE' : 'ALIVE',
          motherStatus: String(formData.motherStatus).toUpperCase() === 'LATE' ? null : (formData.motherOccupation || null),
          motherMobile: String(formData.motherStatus).toUpperCase() === 'LATE' ? null : (formData.motherMobile || null),
          workNature,
          salary: formData.annualIncome || null,
          organisation: formData.companyName || null,
          designation: formData.designation || null,
          workingAddress: formData.workLocation || null,
          googleLocation: formData.workMapUrl || null,
          rentalIncome: formData.rentalIncome || null,
          houseType: formData.houseType || null,
          houseSqFt: formData.houseSqft || null,
          thottam: formData.landAcres || null,
          vacantLand: formData.commercialSqft || null,
          totalAssetValue: formData.netAssets || null,
          assetComments: formData.assetComments || null,
          dowryDetails: `Gold: ${formData.seerGoldPavun || '0'} Pavun, Cash: ${formData.seerCash || '0'}, Vehicle: ${formData.seerVehicle || 'None'}`,
          siblings: {
            create: Array.isArray(formData.siblings)
              ? formData.siblings.map((sib: any) => ({
                  name: sib.name || 'Sibling',
                  relation: sib.relation || 'Brother',
                  status: sib.status || sib.maritalStatus || 'Unmarried',
                }))
              : [],
          },
        },
        update: {
          fatherName: formData.fatherName || null,
          fatherLivingStatus: String(formData.fatherStatus).toUpperCase() === 'LATE' ? 'LATE' : 'ALIVE',
          fatherStatus: String(formData.fatherStatus).toUpperCase() === 'LATE' ? null : (formData.fatherOccupation || null),
          fatherMobile: String(formData.fatherStatus).toUpperCase() === 'LATE' ? null : (formData.fatherMobile || null),
          motherName: formData.motherName || null,
          motherLivingStatus: String(formData.motherStatus).toUpperCase() === 'LATE' ? 'LATE' : 'ALIVE',
          motherStatus: String(formData.motherStatus).toUpperCase() === 'LATE' ? null : (formData.motherOccupation || null),
          motherMobile: String(formData.motherStatus).toUpperCase() === 'LATE' ? null : (formData.motherMobile || null),
          salary: formData.annualIncome || null,
        },
      });

      // 4. Create or Update Expectations
      await prisma.expectations.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          expectedHeight: parseFloat(formData.partnerHeightMin) || null,
          colourPreference: formData.partnerComplexion || null,
          maxAgeLimit: parseInt(formData.partnerMaxAgeGap) || null,
          preferredSectors: Array.isArray(formData.partnerSectors) ? formData.partnerSectors : [],
          preferredLocations: Array.isArray(formData.partnerPreferredCities) ? formData.partnerPreferredCities : [],
          expectedIncome: formData.partnerMinIncome || null,
          expectsRentalIncome: Boolean(formData.partnerExpectRental),
          expectsThottam: Boolean(formData.partnerExpectLand),
          expectsVacantLand: Boolean(formData.partnerExpectVacantLand),
          acceptsDivorced: Boolean(formData.partnerOpenDivorced),
          preferredDistanceRadius: parseInt(formData.partnerDistanceRadius) || null,
          city: Array.isArray(formData.partnerPreferredCities) && formData.partnerPreferredCities.length > 0 ? formData.partnerPreferredCities[0] : null,
          referredBy: formData.referredBy || null,
          comments: formData.openExpectations || null,
        },
        update: {
          comments: formData.openExpectations || null,
        },
      });

      return {
        success: true,
        method: 'PRISMA',
        registrationId: displayId,
        userId: user.id,
        profileId: profile.id,
      };
    }

    // Fallback: Supabase Client Direct
    const userId = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    const familyId = crypto.randomUUID();
    const expectationsId = crypto.randomUUID();

    // 1. Check or Insert User
    const { data: existingUser } = await supabase
      .from('User')
      .select('id, userid')
      .eq('mobile_no', cleanMobile)
      .maybeSingle();

    const actualUserId = existingUser?.id || userId;

    if (!existingUser) {
      const { error: userErr } = await supabase.from('User').insert([{
        id: actualUserId,
        mobile_no: cleanMobile,
        email,
        password: formData.password || null,
        whatsappProfileDeliveryNumber: formData.whatsappNumber || null,
        userid: displayId,
        role: 'USER',
        status: 'ACTIVE',
        updatedAt: new Date().toISOString(),
      }]);
      if (userErr) {
        console.error('Supabase User insertion error:', userErr);
        throw new Error(userErr.message || 'Failed to create user account');
      }
    }

    // 2. Check if Profile already exists for this user
    const { data: existingProfile } = await supabase
      .from('Profile')
      .select('id, displayId')
      .eq('userId', actualUserId)
      .maybeSingle();

    const profileDisplayId = existingProfile?.displayId || displayId;

    const profileData = {
      userId: actualUserId,
      name: formData.fullName || 'Member',
      gender,
      livingCountry: formData.country || 'India',
      state: formData.state || 'Tamil Nadu',
      city: formData.city || 'Coimbatore',
      religion: formData.religion || 'Hindu',
      caste: formData.caste || 'Kongu Vellalar Gounder',
      subCaste: formData.subCaste || null,
      koottam: formData.kootam || formData.koottam || null,
      dob: dob.toISOString(),
      tob: formData.birthTime || formData.timeOfBirth || null,
      lob: formData.birthPlace || formData.placeOfBirth || null,
      height: parseFloat(formData.heightCm || formData.height) || 165,
      weight: parseFloat(formData.weightKg || formData.weight) || 60,
      physicalCondition,
      skinColour: formData.complexion || 'Wheatish',
      maritalStatus,
      familyStatus,
      foodHabits: habitMap(formData.foodHabit || formData.foodHabits),
      drinkingHabits: habitMap(formData.drinkingHabit || formData.drinkingHabits),
      smokingHabits: habitMap(formData.smokingHabit || formData.smokingHabits),
      rasi: formData.rasi || null,
      nakshatra: formData.nakshatram || null,
      poruthaNakshatram: Array.isArray(formData.poruthaNakshatram) ? formData.poruthaNakshatram : (Array.isArray(formData.poruthamNakshatras) ? formData.poruthamNakshatras : []),
      dosham: Array.isArray(formData.doshams) ? formData.doshams.join(', ') : (Array.isArray(formData.dosham) ? formData.dosham.join(', ') : formData.dosham || null),
      displayId: profileDisplayId,
      status: 'PENDING',
      isLive: false,
      houseAddress: formData.address || null,
      houseLocation: formData.locationLandmark || formData.landmark || null,
      hideMobileNo: Boolean(formData.hideMobile ?? true),
      hideHouseAddress: Boolean(formData.hideAddress ?? true),
      hidePhoto: Boolean(formData.hidePhoto ?? false),
      photoUrl: formData.photoUrl || formData.profilePhotoUrl || null,
      jathakamUrl: formData.horoscopeUrl || formData.horoscopeFileUrl || null,
      idProofUrl: formData.idProofUrl || null,
      casteCertificateUrl: formData.casteCertificateUrl || null,
      haveChildren: Boolean(formData.haveChildren === true || formData.haveChildren === 'Yes'),
      numberOfChildren: parseInt(formData.childrenCount) || 0,
      childrenAge: formData.childrenDetails || null,
    };

    let actualProfileId = existingProfile?.id || profileId;

    if (existingProfile) {
      const { error: pUpErr } = await supabase
        .from('Profile')
        .update(profileData)
        .eq('id', existingProfile.id);
      if (pUpErr) {
        console.error('Supabase profile update error:', pUpErr);
        throw new Error(pUpErr.message || 'Failed to update profile');
      }
    } else {
      const { data: newP, error: pInErr } = await supabase
        .from('Profile')
        .insert([{ id: profileId, ...profileData }])
        .select('id, displayId')
        .single();
      if (pInErr) {
        console.error('Supabase profile insertion error:', pInErr);
        throw new Error(pInErr.message || 'Failed to save profile');
      }
      actualProfileId = newP?.id || profileId;
    }

    // 3. Family Data
    const familyPayload = {
      userId: actualUserId,
      fatherName: formData.fatherName || null,
      fatherLivingStatus: String(formData.fatherStatus).toUpperCase() === 'LATE' ? 'LATE' : 'ALIVE',
      fatherStatus: String(formData.fatherStatus).toUpperCase() === 'LATE' ? null : (formData.fatherOccupation || null),
      fatherMobile: String(formData.fatherStatus).toUpperCase() === 'LATE' ? null : (formData.fatherMobile || null),
      motherName: formData.motherName || null,
      motherLivingStatus: String(formData.motherStatus).toUpperCase() === 'LATE' ? 'LATE' : 'ALIVE',
      motherStatus: String(formData.motherStatus).toUpperCase() === 'LATE' ? null : (formData.motherOccupation || null),
      motherMobile: String(formData.motherStatus).toUpperCase() === 'LATE' ? null : (formData.motherMobile || null),
      workNature,
      salary: formData.annualIncome || formData.monthlyIncome || null,
      organisation: formData.companyName || null,
      designation: formData.designation || null,
      workingAddress: formData.workCity || formData.workLocation || null,
      googleLocation: formData.workMapLink || formData.workMapUrl || null,
      rentalIncome: formData.rentalIncomeMonthly || formData.rentalIncome || null,
      houseType: formData.houseType || null,
      houseSqFt: formData.houseSqft || null,
      thottam: formData.agriculturalLandAcres || formData.landAcres || null,
      vacantLand: formData.vacantLandSqft || formData.commercialSqft || null,
      totalAssetValue: formData.totalNetAssets || formData.netAssets || null,
      assetComments: formData.propertyComments || formData.assetComments || null,
      dowryDetails: `Gold: ${formData.goldPavun || formData.seerGoldPavun || '0'} Pavun, Cash: ${formData.seerCash || '0'}, Vehicle: ${formData.seerVehicle || 'None'}`,
    };

    const { data: existingFamily } = await supabase
      .from('Family')
      .select('id')
      .eq('userId', actualUserId)
      .maybeSingle();

    if (existingFamily) {
      await supabase.from('Family').update(familyPayload).eq('id', existingFamily.id);
    } else {
      await supabase.from('Family').insert([{ id: familyId, ...familyPayload }]);
    }

    // 4. Expectations Data
    const expectationsPayload = {
      userId: actualUserId,
      expectedHeight: parseFloat(formData.expectedMinHeightCm || formData.partnerHeightMin) || null,
      colourPreference: formData.complexionPreference || formData.partnerComplexion || null,
      maxAgeLimit: parseInt(formData.expectedAgeGap || formData.partnerMaxAgeGap) || null,
      preferredSectors: Array.isArray(formData.preferredSectors) ? formData.preferredSectors : (Array.isArray(formData.partnerSectors) ? formData.partnerSectors : []),
      preferredLocations: [formData.preferredCity1, formData.preferredCity2, formData.preferredCity3].filter(Boolean),
      expectedIncome: formData.expectedMinMonthlyIncome || formData.partnerMinIncome || null,
      expectsRentalIncome: Boolean(formData.expectsRentalIncome),
      expectsThottam: Boolean(formData.expectsThottamLand),
      expectsVacantLand: Boolean(formData.expectsVacantLand),
      acceptsDivorced: Boolean(formData.openToRemarriage),
      preferredDistanceRadius: parseFloat(formData.distanceRadiusKm) || 100,
      referredBy: formData.referredBy || null,
      comments: formData.partnerExpectationsNotes || formData.openExpectations || null,
    };

    const { data: existingExp } = await supabase
      .from('Expectations')
      .select('id')
      .eq('userId', actualUserId)
      .maybeSingle();

    if (existingExp) {
      await supabase.from('Expectations').update(expectationsPayload).eq('id', existingExp.id);
    } else {
      await supabase.from('Expectations').insert([{ id: expectationsId, ...expectationsPayload }]);
    }

    return {
      success: true,
      method: 'SUPABASE_CLIENT',
      registrationId: profileDisplayId,
      userId: actualUserId,
      profileId: actualProfileId,
    };
  } catch (err: any) {
    console.error('Error in registerProfileWithPrisma:', err);
    return {
      success: false,
      error: err.message,
    };
  }
}
