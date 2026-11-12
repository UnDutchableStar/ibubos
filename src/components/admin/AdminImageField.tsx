'use client';

import { useRef, useState } from 'react';

import { upload } from '@vercel/blob/client';

import { getUploadError, resolveUploadType, safeUploadName, uploadErrorMessages } from '@/lib/admin/upload';

type AdminImageFieldProps = {
    defaultValue: string;
    useBlobStorage: boolean;
};

const AdminImageField = ({ defaultValue, useBlobStorage }: AdminImageFieldProps) => {
    const [image, setImage] = useState(defaultValue);
    const [failed, setFailed] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerImages, setPickerImages] = useState<string[] | null>(null);
    const [pickerError, setPickerError] = useState('');
    const fileInput = useRef<HTMLInputElement>(null);

    const chooseImage = (value: string) => {
        setImage(value);
        setFailed(false);
    };

    const uploadImage = async () => {
        const file = fileInput.current?.files?.[0];
        if (!file) return;

        const problem = getUploadError(file);
        if (problem) {
            setUploadError(uploadErrorMessages[problem]);
            if (fileInput.current) fileInput.current.value = '';

            return;
        }

        setUploading(true);
        setUploadError('');

        try {
            if (useBlobStorage) {
                // Direct vanuit de browser naar Vercel Blob; de server levert alleen het token.
                const blob = await upload(`admin-images/${safeUploadName(file)}`, file, {
                    access: 'public',
                    handleUploadUrl: '/api/admin/upload',
                    contentType: resolveUploadType(file) ?? undefined
                });
                chooseImage(blob.url);
            } else {
                const formData = new FormData();
                formData.append('file', file);
                const response = await fetch('/api/admin/upload', { method: 'POST', body: formData });
                const result = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
                if (!response.ok || !result.url) {
                    throw new Error(result.error ?? `Upload mislukt (status ${response.status}).`);
                }
                chooseImage(result.url);
            }
        } catch (error) {
            setUploadError(error instanceof Error ? error.message : 'Upload mislukt.');
        } finally {
            setUploading(false);
            if (fileInput.current) fileInput.current.value = '';
        }
    };

    const togglePicker = async () => {
        const opening = !pickerOpen;
        setPickerOpen(opening);
        if (!opening || pickerImages !== null) return;

        setPickerError('');
        try {
            const response = await fetch('/api/admin/images');
            const result = (await response.json().catch(() => ({}))) as { images?: string[]; error?: string };
            if (!response.ok || !result.images) {
                throw new Error(result.error ?? 'De afbeeldingen konden niet worden geladen.');
            }
            setPickerImages(result.images);
        } catch (error) {
            setPickerImages([]);
            setPickerError(error instanceof Error ? error.message : 'De afbeeldingen konden niet worden geladen.');
        }
    };

    return (
        <div className='admin-image-field'>
            <label>
                Afbeelding
                <input
                    name='image'
                    value={image}
                    onChange={(event) => chooseImage(event.target.value)}
                    placeholder='/images/...'
                />
            </label>
            <div className='admin-image-upload'>
                <input
                    ref={fileInput}
                    type='file'
                    accept='image/*,.heic,.heif'
                    onChange={uploadImage}
                    disabled={uploading}
                />
                <button type='button' onClick={togglePicker} disabled={uploading} aria-expanded={pickerOpen}>
                    Kies bestaande afbeelding
                </button>
                {uploading ? <span className='admin-image-uploading'>Uploaden…</span> : null}
            </div>
            {pickerOpen ? (
                <div className='admin-image-picker'>
                    <p className='admin-image-picker__title'>Afbeeldingen op de site</p>
                    {pickerImages === null && !pickerError ? <p className='admin-hint'>Laden…</p> : null}
                    {pickerError ? <p className='admin-image-error'>{pickerError}</p> : null}
                    {pickerImages?.length ? (
                        <div className='admin-image-picker__grid'>
                            {pickerImages.map((src) => (
                                <button
                                    key={src}
                                    type='button'
                                    className='admin-image-picker__option'
                                    onClick={() => {
                                        chooseImage(src);
                                        setPickerOpen(false);
                                    }}>
                                    <img src={src} alt='' loading='lazy' />
                                    <span>{decodeURIComponent(src.split('/').pop() ?? src)}</span>
                                </button>
                            ))}
                        </div>
                    ) : null}
                    {pickerImages?.length === 0 && !pickerError ? (
                        <p className='admin-hint'>Geen afbeeldingen gevonden in public/images.</p>
                    ) : null}
                </div>
            ) : null}
            <small className='admin-hint'>
                Optioneel. Upload een JPG, PNG of WebP (max. 10 MB) of kies een bestaande afbeelding.
            </small>
            {uploadError ? <p className='admin-image-error'>{uploadError}</p> : null}
            <div className='admin-image-preview'>
                {image && !failed ? (
                    <img src={image} alt='Voorbeeld van de gekozen afbeelding' onError={() => setFailed(true)} />
                ) : (
                    <span>{image ? 'Geen geldige afbeelding' : 'Geen afbeelding gekozen'}</span>
                )}
            </div>
        </div>
    );
};

export default AdminImageField;
