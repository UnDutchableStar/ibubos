import { z } from 'zod';

import type { ContentDraft, ContentStatus, ContentType } from './types';

export const createSlug = (value: string) =>
    value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 100);

export const imageSchema = z.string().trim().refine(
    (value) => {
        if (value.startsWith('/images/')) return true;

        try {
            const url = new URL(value);

return url.protocol === 'https:' && url.hostname.endsWith('.public.blob.vercel-storage.com');
        } catch {
            return false;
        }
    },
    { message: 'Kies een lokale afbeelding of upload een afbeelding via Vercel Blob.' }
);

const sectionSchema = z.object({
    heading: z.string().trim().min(2).max(120),
    body: z.string().trim().min(10).max(5000)
});

const tagSchema = z.string().trim().min(2).max(40);

const commonSchema = z.object({
    title: z.string().trim().min(2).max(120),
    slug: z.string().trim().max(100).optional(),
    description: z.string().trim().min(10).max(300),
    image: imageSchema.or(z.literal('')).default(''),
    label: z.string().trim().min(2).max(40),
    intro: z.string().trim().min(10).max(1200),
    sections: z.array(sectionSchema).min(1).max(4),
    tags: z.array(tagSchema).min(1).max(6),
    plannedAt: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

export const blogInputSchema = commonSchema.extend({
    takeaway: z.string().trim().min(10).max(1000)
});

export const projectInputSchema = commonSchema.extend({
    facts: z.array(z.string().trim().min(2).max(120)).min(1).max(6),
    outcome: z.string().trim().min(10).max(1000)
});

type ExistingIdentity = {
    slug: string;
    status: ContentStatus;
    publishedAt: Date | null;
};

const uniqueNormalized = (values: string[]) =>
    [...new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean))];

const uniqueTrimmed = (values: string[]) => [...new Set(values.map((value) => value.trim()).filter(Boolean))];

export const normalizeContentInput = (
    type: ContentType,
    input: unknown,
    existing?: ExistingIdentity
): ContentDraft => {
    const parsed = type === 'blog' ? blogInputSchema.parse(input) : projectInputSchema.parse(input);
    const requestedSlug = parsed.slug ? createSlug(parsed.slug) : '';
    const slug = existing?.publishedAt ? existing.slug : requestedSlug || createSlug(parsed.title);

    if (!slug) {
        throw new z.ZodError([
            {
                code: 'custom',
                message: 'De titel moet minimaal één letter of cijfer bevatten.',
                path: ['title']
            }
        ]);
    }

    const common = {
        type,
        status: existing?.status ?? ('draft' as const),
        slug,
        title: parsed.title,
        description: parsed.description,
        image: parsed.image,
        label: parsed.label,
        intro: parsed.intro,
        sections: parsed.sections,
        tags: uniqueNormalized(parsed.tags),
        plannedAt: parsed.plannedAt ? new Date(`${parsed.plannedAt}T12:00:00Z`) : null
    };

    if (type === 'blog') {
        const blog = blogInputSchema.parse(parsed);

return { ...common, readTime: null, takeaway: blog.takeaway, facts: null, outcome: null };
    }

    const project = projectInputSchema.parse(parsed);

return {
        ...common,
        readTime: null,
        takeaway: null,
        facts: uniqueTrimmed(project.facts),
        outcome: project.outcome
    };
};
