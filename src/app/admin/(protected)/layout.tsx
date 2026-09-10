import type { ReactNode } from 'react';

import AdminShell from '@/components/admin/AdminShell';
import { requireAdmin } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

const ProtectedAdminLayout = async ({ children }: { children: ReactNode }) => {
    const session = await requireAdmin();

    return <AdminShell user={session.user}>{children}</AdminShell>;
};

export default ProtectedAdminLayout;

