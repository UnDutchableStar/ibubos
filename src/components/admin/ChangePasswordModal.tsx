'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { changePasswordAction } from '@/lib/admin/actions';

type ChangePasswordModalProps = {
    open: boolean;
    onClose: () => void;
};

const ChangePasswordModal = ({ open, onClose }: ChangePasswordModalProps) => {
    const [mounted, setMounted] = useState(open);
    const [visible, setVisible] = useState(false);
    const [state, formAction, pending] = useActionState(changePasswordAction, {});
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (open) {
            setMounted(true);
            const raf = requestAnimationFrame(() => setVisible(true));

            return () => cancelAnimationFrame(raf);
        }

        setVisible(false);
        const timer = setTimeout(() => setMounted(false), 300);

        return () => clearTimeout(timer);
    }, [open]);

    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset();
            const timer = setTimeout(onClose, 1800);

            return () => clearTimeout(timer);
        }
    }, [state?.success, onClose]);

    if (!mounted) return null;

    const success = Boolean(state?.success);

    return createPortal(
        <>
            <div
                className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
                    visible ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={onClose}
                aria-hidden='true'
            />
            <div
                className={`fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[rgba(21,88,59,0.25)] bg-[#fffdf7] p-8 text-[var(--ibu-green)] shadow-2xl transition-all duration-300 ${
                    visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`}
                role='dialog'
                aria-modal='true'
                aria-labelledby='change-password-title'
            >
                {success ? (
                    <div className='text-center'>
                        <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ibu-green)]/10'>
                            <svg
                                className='h-6 w-6 text-[var(--ibu-green)]'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M5 13l4 4L19 7'
                                />
                            </svg>
                        </div>
                        <h2 id='change-password-title' className='mb-2 text-xl font-black text-[var(--ibu-green)]'>
                            Wachtwoord gewijzigd
                        </h2>
                        <p className='text-sm opacity-80'>Je wachtwoord is succesvol gewijzigd.</p>
                    </div>
                ) : (
                    <>
                        <h2 id='change-password-title' className='mb-2 text-xl font-black text-[var(--ibu-green)]'>
                            Wachtwoord wijzigen
                        </h2>
                        <p className='mb-6 text-sm opacity-80'>
                            Vul je huidige wachtwoord en een nieuw wachtwoord in.
                        </p>

                        <form ref={formRef} action={formAction} className='admin-form'>
                            <label>
                                <span>Huidig wachtwoord</span>
                                <input
                                    type='password'
                                    name='currentPassword'
                                    required
                                    autoComplete='current-password'
                                    disabled={pending}
                                />
                            </label>
                            <label>
                                <span>Nieuw wachtwoord</span>
                                <input
                                    type='password'
                                    name='newPassword'
                                    required
                                    minLength={8}
                                    autoComplete='new-password'
                                    disabled={pending}
                                />
                            </label>
                            <label>
                                <span>Bevestig nieuw wachtwoord</span>
                                <input
                                    type='password'
                                    name='confirmPassword'
                                    required
                                    minLength={8}
                                    autoComplete='new-password'
                                    disabled={pending}
                                />
                            </label>

                            {state?.error && <div className='admin-error'>{state.error}</div>}

                            <div className='flex gap-3 pt-2'>
                                <button
                                    type='submit'
                                    className='brand-button flex-1'
                                    disabled={pending}
                                    aria-busy={pending}
                                >
                                    {pending ? 'Bezig...' : 'Wachtwoord wijzigen'}
                                </button>
                                <button
                                    type='button'
                                    onClick={onClose}
                                    className='brand-button brand-button--outline'
                                    disabled={pending}
                                >
                                    Annuleren
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </>,
        document.body
    );
};

export default ChangePasswordModal;
