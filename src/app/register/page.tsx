import ProfileWizard from '@/frontend/components/profile-wizard/ProfileWizard';
import { Metadata } from 'next';
import { BRANDING } from '@/constants/branding';

export const metadata: Metadata = {
  title: `இலவச பதிவு | Register Free - ${BRANDING.brandName}`,
  description: `Register free on ${BRANDING.brandName}. ${BRANDING.subTaglineTamil}. Complete your profile with Jathagam astrology details.`,
};

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  return <ProfileWizard />;
}
