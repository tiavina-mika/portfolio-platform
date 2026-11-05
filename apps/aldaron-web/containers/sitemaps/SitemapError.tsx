import { CircleAlert } from 'lucide-react';

type Props = {
  /**
   * @example 'The sitemap could not be loaded.'
   */
  text: string;
  /**
   * Label of the button that tries to load the sitemap again
   */
  retryText: string;
  onRetry: () => void;
};

/**
 * The sitemap could not be read: an alert in the destructive tones with the way to try again
 */
const SitemapError = ({ text, retryText, onRetry }: Props) => (
  <div
    role="alert"
    className={`
      flex items-start gap-3 rounded-2xl border border-error bg-error/10 px-4 py-3.5 text-sm/snug
      text-foreground
      lg:col-span-2
    `}
  >
    <CircleAlert aria-hidden="true" className="shrink-0 text-error" size={22} />
    <div>
      {text}
      {' '}
      <button
        onClick={onRetry}
        type="button"
        className={`
          cursor-pointer rounded-sm font-semibold underline
          focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring
        `}
      >
        {retryText}
      </button>
    </div>
  </div>
);

export default SitemapError;
