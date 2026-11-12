import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import ContentImage from '@/components/content/ContentImage';
import { RelatedBlogs } from '@/components/content/RelatedContent';
import { getPublishedBlog, getRelatedPublishedBlogs } from '@/lib/content/repository';

type BlogDetailPageProps = {
    params: Promise<{ slug: string }>;
};

export const generateMetadata = async ({ params }: BlogDetailPageProps): Promise<Metadata> => {
    const { slug } = await params;
    const post = await getPublishedBlog(slug);

    if (!post) {
        return {};
    }

    return {
        title: `${post.title} | Ibu Bos`,
        description: post.description,
        openGraph: {
            type: 'article',
            title: post.title,
            description: post.description,
            images: post.image ? [post.image] : undefined
        }
    };
};

const BlogDetailPage = async ({ params }: BlogDetailPageProps) => {
    const { slug } = await params;
    const post = await getPublishedBlog(slug);

    if (!post) {
        notFound();
    }

    const related = await getRelatedPublishedBlogs(post.slug, post.tags, 3);

    return (
        <main className='detail-page font-brand text-[#15583B]'>
            <section className='detail-hero bg-[#FDF5E2] px-5 pb-12 pt-36 sm:px-8 sm:pb-20 lg:px-10'>
                <div className='hero-reveal mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.82fr_1fr] lg:items-end'>
                    <div>
                        <p className='section-kicker'>{post.label}</p>
                        <h1 className='mt-4 text-4xl font-extrabold leading-tight sm:text-7xl'>{post.title}</h1>
                        <p className='mt-5 max-w-2xl text-base leading-7 sm:text-xl sm:leading-8'>{post.intro}</p>
                    </div>
                    <ContentImage
                        src={post.image}
                        alt={post.title}
                        width={2500}
                        height={1667}
                        sizes='(max-width: 1024px) 100vw, 48vw'
                        className='detail-hero__image'
                        priority
                    />
                </div>
            </section>

            <section className='texture-section px-5 py-12 text-[#FDF5E2] sm:px-8 sm:py-20 lg:px-10'>
                <div className='mx-auto max-w-7xl'>
                    <Link href='/blogs' className='detail-back detail-back--light'>
                        Terug naar blogs
                    </Link>
                </div>
                <div className='detail-layout mx-auto mt-8 max-w-7xl'>
                    <article className='detail-article'>
                        <div className='detail-meta'>
                            <span>{post.label}</span>
                        </div>
                        {post.sections.map((section) => (
                            <section key={section.heading}>
                                <h2>{section.heading}</h2>
                                <p>{section.body}</p>
                            </section>
                        ))}
                        <aside className='detail-takeaway'>
                            <span>Kern</span>
                            <p>{post.takeaway}</p>
                        </aside>
                    </article>
                    <aside className='detail-sidebar'>
                        <RelatedBlogs blogs={related} />
                    </aside>
                </div>
            </section>
        </main>
    );
};

export default BlogDetailPage;
