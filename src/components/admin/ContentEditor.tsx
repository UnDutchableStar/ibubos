import Link from 'next/link';

import {
    deleteContentAction,
    publishContentAction,
    saveContentAction,
    unpublishContentAction
} from '@/lib/admin/actions';
import type { ContentRecord, ContentType } from '@/lib/content/types';

import AdminDateField from './AdminDateField';
import AdminImageField from './AdminImageField';
import AdminSectionsField from './AdminSectionsField';

type EditorProps = {
    type: ContentType;
    item?: ContentRecord;
    saved?: boolean;
    published?: boolean;
    error?: string;
};

const ContentEditor = ({ type, item, saved, published, error }: EditorProps) => {
    const isBlog = type === 'blog';
    const base = isBlog ? 'blogs' : 'projecten';
    const saveAction = saveContentAction.bind(null, type, item?.id ?? null);

    return (
        <>
            <div className='admin-title-row'>
                <div>
                    <p className='section-kicker'>{item ? 'Bewerken' : 'Nieuw'}</p>
                    <h1>{item?.title ?? (isBlog ? 'Nieuwe blog' : 'Nieuw project')}</h1>
                    <p className='admin-title-row__status'>
                        {item ? (
                            <span className={`admin-status admin-status--${item.status}`}>
                                {item.status === 'published' ? 'Gepubliceerd' : 'Concept'}
                            </span>
                        ) : (
                            <span className='admin-status admin-status--draft'>Nog niet opgeslagen</span>
                        )}
                        {item?.status === 'published' ? (
                            <Link href={`/${base}/${item.slug}`} target='_blank'>
                                Bekijk op website
                            </Link>
                        ) : null}
                    </p>
                </div>
                <Link href={`/admin/${base}`}>Terug naar overzicht</Link>
            </div>
            {saved ? <p className='admin-success'>Opgeslagen.</p> : null}
            {published ? <p className='admin-success'>De content staat nu live.</p> : null}
            {error === 'slug' ? <p className='admin-error'>Deze URL wordt al gebruikt. Kies een andere titel.</p> : null}
            {error === 'validation' ? <p className='admin-error'>Controleer de verplichte velden en de lengte van de teksten.</p> : null}
            {error === 'db' ? <p className='admin-error'>Opslaan is mislukt door een fout in de database. Probeer het opnieuw.</p> : null}
            <form action={saveAction} className='admin-form admin-editor'>
                <div className='admin-form-grid'>
                    <label>
                        Titel
                        <input name='title' defaultValue={item?.title} required minLength={2} maxLength={120} />
                    </label>
                    <label>
                        Categorie
                        <input name='label' defaultValue={item?.label} required minLength={2} maxLength={40} />
                        <small className='admin-hint'>Verschijnt als label op de kaarten, bijv. “Living lab”.</small>
                    </label>
                </div>
                <div className='admin-field--narrow'>
                    <span className='admin-field__label'>Geplande datum</span>
                    <AdminDateField
                        name='plannedAt'
                        defaultValue={item?.plannedAt ? item.plannedAt.toISOString().slice(0, 10) : ''}
                    />
                    <small className='admin-hint'>Optioneel: een concept met een datum gaat die dag automatisch live (rond 07:00). Zichtbaar in de kalender op het dashboard.</small>
                </div>
                <label>
                    Samenvatting
                    <textarea name='summary' defaultValue={item?.description ?? item?.intro} required minLength={10} maxLength={300} />
                    <small className='admin-hint'>1 à 2 zinnen voor de archiefkaarten en de intro. Max. 300 tekens.</small>
                </label>
                <AdminImageField
                    defaultValue={item?.image ?? ''}
                    useBlobStorage={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
                />
                {isBlog ? (
                    <label>
                        Kern
                        <textarea name='takeaway' defaultValue={item?.takeaway ?? ''} required minLength={10} maxLength={1000} />
                        <small className='admin-hint'>De belangrijkste boodschap, uitgelicht onderaan het artikel.</small>
                    </label>
                ) : (
                    <div className='admin-form-grid'>
                        <label>
                            Feiten, één per regel
                            <textarea name='facts' defaultValue={item?.facts?.join('\n') ?? ''} required />
                            <small className='admin-hint'>Korte kernfeiten, bijv. locatie of partners. Max. 6.</small>
                        </label>
                        <label>
                            Resultaat
                            <textarea name='outcome' defaultValue={item?.outcome ?? ''} required minLength={10} maxLength={1000} />
                            <small className='admin-hint'>Wat heeft het project opgeleverd?</small>
                        </label>
                    </div>
                )}
                <AdminSectionsField initialSections={item?.sections ?? []} />
                <div className='admin-save-bar'>
                    <span>
                        {item?.status === 'published'
                            ? 'Wijzigingen staan direct live na opslaan.'
                            : 'Wordt opgeslagen als concept; publiceren kan daarna.'}
                    </span>
                    <button className='brand-button' type='submit'>
                        {item ? 'Wijzigingen opslaan' : 'Opslaan als concept'}
                    </button>
                </div>
            </form>
            {item ? (
                <div className='admin-danger-zone'>
                    {item.status === 'draft' ? (
                        <form action={publishContentAction.bind(null, type, item.id)}>
                            <button className='brand-button' type='submit'>Publiceren</button>
                        </form>
                    ) : (
                        <form action={unpublishContentAction.bind(null, type, item.id)}>
                            <button type='submit'>Offline halen</button>
                        </form>
                    )}
                    <form action={deleteContentAction.bind(null, type, item.id)} className='admin-delete-form'>
                        <label><input type='checkbox' name='confirm' value='yes' required /> Ik weet dat dit definitief is</label>
                        <button className='admin-delete' type='submit'>Verwijderen</button>
                    </form>
                </div>
            ) : null}
        </>
    );
};

export default ContentEditor;
