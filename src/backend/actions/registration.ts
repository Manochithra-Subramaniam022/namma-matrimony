import { supabase } from '@/lib/supabase';

export async function getNextRegistrationId(): Promise<string> {
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
    console.error('getNextRegistrationId failed:', err);
    return 'nm-0001';
  }
}

export async function getProfilesByMobile(mobile: string) {
  try {
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    if (!cleanMobile || cleanMobile.length < 10) return [];

    const { data: user } = await supabase
      .from('User')
      .select('id, email, mobile_no, whatsappProfileDeliveryNumber')
      .eq('mobile_no', cleanMobile)
      .maybeSingle();

    let query = supabase.from('Profile').select('*');
    if (user?.id) {
      query = query.or(`userId.eq.${user.id},profileCreatedBy.eq.${cleanMobile}`);
    } else {
      query = query.eq('profileCreatedBy', cleanMobile);
    }

    const { data: profiles, error } = await query.order('displayId', { ascending: false });
    if (error) {
      console.error('getProfilesByMobile query error:', error);
      return [];
    }

    // Attach family and expectations for each profile
    const fullProfiles = await Promise.all(
      (profiles || []).map(async (p) => {
        const { data: family } = await supabase
          .from('Family')
          .select('*')
          .eq('userId', p.userId)
          .maybeSingle();

        const { data: expectations } = await supabase
          .from('Expectations')
          .select('*')
          .eq('userId', p.userId)
          .maybeSingle();

        return {
          ...p,
          family: family || {},
          expectations: expectations || {},
          userContact: {
            mobile: user?.mobile_no || cleanMobile,
            email: user?.email,
          },
        };
      })
    );

    return fullProfiles;
  } catch (err) {
    console.error('getProfilesByMobile error:', err);
    return [];
  }
}

export async function getProfileById(displayIdOrId: string) {
  try {
    let query = supabase.from('Profile').select('*');
    if (displayIdOrId.toLowerCase().startsWith('nm-')) {
      query = query.ilike('displayId', displayIdOrId);
    } else {
      query = query.eq('id', displayIdOrId);
    }

    const { data: profile, error } = await query.maybeSingle();
    if (error || !profile) return null;

    // Fetch family and expectations
    const { data: family } = await supabase
      .from('Family')
      .select('*')
      .eq('userId', profile.userId)
      .maybeSingle();

    const { data: expectations } = await supabase
      .from('Expectations')
      .select('*')
      .eq('userId', profile.userId)
      .maybeSingle();

    return {
      ...profile,
      family: family || {},
      expectations: expectations || {},
    };
  } catch (err) {
    console.error('getProfileById error:', err);
    return null;
  }
}

export async function registerProfileWithPrisma(formData: any) {
  try {
    if (!formData.fullName || typeof formData.fullName !== 'string' || !formData.fullName.trim()) {
      throw new Error('Full Name is required for registration.');
    }

    if (!formData.whatsappNumber && !formData.mobileNumber) {
      throw new Error('வரன் பதிவு செய்ய மொபைல் எண் மிக முக்கியம் / Mobile number is mandatory to create a profile.');
    }

    const displayId = await getNextRegistrationId();

    const cleanMobile = formData.whatsappNumber
      ? formData.whatsappNumber.replace(/\D/g, '').slice(-10)
      : formData.mobileNumber.replace(/\D/g, '').slice(-10);

    if (cleanMobile.length < 10 || !/^[6-9]/.test(cleanMobile)) {
      throw new Error('சரியான 10 இலக்க மொபைல் எண் கட்டாயம் (6-9 இல் தொடங்க வேண்டும்) / A valid 10-digit mobile number starting with 6-9 is required to create a profile.');
    }

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

    // Direct Database Storage via Supabase
    // 1. Check or Insert Primary User Account
    const { data: existingUser } = await supabase
      .from('User')
      .select('id, userid')
      .eq('mobile_no', cleanMobile)
      .maybeSingle();

    let primaryUserId = existingUser?.id;

    if (!existingUser) {
      primaryUserId = crypto.randomUUID();
      const { error: userErr } = await supabase.from('User').insert([{
        id: primaryUserId,
        mobile_no: cleanMobile,
        email,
        password: formData.password || null,
        whatsappProfileDeliveryNumber: formData.whatsappNumber || null,
        userid: `ACC-${cleanMobile}`,
        role: 'USER',
        status: 'ACTIVE',
        updatedAt: new Date().toISOString(),
      }]);
      if (userErr) {
        console.error('Supabase User insertion error:', userErr);
        throw new Error(userErr.message || 'Failed to create user account');
      }
    }

    // 2. Check if we are EDITING an existing candidate registration or CREATING a new one
    let targetCandidateUserId = primaryUserId!;
    let targetProfileId = crypto.randomUUID();
    let profileDisplayId = displayId;
    let isEditing = false;

    if (formData.profileId || formData.editDisplayId || formData.displayId) {
      const searchId = formData.profileId || formData.editDisplayId || formData.displayId;
      const { data: foundProfile } = await supabase
        .from('Profile')
        .select('id, userId, displayId')
        .or(`id.eq.${searchId},displayId.ilike.${searchId}`)
        .maybeSingle();

      if (foundProfile) {
        isEditing = true;
        targetProfileId = foundProfile.id;
        targetCandidateUserId = foundProfile.userId;
        profileDisplayId = foundProfile.displayId;
      }
    }

    if (!isEditing) {
      // For a NEW candidate registration:
      // Check if primaryUserId already has a row in Profile (to avoid Profile_userId_key violation)
      const { data: profileWithSameUserId } = await supabase
        .from('Profile')
        .select('id')
        .eq('userId', primaryUserId)
        .maybeSingle();

      if (profileWithSameUserId) {
        // Primary user already has candidate #1.
        // For candidate #2, #3, ..., #N: create a candidate sub-user record in User table
        const candidateSubUserId = crypto.randomUUID();
        const { error: subUserErr } = await supabase.from('User').insert([{
          id: candidateSubUserId,
          mobile_no: null,
          email: `${cleanMobile}+${displayId.replace(/[^a-zA-Z0-9]/g, '')}@nammamatrimony.local`,
          password: null,
          whatsappProfileDeliveryNumber: formData.whatsappNumber || cleanMobile,
          userid: displayId,
          role: 'USER',
          status: 'ACTIVE',
          updatedAt: new Date().toISOString(),
        }]);

        if (subUserErr) {
          console.error('Candidate sub-user creation error:', subUserErr);
        } else {
          targetCandidateUserId = candidateSubUserId;
        }
      }
    }

    const profileData: any = {
      userId: targetCandidateUserId,
      name: formData.fullName.trim(),
      gender,
      livingCountry: formData.country || 'India',
      state: formData.state || 'Tamil Nadu',
      city: formData.city || 'Coimbatore',
      religion: formData.religion || 'Hindu',
      caste: formData.caste || 'Tamil',
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
      profileCreatedBy: cleanMobile,
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

    let actualProfileId = targetProfileId;

    if (isEditing) {
      const { error: pUpErr } = await supabase
        .from('Profile')
        .update(profileData)
        .eq('id', targetProfileId);
      if (pUpErr) {
        console.error('Supabase profile update error:', pUpErr);
        throw new Error(pUpErr.message || 'Failed to update profile');
      }
    } else {
      const { data: newP, error: pInErr } = await supabase
        .from('Profile')
        .insert([{ id: targetProfileId, ...profileData }])
        .select('id, displayId')
        .single();
      if (pInErr) {
        console.error('Supabase profile insertion error:', pInErr);
        throw new Error(pInErr.message || 'Failed to save profile');
      }
      actualProfileId = newP?.id || targetProfileId;
    }

    // 3. Family Data
    const familyPayload = {
      userId: targetCandidateUserId,
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
      .eq('userId', targetCandidateUserId)
      .maybeSingle();

    if (existingFamily) {
      await supabase.from('Family').update(familyPayload).eq('id', existingFamily.id);
    } else {
      await supabase.from('Family').insert([{ id: crypto.randomUUID(), ...familyPayload }]);
    }

    // 4. Expectations Data
    const expectationsPayload = {
      userId: targetCandidateUserId,
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
      .eq('userId', targetCandidateUserId)
      .maybeSingle();

    if (existingExp) {
      await supabase.from('Expectations').update(expectationsPayload).eq('id', existingExp.id);
    } else {
      await supabase.from('Expectations').insert([{ id: crypto.randomUUID(), ...expectationsPayload }]);
    }

    return {
      success: true,
      method: 'SUPABASE_CLIENT',
      registrationId: profileDisplayId,
      userId: targetCandidateUserId,
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

export async function deleteProfile(profileIdOrDisplayId: string) {
  try {
    if (!profileIdOrDisplayId || typeof profileIdOrDisplayId !== 'string') {
      throw new Error('Profile identifier is required.');
    }

    const cleanId = profileIdOrDisplayId.trim();

    // 1. Locate the Profile
    let query = supabase.from('Profile').select('id, userId, displayId');
    if (cleanId.toLowerCase().startsWith('nm-')) {
      query = query.ilike('displayId', cleanId);
    } else {
      query = query.or(`id.eq.${cleanId},displayId.ilike.${cleanId}`);
    }

    const { data: profile, error } = await query.maybeSingle();
    if (error) {
      console.error('Error finding profile to delete:', error);
      throw error;
    }

    if (!profile) {
      return { success: true, message: 'Profile not found or already deleted' };
    }

    const { id: profileId, userId, displayId } = profile;

    // 2. Delete Education rows linked to profileId
    await supabase.from('Education').delete().eq('profileId', profileId);

    // 3. Delete Family and Sibling records if userId exists
    if (userId) {
      const { data: family } = await supabase.from('Family').select('id').eq('userId', userId).maybeSingle();
      if (family?.id) {
        await supabase.from('Sibling').delete().eq('familyId', family.id);
        await supabase.from('Family').delete().eq('id', family.id);
      } else {
        await supabase.from('Family').delete().eq('userId', userId);
      }

      // 4. Delete Expectations
      await supabase.from('Expectations').delete().eq('userId', userId);
    }

    // 5. Delete Profile
    const { error: profileDeleteErr } = await supabase.from('Profile').delete().eq('id', profileId);
    if (profileDeleteErr) {
      console.error('Error deleting profile record:', profileDeleteErr);
      throw profileDeleteErr;
    }

    // 6. If this was a candidate sub-user (no primary mobile_no), clean up candidate sub-user
    if (userId) {
      const { data: subUser } = await supabase.from('User').select('id, mobile_no').eq('id', userId).maybeSingle();
      if (subUser && !subUser.mobile_no) {
        await supabase.from('User').delete().eq('id', userId);
      }
    }

    return {
      success: true,
      message: 'Profile deleted successfully',
      deletedId: profileId,
      deletedDisplayId: displayId,
    };
  } catch (err: any) {
    console.error('deleteProfile error:', err);
    return {
      success: false,
      error: err.message || 'Failed to delete profile',
    };
  }
}
