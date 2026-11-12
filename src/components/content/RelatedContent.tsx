import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import type { BlogPost, Project } from '@/lib/content';

import ContentImage from './ContentImage';

type RelatedBlogsProps = {
    blogs: BlogPost[];
};

type RelatedProjectsProps = {
    projects: Project[];
};

export const RelatedBlogs = ({ blogs }: RelatedBlogsProps) => (
    <div className='related-content'>
        <div className='related-heading'>
            <p className='section-kicker'>Verder ontdekken</p>
            <h2>Gerelateerde blogs</h2>
        </div>
        <div className='related-list'>
            {blogs.map((post) => (
                <Link key={post.slug} href={`/blogs/${post.slug}`} className='related-row'>
                    <ContentImage
                        src={post.image}
                        width={320}
                        height={240}
                        sizes='96px'
                        className='related-row__image'
                    />
                    <span className='related-row__copy'>
                        <span>{post.label}</span>
                        <strong>{post.title}</strong>
                    </span>
                    <ArrowUpRight aria-hidden className='related-row__arrow' />
                </Link>
            ))}
        </div>
    </div>
);

export const RelatedProjects = ({ projects }: RelatedProjectsProps) => (
    <div className='related-content'>
        <div className='related-heading'>
            <p className='section-kicker'>Verder ontdekken</p>
            <h2>Gerelateerde projecten</h2>
        </div>
        <div className='related-list'>
            {projects.map((project) => (
                <Link key={project.slug} href={`/projecten/${project.slug}`} className='related-row'>
                    <ContentImage
                        src={project.image}
                        width={320}
                        height={240}
                        sizes='96px'
                        className='related-row__image'
                    />
                    <span className='related-row__copy'>
                        <span>{project.label}</span>
                        <strong>{project.title}</strong>
                    </span>
                    <ArrowUpRight aria-hidden className='related-row__arrow' />
                </Link>
            ))}
        </div>
    </div>
);
