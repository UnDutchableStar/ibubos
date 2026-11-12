import Image, { type ImageProps } from 'next/image';

type ContentImageProps = Omit<ImageProps, 'src' | 'alt'> & {
    src: string | null | undefined;
    alt?: string;
};

// Zonder afbeelding een neutrale plekhouder tonen in plaats van
// een lege src aan next/image te geven.
const ContentImage = ({ src, alt = '', className, ...rest }: ContentImageProps) => {
    if (!src) {
        return <span aria-hidden className={`image-placeholder${className ? ` ${className}` : ''}`} />;
    }

    return <Image src={src} alt={alt} className={className} {...rest} />;
};

export default ContentImage;
