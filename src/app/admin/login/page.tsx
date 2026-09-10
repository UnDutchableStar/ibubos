import { redirect } from 'next/navigation';

import { hasAdminSession, isAuthConfigured } from '@/lib/admin/auth';

import { loginAction } from './actions';

export const dynamic = 'force-dynamic';

type LoginPageProps = { searchParams: Promise<{ error?: string }> };

const LoginPage = async ({ searchParams }: LoginPageProps) => {
    if (await hasAdminSession()) redirect('/admin');
    const { error } = await searchParams;
    const configured = isAuthConfigured();

    return (
        <main className='admin-page admin-login font-brand'>
            <section className='admin-login__card'>
                <p className='section-kicker'>Ibu Bos beheer</p>
                <h1>Inloggen</h1>
                <p>Beheer hier samen de blogs en projecten van Ibu Bos.</p>
                {!configured ? (
                    <div className='admin-notice'>
                        Voeg eerst <code>NEON_AUTH_BASE_URL</code> en <code>NEON_AUTH_COOKIE_SECRET</code> toe aan
                        de environment-variabelen.
                    </div>
                ) : (
                    <form action={loginAction} className='admin-form'>
                        <label>
                            E-mailadres
                            <input name='email' type='email' autoComplete='email' required />
                        </label>
                        <label>
                            Wachtwoord
                            <input name='password' type='password' autoComplete='current-password' required />
                        </label>
                        {error ? <p className='admin-error'>De gebruikersnaam of het wachtwoord klopt niet.</p> : null}
                        <button className='brand-button' type='submit'>
                            Inloggen
                        </button>
                    </form>
                )}
            </section>
        </main>
    );
};

export default LoginPage;

