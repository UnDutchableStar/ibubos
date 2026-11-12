import ContentEditor from '@/components/admin/ContentEditor';

type Props = { searchParams: Promise<{ error?: string }> };

const NewBlogPage = async ({ searchParams }: Props) => {
    const { error } = await searchParams;

    return <ContentEditor type='blog' error={error} />;
};

export default NewBlogPage;
