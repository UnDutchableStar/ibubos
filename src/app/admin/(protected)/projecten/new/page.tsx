import ContentEditor from '@/components/admin/ContentEditor';

type Props = { searchParams: Promise<{ error?: string }> };

const NewProjectPage = async ({ searchParams }: Props) => {
    const { error } = await searchParams;

    return <ContentEditor type='project' error={error} />;
};

export default NewProjectPage;
