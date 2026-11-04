import Section from '@/components/layouts/Section';
import { Skeleton } from '@/components/ui/Skeleton';

const UnsubscribeNewsletterSkeleton = () => {
  return (
    <Section className="flex-col gap-10 py-8">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-[70%]" />
        <Skeleton className="h-6 w-[85%]" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-12 w-32" />
      </div>
    </Section>
  );
};

export default UnsubscribeNewsletterSkeleton;
