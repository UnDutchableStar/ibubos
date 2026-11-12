import Link from 'next/link';

import type { BlogPost } from '@/lib/content';

import ContentImage from './ContentImage';

type BlogCardProps = {
    post: BlogPost;
};

const BlogCard = ({ post }: BlogCardProps) => (
    <Link href={`/blogs/${post.slug}`} className='blog-card'>
        <ContentImage
            src={post.image}
            alt={post.title}
            width={2500}
            height={1667}
            sizes='(max-width: 768px) 100vw, 30vw'
            className='blog-card__image'
        />
        <div className='blog-card__body'>
            <div className='blog-card__meta'>
                <span>{post.label}</span>
            </div>
            <h2>{post.title}</h2>
            <p>{post.description}</p>
            <strong>Lees verder</strong>
        </div>
    </Link>
);

export default BlogCard;
