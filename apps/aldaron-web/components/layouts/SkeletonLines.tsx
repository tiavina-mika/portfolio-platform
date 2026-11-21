import { Skeleton } from '@/components/ui/Skeleton';

type Props = {
  count: number;
  /**
   * The width of the last line, as a percentage: it is shorter, like the end of a paragraph
   */
  lastWidth: string;
};

/**
 * Lines of text while they load
 */
const SkeletonLines = ({ count, lastWidth }: Props) => (
  <div className="grid gap-2.5">
    {Array.from({ length: count }, (_, index) => (
      <Skeleton
        className="h-3.5 max-w-full rounded-md"
        key={index}
        style={{ width: index === count - 1 ? lastWidth : '100%' }}
      />
    ))}
  </div>
);

export default SkeletonLines;
