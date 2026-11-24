import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function calculateAge(dobString?: string): number | null {
  if (!dobString) return null;
  const bDate = new Date(dobString);
  if (isNaN(bDate.getTime())) return null;
  const diff = Date.now() - bDate.getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lookingFor = searchParams.get('lookingFor');
    const genderParam = searchParams.get('gender');
    const minAge = searchParams.get('minAge') ? parseInt(searchParams.get('minAge')!, 10) : null;
    const maxAge = searchParams.get('maxAge') ? parseInt(searchParams.get('maxAge')!, 10) : null;
    const caste = searchParams.get('caste');
    const area = searchParams.get('area') || searchParams.get('city');
    const dosham = searchParams.get('dosham');
    const rasi = searchParams.get('rasi');
    const nakshatra = searchParams.get('nakshatra');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;

    // Start with active profiles
    let query = supabase.from('Profile').select('*');

    // Exclude rejected profiles
    query = query.neq('status', 'REJECTED');

    // Determine target gender
    let targetGender: string | null = null;
    if (lookingFor) {
      if (lookingFor.toUpperCase() === 'BRIDE') targetGender = 'FEMALE';
      else if (lookingFor.toUpperCase() === 'GROOM') targetGender = 'MALE';
    } else if (genderParam && genderParam !== 'ALL') {
      targetGender = genderParam.toUpperCase();
    }

    if (targetGender) {
      query = query.eq('gender', targetGender);
    }

    // Execute query ordered by approved profiles first, then latest
    const { data: rawProfiles, error } = await query
      .order('id', { ascending: false })
      .limit(limit * 2);

    if (error) {
      console.error('API /api/profiles query error:', error);
      return NextResponse.json({ success: false, error: error.message, profiles: [] }, { status: 500 });
    }

    const profiles = rawProfiles || [];

    // Enrich each profile with Family, Expectations, Sibling, and Education data
    const enriched = await Promise.all(
      profiles.map(async (p) => {
        let userContact: any = {
          mobile: p.profileCreatedBy || null,
          email: null,
          whatsapp: null,
        };

        if (p.userId) {
          const { data: user } = await supabase
            .from('User')
            .select('id, email, mobile_no, whatsappProfileDeliveryNumber')
            .eq('id', p.userId)
            .maybeSingle();

          if (user) {
            userContact = {
              mobile: user.mobile_no || p.profileCreatedBy,
              email: user.email,
              whatsapp: user.whatsappProfileDeliveryNumber || user.mobile_no || p.profileCreatedBy,
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

        const computedAge = calculateAge(p.dob) || p.age;

        const fatherName = family?.fatherName || p.jathagamData?.fatherName || p.fatherName || null;
        const fatherOccupation = isFatherLate ? null : (family?.fatherStatus || p.jathagamData?.fatherOccupation || p.fatherOccupation || null);
        const fatherMobile = family?.fatherMobile || p.jathagamData?.fatherMobile || p.fatherMobile || null;

        const motherName = family?.motherName || p.jathagamData?.motherName || p.motherName || null;
        const motherOccupation = isMotherLate ? null : (family?.motherStatus || p.jathagamData?.motherOccupation || p.motherOccupation || null);
        const motherMobile = family?.motherMobile || p.jathagamData?.motherMobile || p.motherMobile || null;

        return {
          ...p,
          age: computedAge,
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
          userContact,
        };
      })
    );

    // Apply in-memory filtering for flexible matching
    let filtered = enriched;

    // 1. Age Range
    if (minAge !== null && !isNaN(minAge)) {
      filtered = filtered.filter((p) => (p.age ? p.age >= minAge : true));
    }
    if (maxAge !== null && !isNaN(maxAge)) {
      filtered = filtered.filter((p) => (p.age ? p.age <= maxAge : true));
    }

    // 2. Caste
    if (caste && caste !== 'Any' && caste.trim()) {
      const cLower = caste.toLowerCase();
      filtered = filtered.filter((p) => {
        const pCaste = (p.caste || '').toLowerCase();
        const pSub = (p.subCaste || '').toLowerCase();
        return pCaste.includes(cLower) || cLower.includes(pCaste) || pSub.includes(cLower);
      });
    }

    // 3. Area / District
    if (area && area !== 'Any' && area.trim()) {
      const aLower = area.toLowerCase();
      filtered = filtered.filter((p) => {
        const pCity = (p.city || '').toLowerCase();
        const pState = (p.state || '').toLowerCase();
        const pWorkCity = (p.workCity || '').toLowerCase();
        return pCity.includes(aLower) || pState.includes(aLower) || pWorkCity.includes(aLower);
      });
    }

    // 4. Raasi
    if (rasi && rasi !== 'Any' && rasi.trim()) {
      const rLower = rasi.toLowerCase();
      filtered = filtered.filter((p) => (p.rasi || '').toLowerCase().includes(rLower));
    }

    // 5. Nakshatram
    if (nakshatra && nakshatra !== 'Any' && nakshatra.trim()) {
      const nLower = nakshatra.toLowerCase();
      filtered = filtered.filter((p) => (p.nakshatra || '').toLowerCase().includes(nLower));
    }

    // 6. Dosham
    if (dosham && dosham !== 'Any' && dosham.trim()) {
      if (dosham.toUpperCase() === 'SUTHAM') {
        filtered = filtered.filter((p) => {
          const d = (p.dosham || '').toUpperCase();
          return !d || d.includes('NONE') || d.includes('சுத்தம்') || d.includes('இல்லை');
        });
      } else {
        const dLower = dosham.toLowerCase();
        filtered = filtered.filter((p) => (p.dosham || '').toLowerCase().includes(dLower));
      }
    }

    // 7. General search term
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const id = (p.displayId || '').toLowerCase();
        const city = (p.city || '').toLowerCase();
        const c = (p.caste || '').toLowerCase();
        const k = (p.koottam || '').toLowerCase();
        return name.includes(q) || id.includes(q) || city.includes(q) || c.includes(q) || k.includes(q);
      });
    }

    // Return the results slice up to limit
    const finalResults = filtered.slice(0, limit);

    return NextResponse.json({
      success: true,
      count: finalResults.length,
      totalMatching: filtered.length,
      profiles: finalResults,
    });
  } catch (err: any) {
    console.error('API GET /api/profiles error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error', profiles: [] },
      { status: 500 }
    );
  }
}
