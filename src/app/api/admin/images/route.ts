import { readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';

import { NextResponse } from 'next/server';

import { hasAdminSession } from '@/lib/admin/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const pickerExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp']);

const collectImages = async (directory: string, prefix: string): Promise<string[]> => {
    const entries = await readdir(directory, { withFileTypes: true });
    const paths = await Promise.all(
        entries.map((entry) =>
            entry.isDirectory()
                ? collectImages(join(directory, entry.name), `${prefix}${entry.name}/`)
                : pickerExtensions.has(extname(entry.name).toLowerCase())
                  ? [`${prefix}${entry.name}`]
                  : []
        )
    );

    return paths.flat();
};

export async function GET() {
    if (!(await hasAdminSession())) {
        return NextResponse.json({ error: 'Niet geautoriseerd.' }, { status: 401 });
    }

    try {
        const root = join(process.cwd(), 'public', 'images');
        const images = (await collectImages(root, '/images/'))
            .map((path) => encodeURI(path))
            .sort((a, b) => a.localeCompare(b, 'nl'));

        return NextResponse.json({ images });
    } catch (error) {
        console.error('Afbeeldingenlijst laden mislukt:', error);

        return NextResponse.json({ error: 'De afbeeldingen konden niet worden geladen.' }, { status: 500 });
    }
}
