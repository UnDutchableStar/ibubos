import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';

import BlogCard from '@/components/content/BlogCard';
import ContentImage from '@/components/content/ContentImage';
import { getPaginatedItems } from '@/lib/content';
import { getFeaturedBlog, listPublishedBlogs } from '@/lib/content/repository';

export const metadata: Metadata = {
    title: 'Blogs | Ibu Bos',
    description: 'Blogs en inzichten van Ibu Bos over co-creatie, veerkracht en inclusieve groei.'
};

type BlogsPageProps = {
    searchParams: Promise<{ page?: string }>;
};

const BlogsPage = async ({ searchParams }: BlogsPageProps) => {
    const { page } = await searchParams;
    const [blogPosts, featuredBlog] = await Promise.all([listPublishedBlogs(), getFeaturedBlog()]);
    const requestedPage = Number.parseInt(page ?? '1', 10);
    const { items, currentPage, totalPages } = getPaginatedItems(blogPosts, requestedPage, 3);

    return (
        <main className='archive-page font-brand text-[#15583B]'>
            <section className='page-hero'>
                <Image
                    src='/images/blogshero.webp'
                    alt=''
                    fill
                    priority
                    sizes='100vw'
                    className='page-hero__image object-cover'
                />
                <div className='hero-reveal page-hero__content mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10'>
                    <p className='page-hero__kicker'>Ibu Bos</p>
                    <h1>Blogs & inzichten</h1>
                    <p className='page-hero__intro'>
                        Verhalen en inzichten over co-creatie, veerkracht en inclusieve groei.
                    </p>
                </div>
            </section>

            <section className='archive-hero archive-hero--blogs bg-[#FDF5E2] px-5 py-12 sm:px-8 sm:py-16 lg:px-10'>
                <div className='archive-hero__grid mx-auto max-w-7xl'>
                    <div className='archive-hero__copy'>
                        <div className='archive-hero__eyebrow'>
                            <p className='section-kicker'>Uitgelicht</p>
                        </div>
                        <h2>{featuredBlog.title}</h2>
                        <p className='archive-hero__intro'>
                            {featuredBlog.description}
                        </p>
                        <Link href={`/blogs/${featuredBlog.slug}`} className='archive-hero__link'>
                            Lees het volledige verhaal
                            <ArrowUpRight aria-hidden />
                        </Link>
                    </div>
                    <Link href={`/blogs/${featuredBlog.slug}`} className='archive-feature'>
                        <ContentImage
                            src={featuredBlog.image}
                            alt={featuredBlog.title}
                            width={2500}
                            height={1667}
                            sizes='(max-width: 1024px) 100vw, 52vw'
                            className='archive-feature__image'
                            priority
                        />
                        <span className='archive-feature__caption'>
                            <span>{featuredBlog.label}</span>
                            <strong>{featuredBlog.title}</strong>
                        </span>
                    </Link>
                </div>
            </section>

            <section className='texture-section px-5 py-12 text-[#FDF5E2] sm:px-8 sm:py-20 lg:px-10'>
                <div className='mx-auto grid max-w-7xl gap-6 md:grid-cols-3'>
                    {items.map((post) => (
                        <BlogCard key={post.slug} post={post} />
                    ))}
                </div>
                <nav className='pagination mx-auto max-w-7xl' aria-label='Blogpagina’s'>
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                        <Link
                            key={pageNumber}
                            href={pageNumber === 1 ? '/blogs' : `/blogs?page=${pageNumber}`}
                            scroll={false}
                            aria-current={pageNumber === currentPage ? 'page' : undefined}
                        >
                            {pageNumber}
                        </Link>
                    ))}
                </nav>
            </section>
        </main>
    );
};

export default BlogsPage;
