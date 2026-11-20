import { Skeleton } from '@/components/ui/Skeleton';

type Props = {
  /**
   * The width of the first line of the title, as a percentage: the title is two lines
   */
  titleWidth: string;
};

/**
 * What the opening band of a page looks like while it loads: the eyebrow, a two-line title and two
 * lines of lead
 */
const PageHeroSkeleton = ({ titleWidth }: Props) => (
  <div className="grid max-w-[720px] gap-4 pt-14 pb-10">
    <Skeleton className="h-3 w-[120px] max-w-full rounded-md" />
    <Skeleton className="h-11 max-w-full rounded-md" style={{ width: titleWidth }} />
    <Skeleton className="h-11 w-[70%] rounded-md" />
    <div className="grid gap-2.5">
      <Skeleton className="h-3.5 w-full rounded-md" />
      <Skeleton className="h-3.5 w-[60%] rounded-md" />
    </div>
  </div>
);

export default PageHeroSkeleton;
