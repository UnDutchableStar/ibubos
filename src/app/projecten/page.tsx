import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';

import ContentImage from '@/components/content/ContentImage';
import ProjectCard from '@/components/content/ProjectCard';
import { getPaginatedItems } from '@/lib/content';
import { getFeaturedProject, listPublishedProjects } from '@/lib/content/repository';

export const metadata: Metadata = {
    title: 'Projecten | Ibu Bos',
    description: 'Projecten en praktijkvoorbeelden van Ibu Bos rond co-creatie, veerkracht en lokale waarde.'
};

type ProjectenPageProps = {
    searchParams: Promise<{ page?: string }>;
};

const ProjectenPage = async ({ searchParams }: ProjectenPageProps) => {
    const { page } = await searchParams;
    const [featuredProject, projects] = await Promise.all([getFeaturedProject(), listPublishedProjects()]);
    const requestedPage = Number.parseInt(page ?? '1', 10);
    const { items, currentPage, totalPages } = getPaginatedItems(projects, requestedPage, 3);

return (
        <main className='archive-page font-brand text-[#15583B]'>
            <section className='page-hero'>
                <Image
                    src='/images/projectenhero.webp'
                    alt=''
                    fill
                    priority
                    sizes='100vw'
                    className='page-hero__image object-cover'
                />
                <div className='hero-reveal page-hero__content mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10'>
                    <p className='page-hero__kicker'>Ibu Bos</p>
                    <h1>Projecten & praktijk</h1>
                    <p className='page-hero__intro'>
                        Praktijkvoorbeelden van co-creatie, veerkracht en lokale waarde in de stad.
                    </p>
                </div>
            </section>

            <section className='archive-hero archive-hero--projects bg-[#FDF5E2] px-5 py-12 sm:px-8 sm:py-16 lg:px-10'>
                <div className='archive-hero__grid archive-hero__grid--reverse mx-auto max-w-7xl'>
                    <Link href={`/projecten/${featuredProject.slug}`} className='archive-feature'>
                        <ContentImage
                            src={featuredProject.image}
                            alt={featuredProject.title}
                            width={2500}
                            height={1667}
                            sizes='(max-width: 1024px) 100vw, 52vw'
                            className='archive-feature__image'
                            priority
                        />
                        <span className='archive-feature__caption'>
                            <span>{featuredProject.label}</span>
                            <strong>{featuredProject.title}</strong>
                            <em>Bekijk project</em>
                        </span>
                    </Link>
                    <div className='archive-hero__copy'>
                            <div className='archive-hero__eyebrow'>
                                <p className='section-kicker'>Uitgelicht</p>
                        </div>
                        <h2>{featuredProject.title}</h2>
                        <p className='archive-hero__intro'>
                            {featuredProject.description}
                        </p>
                        <Link href={`/projecten/${featuredProject.slug}`} className='archive-hero__link'>
                            Bekijk het volledige project
                            <ArrowUpRight aria-hidden />
                        </Link>
                    </div>
                </div>
            </section>

            <section className='bg-[#15583B] px-5 pb-14 pt-12 text-[#FDF5E2] sm:px-8 sm:pb-24 sm:pt-16 lg:px-10'>
                <div className='mx-auto grid max-w-7xl gap-5 lg:grid-cols-2 xl:grid-cols-3'>
                    {items.map((project) => (
                        <ProjectCard key={project.slug} project={project} />
                    ))}
                </div>
                <nav className='pagination mx-auto max-w-7xl' aria-label='Projectpagina’s'>
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                        <Link
                            key={pageNumber}
                            href={pageNumber === 1 ? '/projecten' : `/projecten?page=${pageNumber}`}
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

export default ProjectenPage;
