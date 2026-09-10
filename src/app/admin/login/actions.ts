'use server';

import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/server';

export const loginAction = async (formData: FormData) => {
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    const { data, error } = await auth.signIn.email({ email, password });
    if (error || !data) redirect('/admin/login?error=1');

    if (data.user?.role !== 'admin') {
        await auth.signOut();
        redirect('/admin/login?error=1');
    }

    redirect('/admin');
};

