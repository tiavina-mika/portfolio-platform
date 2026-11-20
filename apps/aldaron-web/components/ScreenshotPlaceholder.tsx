import { cn } from '@/utils/app.utils';

type Props = {
  /**
   * What is missing, e.g. "Product screenshot": the box is named for assistive technologies and tells
   * the reader what will take its place
   */
  label: string;
  className?: string;
};

/**
 * A striped 16:10 box standing in for a product screenshot until the real image is supplied
 */
const ScreenshotPlaceholder = ({ label, className }: Props) => (
  <div
    aria-label={label}
    role="img"
    className={cn(
      `
        grid aspect-[16/10] place-items-center rounded-md border border-border
        bg-[repeating-linear-gradient(135deg,var(--muted)_0_12px,var(--card)_12px_24px)] p-3 text-center
        font-mono text-xs leading-[1.4] font-medium text-muted-foreground
      `,
      className
    )}
  >
    <span aria-hidden>{label}</span>
  </div>
);

export default ScreenshotPlaceholder;
