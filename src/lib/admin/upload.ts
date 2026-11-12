export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;

export const supportedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const extensionTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp'
};

const uploadExtensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
};

const heicTypes = new Set(['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence']);
const heicExtensions = new Set(['heic', 'heif']);

type UploadFile = { type?: string; name?: string; size: number };

const fileExtension = (name: string | undefined) => name?.split('.').pop()?.toLowerCase() ?? '';

// Browsers leveren niet altijd een MIME-type; val dan terug op de extensie.
export const resolveUploadType = (file: { type?: string; name?: string }) => {
    const declared = file.type?.toLowerCase().trim();
    if (declared && supportedImageTypes.has(declared)) return declared;

    return extensionTypes[fileExtension(file.name)] ?? null;
};

export type UploadError = 'heic' | 'unsupported-type' | 'too-large';

export const getUploadError = (file: UploadFile): UploadError | null => {
    const declared = file.type?.toLowerCase().trim() ?? '';
    const extension = fileExtension(file.name);

    if (heicTypes.has(declared) || heicExtensions.has(extension)) return 'heic';
    if (!resolveUploadType(file)) return 'unsupported-type';
    if (file.size > MAX_IMAGE_UPLOAD_BYTES) return 'too-large';

    return null;
};

export const uploadErrorMessages: Record<UploadError, string> = {
    heic: 'HEIC-afbeeldingen worden niet ondersteund. Exporteer de afbeelding als JPG, PNG of WebP.',
    'unsupported-type': 'Gebruik een JPG, PNG of WebP-afbeelding.',
    'too-large': 'De afbeelding mag maximaal 10 MB zijn.'
};

export const safeUploadName = (file: { name?: string; type?: string }) => {
    const base =
        (file.name ?? '')
            .replace(/\.[^.]+$/, '')
            .replace(/[^a-zA-Z0-9._-]/g, '-')
            .slice(0, 60) || 'afbeelding';
    const suffix = crypto.randomUUID().slice(0, 8);
    const extension = uploadExtensions[resolveUploadType(file) ?? ''] ?? 'jpg';

    return `${base}-${suffix}.${extension}`;
};

export const isBlobImageUrl = (value: string) => {
    try {
        const url = new URL(value);

        return url.protocol === 'https:' && url.hostname.endsWith('.public.blob.vercel-storage.com');
    } catch {
        return false;
    }
};
