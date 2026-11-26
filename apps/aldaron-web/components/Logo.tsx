import { cn } from '@/utils/app.utils';
import { APP_NAME, LOGO } from '@/utils/constants';

type Props = {
  /**
   * `horizontal` is the default logo (at least 96px wide), `symbol` the mark alone (at least 16px)
   * @default horizontal
   */
  variant?: 'horizontal' | 'symbol';
  className?: string;
};

/**
 * The logo drawn inline with the theme tokens, so it follows the light and dark modes on its own. The
 * orange bar always takes the brand color: it is never recolored.
 */
const Logo = ({ variant = 'horizontal', className }: Props) => (
  <svg
    aria-label={APP_NAME}
    className={cn('h-8 w-auto', className)}
    role="img"
    viewBox={LOGO.viewBox[variant]}
    xmlns="http://www.w3.org/2000/svg"
  >
    {LOGO.bars[variant].map((bar, index) => (
      <rect
        className={index === LOGO.bars[variant].length - 1 ? 'fill-brand' : 'fill-foreground'}
        key={bar.x}
        {...bar}
      />
    ))}
    {variant === 'horizontal' && (
      <path
        className="fill-foreground"
        d={LOGO.wordmark}
        transform={LOGO.wordmarkTransform}
      />
    )}
  </svg>
);

export default Logo;
