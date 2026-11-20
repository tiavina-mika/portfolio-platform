import Section from '@/components/layouts/Section';
import { Skeleton } from '@/components/ui/Skeleton';

const SECTION_COUNT = 5;

type Props = {
  /**
   * What a screen reader says while the text loads
   */
  label: string;
};

const TextLines = ({ count, lastWidth }: { count: number; lastWidth: string }) => (
  <div className="grid gap-2.5">
    {Array.from({ length: count }, (_, index) => (
      <Skeleton
        className="h-3.5 max-w-full"
        key={index}
        style={{ width: index === count - 1 ? lastWidth : '100%' }}
      />
    ))}
  </div>
);

/**
 * The shape of a legal text while it loads: the head of the page, then five sections of a title and three
 * lines each
 */
const LegalSkeleton = ({ label }: Props) => (
  <div
    aria-busy="true"
    aria-label={label}
    className="flex flex-col self-stretch"
    role="status"
  >
    <Section className={`
      pt-10 pb-5
      md:pt-14 md:pb-10
    `}
    >
      <div className="grid w-full max-w-[720px] gap-4">
        <Skeleton className="h-3 w-30" />
        <Skeleton className="h-11 w-[55%]" />
        <Skeleton className="h-11 w-[70%]" />
        <TextLines count={2} lastWidth="60%" />
      </div>
    </Section>
    <Section className={`
      pb-10
      md:pb-12
    `}
    >
      <div className="w-full max-w-[72ch]">
        {Array.from({ length: SECTION_COUNT }, (_, index) => (
          <div className="grid gap-3 border-t border-border py-8" key={index}>
            <Skeleton className="h-[22px] w-[35%]" />
            <TextLines count={3} lastWidth="70%" />
          </div>
        ))}
      </div>
    </Section>
  </div>
);

export default LegalSkeleton;
