'use client';

import type { ReactNode } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import UserMenu from './UserMenu';

type AdminShellProps = {
    children: ReactNode;
    user: {
        name?: string | null;
        email: string;
    };
};

const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/blogs', label: 'Blogs' },
    { href: '/admin/projecten', label: 'Projecten' }
];

const AdminShell = ({ children, user }: AdminShellProps) => {
    const pathname = usePathname();

    return (
        <main className='admin-page font-brand'>
            <header className='admin-header'>
                <Link href='/admin' className='admin-header__brand'>
                    Ibu Bos <span>beheer</span>
                </Link>
                <nav aria-label='Beheernavigatie'>
                    {navItems.map((item) => {
                        const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

                        return (
                            <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined}>
                                {item.label}
                            </Link>
                        );
                    })}
                    <UserMenu user={user} />
                </nav>
            </header>
            <div className='admin-content'>{children}</div>
        </main>
    );
};

export default AdminShell;
