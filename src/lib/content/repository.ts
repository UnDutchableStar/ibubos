import { and, asc, desc, eq, isNotNull, lte, ne, sql } from 'drizzle-orm';

import { blogPosts, projects, type BlogPost, type Project } from '../content.ts';
import { getDb } from '../db/client.ts';
import { contentEntries, type ContentEntry, type NewContentEntry } from '../db/schema.ts';

import { rankRelated } from './ranking.ts';
import type { ContentDraft, ContentRecord, ContentStatus, ContentType } from './types.ts';

export class ContentSetupError extends Error {
    constructor() {
        super('De database is nog niet gekoppeld. Voeg DATABASE_URL toe om content te beheren.');
        this.name = 'ContentSetupError';
    }
}

const seedDate = (index: number) => new Date(Date.UTC(2025, 0, 15 - index, 12));

const seedBlogs = (): ContentRecord[] =>
    blogPosts.map((post, index) => ({
        id: `seed-blog-${post.slug}`,
        type: 'blog',
        status: 'published',
        ...post,
        facts: null,
        outcome: null,
        createdAt: seedDate(index),
        updatedAt: seedDate(index),
        publishedAt: seedDate(index),
        plannedAt: null
    }));

const seedProjects = (): ContentRecord[] =>
    projects.map((project, index) => ({
        id: `seed-project-${project.slug}`,
        type: 'project',
        status: 'published',
        ...project,
        readTime: null,
        takeaway: null,
        createdAt: seedDate(index),
        updatedAt: seedDate(index),
        publishedAt: seedDate(index),
        plannedAt: null
    }));

const toRecord = (entry: ContentEntry): ContentRecord => ({
    ...entry,
    type: entry.type as ContentType,
    status: entry.status as ContentStatus
});

const toBlog = (record: ContentRecord): BlogPost => ({
    slug: record.slug,
    title: record.title,
    description: record.description,
    image: record.image,
    label: record.label,
    readTime: record.readTime ?? '',
    intro: record.intro,
    sections: record.sections,
    takeaway: record.takeaway ?? '',
    tags: record.tags
});

const toProject = (record: ContentRecord): Project => ({
    slug: record.slug,
    title: record.title,
    description: record.description,
    image: record.image,
    label: record.label,
    intro: record.intro,
    facts: record.facts ?? [],
    sections: record.sections,
    outcome: record.outcome ?? '',
    tags: record.tags
});

const listPublishedRecords = async (type: ContentType): Promise<ContentRecord[]> => {
    if (!getDb()) return type === 'blog' ? seedBlogs() : seedProjects();

    try {
        const rows = await withPlannedAtRetry((db) =>
            db
                .select()
                .from(contentEntries)
                .where(and(eq(contentEntries.type, type), eq(contentEntries.status, 'published')))
                .orderBy(desc(contentEntries.publishedAt), asc(contentEntries.slug))
        );

        return rows.map(toRecord);
    } catch {
        return type === 'blog' ? seedBlogs() : seedProjects();
    }
};

export const listPublishedBlogs = async () => (await listPublishedRecords('blog')).map(toBlog);
export const listPublishedProjects = async () => (await listPublishedRecords('project')).map(toProject);

export const getPublishedBlog = async (slug: string) => {
    const record = (await listPublishedRecords('blog')).find((item) => item.slug === slug);

return record ? toBlog(record) : undefined;
};

export const getPublishedProject = async (slug: string) => {
    const record = (await listPublishedRecords('project')).find((item) => item.slug === slug);

return record ? toProject(record) : undefined;
};

export const getFeaturedBlog = async () => {
    const post = (await listPublishedBlogs())[0];
    if (!post) throw new Error('Er is nog geen gepubliceerde blog.');

return post;
};

export const getFeaturedProject = async () => {
    const project = (await listPublishedProjects())[0];
    if (!project) throw new Error('Er is nog geen gepubliceerd project.');

return project;
};

export const getRelatedPublishedBlogs = async (slug: string, tags: string[], limit = 3) => {
    const records = rankRelated(await listPublishedRecords('blog'), tags, slug, limit);

return records.map(toBlog);
};

export const getRelatedPublishedProjects = async (slug: string, tags: string[], limit = 2) => {
    const records = rankRelated(await listPublishedRecords('project'), tags, slug, limit);

return records.map(toProject);
};

const requireDb = () => {
    const db = getDb();
    if (!db) throw new ContentSetupError();

return db;
};

type Db = NonNullable<ReturnType<typeof getDb>>;

// Postgres 42703 = undefined_column. Oudere databases missen planned_at;
// maak de kolom dan alsnog aan (zie drizzle/0001_planned_at.sql) en probeer opnieuw.
const isMissingPlannedAtColumn = (error: unknown): boolean => {
    const inspect = (candidate: unknown): boolean => {
        if (!candidate || typeof candidate !== 'object') return false;
        const { code, message } = candidate as { code?: string; message?: string };

        return code === '42703' && Boolean(message?.includes('planned_at'));
    };

    return inspect(error) || inspect((error as { cause?: unknown }).cause);
};

const withPlannedAtRetry = async <T>(run: (db: Db) => Promise<T>): Promise<T> => {
    const db = requireDb();
    try {
        return await run(db);
    } catch (error) {
        if (!isMissingPlannedAtColumn(error)) throw error;
        await db.execute(
            sql`ALTER TABLE content_entries ADD COLUMN IF NOT EXISTS planned_at timestamp with time zone`
        );

        return run(db);
    }
};

export const listAdminContent = async (type?: ContentType) => {
    const rows = await withPlannedAtRetry((db) =>
        type
            ? db
                  .select()
                  .from(contentEntries)
                  .where(eq(contentEntries.type, type))
                  .orderBy(desc(contentEntries.updatedAt))
            : db.select().from(contentEntries).orderBy(desc(contentEntries.updatedAt))
    );

return rows.map(toRecord);
};

export const getAdminContent = async (id: string) => {
    const [entry] = await withPlannedAtRetry((db) =>
        db.select().from(contentEntries).where(eq(contentEntries.id, id)).limit(1)
    );

return entry ? toRecord(entry) : undefined;
};

export const findContentBySlug = async (type: ContentType, slug: string, excludedId?: string) => {
    const db = requireDb();
    const conditions = [eq(contentEntries.type, type), eq(contentEntries.slug, slug)];
    if (excludedId) conditions.push(ne(contentEntries.id, excludedId));
    const [entry] = await db
        .select({ id: contentEntries.id })
        .from(contentEntries)
        .where(and(...conditions))
        .limit(1);

return entry;
};

export const createContent = async (draft: ContentDraft) => {
    const values: NewContentEntry = { ...draft, publishedAt: null };
    const [entry] = await withPlannedAtRetry((db) => db.insert(contentEntries).values(values).returning());

return toRecord(entry);
};

export const updateContent = async (id: string, draft: ContentDraft) => {
    const [entry] = await withPlannedAtRetry((db) =>
        db
            .update(contentEntries)
            .set({ ...draft, updatedAt: new Date() })
            .where(eq(contentEntries.id, id))
            .returning()
    );

return entry ? toRecord(entry) : undefined;
};

export const setContentStatus = async (id: string, status: ContentStatus) => {
    const current = await getAdminContent(id);
    if (!current) return undefined;
    const [entry] = await withPlannedAtRetry((db) =>
        db
            .update(contentEntries)
            .set({
                status,
                publishedAt: status === 'published' ? current.publishedAt ?? new Date() : current.publishedAt,
                updatedAt: new Date()
            })
            .where(eq(contentEntries.id, id))
            .returning()
    );

return entry ? toRecord(entry) : undefined;
};

export const deleteContent = async (id: string) => {
    const [entry] = await withPlannedAtRetry((db) =>
        db.delete(contentEntries).where(eq(contentEntries.id, id)).returning()
    );

return entry ? toRecord(entry) : undefined;
};

export const publishDueContent = async (dueBefore: Date) => {
    const rows = await withPlannedAtRetry((db) =>
        db
            .update(contentEntries)
            .set({
                status: 'published',
                // De geplande dag wordt de publicatiedatum, zodat de volgorde klopt.
                publishedAt: sql`coalesce(${contentEntries.plannedAt}, now())`,
                updatedAt: new Date()
            })
            .where(
                and(
                    eq(contentEntries.status, 'draft'),
                    isNotNull(contentEntries.plannedAt),
                    lte(contentEntries.plannedAt, dueBefore)
                )
            )
            .returning()
    );

    return rows.map(toRecord);
};

export const countImageReferences = async (image: string, excludedId: string) => {
    const rows = await requireDb()
        .select({ id: contentEntries.id })
        .from(contentEntries)
        .where(and(eq(contentEntries.image, image), ne(contentEntries.id, excludedId)));

return rows.length;
};
