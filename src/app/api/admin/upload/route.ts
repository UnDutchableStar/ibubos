import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

import { hasAdminSession } from '@/lib/admin/auth';
import {
    getUploadError,
    MAX_IMAGE_UPLOAD_BYTES,
    safeUploadName,
    supportedImageTypes,
    uploadErrorMessages
} from '@/lib/admin/upload';

export const runtime = 'nodejs';

// Client-uploads naar Vercel Blob vragen hier om een token en sturen daarna
// het bestand rechtstreeks naar de opslag, voorbij de body-limiet van Vercel.
const handleClientToken = async (request: Request) => {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json(
            { error: 'Uploads zijn nog niet ingesteld. Koppel een Vercel Blob-store.' },
            { status: 503 }
        );
    }

    let body: HandleUploadBody;
    try {
        body = (await request.json()) as HandleUploadBody;
    } catch {
        return NextResponse.json({ error: 'Ongeldig verzoek.' }, { status: 400 });
    }

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async () => ({
                allowedContentTypes: [...supportedImageTypes],
                maximumSizeInBytes: MAX_IMAGE_UPLOAD_BYTES,
                addRandomSuffix: false
            })
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        console.error('Blob-token aanmaken mislukt:', error);

        return NextResponse.json(
            { error: 'De upload kon niet worden voorbereid. Probeer het opnieuw.' },
            { status: 502 }
        );
    }
};

// Zonder Blob-token (lokaal) schrijven we naar public/images/uploads.
// Vercel heeft een alleen-lezen bestandssysteem, dus daar is dit geen optie.
const handleLocalFile = async (request: Request) => {
    if (process.env.VERCEL) {
        return NextResponse.json(
            { error: 'Uploads zijn nog niet ingesteld. Koppel een Vercel Blob-store en voeg BLOB_READ_WRITE_TOKEN toe.' },
            { status: 503 }
        );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
        return NextResponse.json({ error: 'Kies eerst een afbeelding.' }, { status: 400 });
    }

    const uploadError = getUploadError(file);
    if (uploadError) {
        return NextResponse.json({ error: uploadErrorMessages[uploadError] }, { status: 400 });
    }

    try {
        const filename = safeUploadName(file);
        const directory = join(process.cwd(), 'public', 'images', 'uploads');
        await mkdir(directory, { recursive: true });
        await writeFile(join(directory, filename), Buffer.from(await file.arrayBuffer()));

        return NextResponse.json({ url: `/images/uploads/${filename}` });
    } catch (error) {
        console.error('Lokale upload mislukt:', error);

        return NextResponse.json({ error: 'Opslaan van de afbeelding mislukte. Probeer het opnieuw.' }, { status: 502 });
    }
};

export async function POST(request: Request) {
    if (!(await hasAdminSession())) {
        return NextResponse.json({ error: 'Niet geautoriseerd.' }, { status: 401 });
    }

    if (request.headers.get('content-type')?.includes('application/json')) {
        return handleClientToken(request);
    }

    return handleLocalFile(request);
}
