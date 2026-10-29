import Section from '@/components/layouts/Section';
import ArticlesSkeleton from '@/containers/articles/ArticlesSkeleton';

const ArticlesLoading = () => {
  return (
    <Section rootClassName="mt-16">
      <ArticlesSkeleton />
    </Section>
  );
};

export default ArticlesLoading;
