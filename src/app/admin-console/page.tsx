import AdminConsole from '@/frontend/components/admin/AdminConsole';
import { Metadata } from 'next';
import { BRANDING } from '@/constants/branding';

export const metadata: Metadata = {
  title: `நிர்வாக பலகை | Admin Console - ${BRANDING.brandName}`,
  description: `Admin console for ${BRANDING.brandName} to review, verify, approve, or deny candidate profile registrations.`,
};

export const dynamic = 'force-dynamic';

export default function AdminConsolePage() {
  return <AdminConsole />;
}

