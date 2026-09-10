'use server';

import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/server';

export const logoutAction = async () => {
    await auth.signOut();
    redirect('/');
};

