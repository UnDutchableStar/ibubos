'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import ContentImage from '@/components/content/ContentImage';
import type { ContentRecord, ContentType } from '@/lib/content/types';

import ContentTable from './ContentTable';

type View = 'list' | 'grid';

const ContentBrowser = ({ items, type }: { items: ContentRecord[]; type: ContentType }) => {
    const base = type === 'blog' ? 'blogs' : 'projecten';
    const [view, setView] = useState<View>('list');

    // Onthoud de voorkeur per contenttype tussen bezoeken.
    useEffect(() => {
        const stored = window.localStorage.getItem(`admin-view-${type}`);
        if (stored === 'grid' || stored === 'list') setView(stored);
    }, [type]);

    const choose = (next: View) => {
        setView(next);
        window.localStorage.setItem(`admin-view-${type}`, next);
    };

    if (!items.length) {
        return (
            <div className='admin-empty'>
                <p>Nog geen content gevonden.</p>
                <Link className='brand-button' href={`/admin/${base}/new`}>
                    {type === 'blog' ? 'Schrijf je eerste blog' : 'Maak je eerste project'}
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className='admin-view-toggle' role='group' aria-label='Weergave'>
                <button
                    type='button'
                    aria-pressed={view === 'list'}
                    onClick={() => choose('list')}>
                    Lijst
                </button>
                <button
                    type='button'
                    aria-pressed={view === 'grid'}
                    onClick={() => choose('grid')}>
                    Grid
                </button>
            </div>
            {view === 'list' ? (
                <ContentTable items={items} type={type} />
            ) : (
                <div className='admin-grid'>
                    {items.map((item) => (
                        <Link key={item.id} href={`/admin/${base}/${item.id}`} className='admin-grid__card'>
                            <ContentImage
                                src={item.image}
                                alt=''
                                width={480}
                                height={300}
                                className='admin-grid__image'
                            />
                            <div className='admin-grid__body'>
                                <span className={`admin-status admin-status--${item.status}`}>
                                    {item.status === 'published' ? 'Gepubliceerd' : 'Concept'}
                                </span>
                                <strong>{item.title}</strong>
                                <span className='admin-grid__slug'>/{item.slug}</span>
                                <span className='admin-grid__meta'>
                                    {item.plannedAt
                                        ? `Gepland: ${item.plannedAt.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                        : `Bijgewerkt: ${item.updatedAt.toLocaleDateString('nl-NL')}`}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </>
    );
};

export default ContentBrowser;
