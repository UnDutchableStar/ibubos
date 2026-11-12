import Link from 'next/link';

import ContentImage from '@/components/content/ContentImage';
import type { ContentRecord, ContentType } from '@/lib/content/types';

const ContentTable = ({ items, type }: { items: ContentRecord[]; type: ContentType }) => {
    const base = type === 'blog' ? 'blogs' : 'projecten';

    return (
        <div className='admin-table-wrap'>
            <table className='admin-table'>
                <thead>
                    <tr>
                        <th>Titel</th>
                        <th>Status</th>
                        <th>Gepland</th>
                        <th>Bijgewerkt</th>
                        <th aria-label='Acties' />
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id}>
                            <td>
                                <div className='admin-table__content'>
                                    <ContentImage
                                        src={item.image}
                                        alt=''
                                        width={88}
                                        height={64}
                                        className='admin-table__thumbnail'
                                    />
                                    <div>
                                        <Link href={`/admin/${base}/${item.id}`} className='admin-table__title'>
                                            <strong>{item.title}</strong>
                                        </Link>
                                        <span>/{item.slug}</span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span className={`admin-status admin-status--${item.status}`}>
                                    {item.status === 'published' ? 'Gepubliceerd' : 'Concept'}
                                </span>
                            </td>
                            <td>
                                {item.plannedAt
                                    ? item.plannedAt.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
                                    : '—'}
                            </td>
                            <td>{item.updatedAt.toLocaleDateString('nl-NL')}</td>
                            <td>
                                <Link href={`/admin/${base}/${item.id}`}>Bewerken</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {!items.length ? (
                <div className='admin-empty'>
                    <p>Nog geen content gevonden.</p>
                    <Link className='brand-button' href={`/admin/${base}/new`}>
                        {type === 'blog' ? 'Schrijf je eerste blog' : 'Maak je eerste project'}
                    </Link>
                </div>
            ) : null}
        </div>
    );
};

export default ContentTable;
