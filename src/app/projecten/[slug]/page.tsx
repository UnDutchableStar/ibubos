import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import ContentImage from '@/components/content/ContentImage';
import { RelatedProjects } from '@/components/content/RelatedContent';
import { getPublishedProject, getRelatedPublishedProjects } from '@/lib/content/repository';

type ProjectDetailPageProps = {
    params: Promise<{ slug: string }>;
};

export const generateMetadata = async ({ params }: ProjectDetailPageProps): Promise<Metadata> => {
    const { slug } = await params;
    const project = await getPublishedProject(slug);

    if (!project) {
        return {};
    }

    return {
        title: `${project.title} | Ibu Bos`,
        description: project.description,
        openGraph: {
            type: 'article',
            title: project.title,
            description: project.description,
            images: project.image ? [project.image] : undefined
        }
    };
};

const ProjectDetailPage = async ({ params }: ProjectDetailPageProps) => {
    const { slug } = await params;
    const project = await getPublishedProject(slug);

    if (!project) {
        notFound();
    }

    const related = await getRelatedPublishedProjects(project.slug, project.tags, 2);

    return (
        <main className='detail-page font-brand text-[#15583B]'>
            <section className='detail-hero bg-[#FDF5E2] px-5 pb-12 pt-36 sm:px-8 sm:pb-20 lg:px-10'>
                <div className='hero-reveal mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.82fr_1fr] lg:items-end'>
                    <div>
                        <p className='section-kicker'>{project.label}</p>
                        <h1 className='mt-4 text-4xl font-extrabold leading-tight sm:text-7xl'>{project.title}</h1>
                        <p className='mt-5 max-w-2xl text-base leading-7 sm:text-xl sm:leading-8'>{project.intro}</p>
                    </div>
                    <ContentImage
                        src={project.image}
                        alt={project.title}
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
                    <Link href='/projecten' className='detail-back detail-back--light'>
                        Terug naar projecten
                    </Link>
                </div>
                <div className='detail-layout mx-auto mt-8 max-w-7xl'>
                    <article className='detail-article'>
                        <div className='detail-pills'>
                            {project.facts.map((fact) => (
                                <span key={fact}>{fact}</span>
                            ))}
                        </div>
                        {project.sections.map((section) => (
                            <section key={section.heading}>
                                <h2>{section.heading}</h2>
                                <p>{section.body}</p>
                            </section>
                        ))}
                        <aside className='detail-takeaway'>
                            <span>Resultaat</span>
                            <p>{project.outcome}</p>
                        </aside>
                        <Link href='mailto:maartje@ibubos.nl' className='brand-button detail-cta'>
                            Neem contact op over dit project
                        </Link>
                    </article>
                    <aside className='detail-sidebar'>
                        <RelatedProjects projects={related} />
                    </aside>
                </div>
            </section>
        </main>
    );
};

export default ProjectDetailPage;
