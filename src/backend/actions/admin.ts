import { supabase } from '@/lib/supabase';

export interface AdminProfileStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export async function getAllProfilesForAdmin(options?: {
  status?: string;
  search?: string;
  gender?: string;
}) {
  try {
    let query = supabase.from('Profile').select('*');

    if (options?.status && options.status !== 'ALL') {
      query = query.eq('status', options.status);
    }

    if (options?.gender && options.gender !== 'ALL') {
      query = query.eq('gender', options.gender);
    }

    const { data: rawProfiles, error } = await query.order('id', { ascending: false });

    if (error) {
      console.error('getAllProfilesForAdmin error:', error);
      throw error;
    }

    const profiles = rawProfiles || [];

    // Fetch associated User and Family data for each profile
    const enrichedProfiles = await Promise.all(
      profiles.map(async (p) => {
        let userContact: any = {
          mobile: p.profileCreatedBy || null,
          email: null,
          whatsapp: null,
        };

        if (p.userId) {
          const { data: user } = await supabase
            .from('User')
            .select('id, email, mobile_no, whatsappProfileDeliveryNumber, createdAt')
            .eq('id', p.userId)
            .maybeSingle();

          if (user) {
            userContact = {
              mobile: user.mobile_no || p.profileCreatedBy,
              email: user.email,
              whatsapp: user.whatsappProfileDeliveryNumber || user.mobile_no || p.profileCreatedBy,
              registeredAt: user.createdAt,
            };
          }
        }

        let family: any = null;
        if (p.userId) {
          const { data: f } = await supabase.from('Family').select('*').eq('userId', p.userId).maybeSingle();
          family = f;
        }
        if (!family && p.profileCreatedBy) {
          const { data: u } = await supabase.from('User').select('id').eq('mobile_no', p.profileCreatedBy).maybeSingle();
          if (u?.id) {
            const { data: f } = await supabase.from('Family').select('*').eq('userId', u.id).maybeSingle();
            family = f;
          }
        }

        const { data: expectations } = p.userId
          ? await supabase.from('Expectations').select('*').eq('userId', p.userId).maybeSingle()
          : { data: null };

        const { data: siblings } = family?.id
          ? await supabase.from('Sibling').select('*').eq('familyId', family.id)
          : { data: [] };

        const { data: educations } = p.id
          ? await supabase.from('Education').select('*').eq('profileId', p.id)
          : { data: [] };

        const dbSiblings = Array.isArray(siblings) && siblings.length > 0
          ? siblings.map((s: any) => ({ name: s.name, relation: s.relation, maritalStatus: s.status }))
          : [];
        const jsonSiblings = Array.isArray(p.jathagamData?.siblingsList) && p.jathagamData.siblingsList.length > 0
          ? p.jathagamData.siblingsList
          : (family?.siteLand ? (() => { try { const parsed = JSON.parse(family.siteLand); return Array.isArray(parsed) ? parsed : []; } catch { return []; } })() : []);
        const siblingsList = dbSiblings.length > 0 ? dbSiblings : jsonSiblings;

        const dbEdu = Array.isArray(educations) && educations.length > 0
          ? educations.map((e: any) => ({ level: e.level, degree: e.degreeName, institution: e.institution }))
          : [];
        const jsonEdu = Array.isArray(p.jathagamData?.educationList) && p.jathagamData.educationList.length > 0
          ? p.jathagamData.educationList
          : [];
        const educationList = dbEdu.length > 0 ? dbEdu : (jsonEdu.length > 0 ? jsonEdu : (p.education ? [{ level: 'Degree', degree: p.education, institution: '' }] : []));

        const isFatherLate = String(family?.fatherLivingStatus || p.jathagamData?.fatherLivingStatus || p.fatherLivingStatus || family?.fatherStatus || p.jathagamData?.fatherStatus || p.fatherStatus).toUpperCase() === 'LATE';
        const isMotherLate = String(family?.motherLivingStatus || p.jathagamData?.motherLivingStatus || p.motherLivingStatus || family?.motherStatus || p.jathagamData?.motherStatus || p.motherStatus).toUpperCase() === 'LATE';

        const fatherName = family?.fatherName || p.jathagamData?.fatherName || p.fatherName || null;
        const fatherOccupation = isFatherLate ? null : (family?.fatherStatus || p.jathagamData?.fatherOccupation || p.fatherOccupation || null);
        const fatherMobile = family?.fatherMobile || p.jathagamData?.fatherMobile || p.fatherMobile || null;

        const motherName = family?.motherName || p.jathagamData?.motherName || p.motherName || null;
        const motherOccupation = isMotherLate ? null : (family?.motherStatus || p.jathagamData?.motherOccupation || p.motherOccupation || null);
        const motherMobile = family?.motherMobile || p.jathagamData?.motherMobile || p.motherMobile || null;

        return {
          ...p,
          // Flattened backward-compatible accessors
          fatherName,
          fatherStatus: isFatherLate ? 'LATE' : (family?.fatherStatus || p.jathagamData?.fatherStatus || p.fatherStatus || 'ALIVE'),
          fatherLivingStatus: isFatherLate ? 'LATE' : 'ALIVE',
          fatherOccupation,
          fatherMobile,

          motherName,
          motherStatus: isMotherLate ? 'LATE' : (family?.motherStatus || p.jathagamData?.motherStatus || p.motherStatus || 'ALIVE'),
          motherLivingStatus: isMotherLate ? 'LATE' : 'ALIVE',
          motherOccupation,
          motherMobile,

          workNature: family?.workNature || p.jathagamData?.workNature || p.workNature || null,
          workSector: p.jathagamData?.workSector || null,
          businessType: p.jathagamData?.businessType || null,
          workMode: p.jathagamData?.workMode || null,
          businessDetails: p.jathagamData?.businessDetails || null,
          designation: family?.designation || p.jathagamData?.designation || p.designation || null,
          companyName: family?.organisation || p.jathagamData?.companyName || p.companyName || null,
          monthlyIncome: p.jathagamData?.monthlyIncome || null,
          annualIncome: family?.salary || p.jathagamData?.annualIncome || p.annualIncome || null,
          workCity: family?.workingAddress || p.jathagamData?.workCity || p.workCity || null,
          workMapLink: family?.googleLocation || p.jathagamData?.workMapLink || p.workMapLink || null,

          houseType: family?.houseType || p.jathagamData?.houseType || p.houseType || null,
          houseSqft: family?.houseSqFt || p.jathagamData?.houseSqft || p.houseSqft || null,
          rentalIncome: family?.rentalIncome || p.jathagamData?.rentalIncomeMonthly || p.rentalIncome || null,
          thottam: family?.thottam || p.jathagamData?.agriculturalLandAcres || p.thottam || null,
          vacantLand: family?.vacantLand || p.jathagamData?.vacantLandSqft || p.vacantLand || null,
          totalAssetValue: family?.totalAssetValue || p.jathagamData?.totalNetAssets || p.totalAssetValue || null,
          propertyComments: family?.assetComments || p.jathagamData?.propertyComments || p.propertyComments || null,
          dowryDetails: family?.dowryDetails || p.jathagamData?.dowryDetails || p.dowryDetails || null,

          educationList,
          siblingsList,
          userContact,
          family: {
            ...(family || {}),
            fatherName,
            fatherStatus: isFatherLate ? 'LATE' : (family?.fatherStatus || p.jathagamData?.fatherStatus || p.fatherStatus || 'ALIVE'),
            fatherLivingStatus: isFatherLate ? 'LATE' : 'ALIVE',
            fatherOccupation,
            fatherMobile,
            motherName,
            motherStatus: isMotherLate ? 'LATE' : (family?.motherStatus || p.jathagamData?.motherStatus || p.motherStatus || 'ALIVE'),
            motherLivingStatus: isMotherLate ? 'LATE' : 'ALIVE',
            motherOccupation,
            motherMobile,
            siblings: siblingsList,
          },
          expectations: expectations || {},
        };
      })
    );

    // Filter by search term if provided
    let filtered = enrichedProfiles;
    if (options?.search && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      filtered = enrichedProfiles.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const displayId = (p.displayId || '').toLowerCase();
        const mobile = (p.userContact?.mobile || '').toLowerCase();
        const city = (p.city || '').toLowerCase();
        const caste = (p.caste || '').toLowerCase();
        return (
          name.includes(q) ||
          displayId.includes(q) ||
          mobile.includes(q) ||
          city.includes(q) ||
          caste.includes(q)
        );
      });
    }

    // Compute stats across all profiles
    const stats: AdminProfileStats = {
      total: enrichedProfiles.length,
      pending: enrichedProfiles.filter((p) => !p.status || p.status === 'PENDING').length,
      approved: enrichedProfiles.filter((p) => p.status === 'APPROVED').length,
      rejected: enrichedProfiles.filter((p) => p.status === 'REJECTED').length,
    };

    return {
      success: true,
      profiles: filtered,
      stats,
    };
  } catch (err: any) {
    console.error('Error in getAllProfilesForAdmin:', err);
    return {
      success: false,
      error: err.message || 'Failed to fetch profiles',
      profiles: [],
      stats: { total: 0, pending: 0, approved: 0, rejected: 0 },
    };
  }
}

export async function updateProfileStatus(params: {
  profileId: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  rejectedReason?: string;
  approvedBy?: string;
}) {
  try {
    const { profileId, status, rejectedReason, approvedBy = 'ADMIN' } = params;

    if (!profileId) {
      throw new Error('Profile ID is required.');
    }

    // First find the profile by id or displayId
    let query = supabase.from('Profile').select('id, displayId, name, userId, status');
    if (profileId.toLowerCase().startsWith('nm-')) {
      query = query.ilike('displayId', profileId);
    } else {
      query = query.or(`id.eq.${profileId},displayId.ilike.${profileId}`);
    }

    const { data: profile, error: findError } = await query.maybeSingle();

    if (findError || !profile) {
      throw new Error('Profile not found.');
    }

    const nowIso = new Date().toISOString();
    const updatePayload: any = {
      status,
      isLive: status === 'APPROVED',
      approvedAt: status === 'APPROVED' ? nowIso : null,
      approvedBy: status === 'APPROVED' ? approvedBy : null,
      rejectedReason: status === 'REJECTED' ? (rejectedReason || 'Admin Denied') : null,
    };

    const { data: updated, error: updateError } = await supabase
      .from('Profile')
      .update(updatePayload)
      .eq('id', profile.id)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error('Error updating profile status in Supabase:', updateError);
      throw updateError;
    }

    return {
      success: true,
      message: `Profile ${profile.displayId || profile.name} marked as ${status}`,
      profile: updated,
    };
  } catch (err: any) {
    console.error('Error in updateProfileStatus:', err);
    return {
      success: false,
      error: err.message || 'Failed to update profile status',
    };
  }
}

