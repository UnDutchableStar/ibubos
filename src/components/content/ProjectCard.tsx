import Link from 'next/link';

import type { Project } from '@/lib/content';

import ContentImage from './ContentImage';

type ProjectCardProps = {
    project: Project;
};

const ProjectCard = ({ project }: ProjectCardProps) => (
    <Link href={`/projecten/${project.slug}`} className='project-card'>
        <ContentImage
            src={project.image}
            alt={project.title}
            width={2500}
            height={1667}
            sizes='(max-width: 1024px) 100vw, 44vw'
            className='project-card__image'
        />
        <div>
            <p className='section-kicker'>{project.label}</p>
            <h2>{project.title}</h2>
            <p>{project.description}</p>
            <strong>Bekijk project</strong>
        </div>
    </Link>
);

export default ProjectCard;
