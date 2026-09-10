import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/server';

export const isAuthConfigured = () =>
    Boolean(process.env.NEON_AUTH_BASE_URL?.trim() && process.env.NEON_AUTH_COOKIE_SECRET?.trim());

export const getAdminSession = async () => {
    const { data } = await auth.getSession();

    return data?.user?.role === 'admin' ? data : null;
};

export const hasAdminSession = async () => Boolean(await getAdminSession());

export const requireAdmin = async () => {
    const session = await getAdminSession();
    if (!session) redirect('/admin/login');

    return session;
};

