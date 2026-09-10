'use client';

import { useEffect, useRef, useState } from 'react';

import { logoutAction } from '@/app/admin/(protected)/logout/actions';
import ChangePasswordModal from './ChangePasswordModal';

type User = {
    name?: string | null;
    email: string;
};

const UserMenu = ({ user }: { user: User }) => {
    const [open, setOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClick);

        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <>
            <div ref={ref} className='admin-user-menu'>
                <button
                    type='button'
                    onClick={() => setOpen((prev) => !prev)}
                    aria-expanded={open}
                    aria-haspopup='menu'
                    className='admin-user-menu__trigger'
                >
                    <span className='admin-user-menu__label'>
                        {user.name ?? user.email}
                        {user.name && <span className='admin-user-menu__email'>{user.email}</span>}
                    </span>
                    <svg
                        className='admin-user-menu__chevron'
                        data-open={open}
                        xmlns='http://www.w3.org/2000/svg'
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        aria-hidden='true'
                    >
                        <path d='m6 9 6 6 6-6' />
                    </svg>
                </button>

                {open && (
                    <div className='admin-user-menu__dropdown' role='menu'>
                        <div className='admin-user-menu__info'>
                            <span className='admin-user-menu__name'>{user.name ?? user.email}</span>
                            <span className='admin-user-menu__email-full'>{user.email}</span>
                        </div>
                        <button
                            type='button'
                            role='menuitem'
                            className='admin-user-menu__item'
                            onClick={() => {
                                setPasswordOpen(true);
                                setOpen(false);
                            }}
                        >
                            Wachtwoord wijzigen
                        </button>
                        <form action={logoutAction} className='admin-user-menu__form'>
                            <button
                                type='submit'
                                role='menuitem'
                                className='admin-user-menu__item admin-user-menu__item--logout'
                            >
                                Uitloggen
                            </button>
                        </form>
                    </div>
                )}
            </div>

            <ChangePasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
        </>
    );
};

export default UserMenu;
