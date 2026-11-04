import { Box } from '@mui/material';

import type { Theme } from '@mui/material/styles';

import {
  FONT_FAMILY_MONO, IMAGE_PLACEHOLDER_FONT_SIZE, IMAGE_PLACEHOLDER_HATCH_SIZE, RADIUS,
} from '@/constants/_core/ui.constants';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  frame: (height: number, bordered: boolean) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height,
      overflow: 'hidden',
      ...(bordered && {
        border: `1px solid ${tokens.border}`,
        borderRadius: RADIUS,
      }),
    };
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  /*
   * the hatching is what says "no picture here yet" without an icon or a sentence: a flat grey box
   * reads as a picture that failed to load, where a ruled ground reads as a slot waiting for one
   */
  placeholder: (theme: Theme) => {
    const tokens = getDesignTokens(theme);
    const hatch = IMAGE_PLACEHOLDER_HATCH_SIZE;

    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      padding: `0 ${hatch}px`,
      textAlign: 'center' as const,
      fontFamily: FONT_FAMILY_MONO,
      fontSize: IMAGE_PLACEHOLDER_FONT_SIZE,
      color: tokens.textMuted,
      background: 'repeating-linear-gradient(135deg, ' +
        `${tokens.surfaceSecondary} 0 ${hatch}px, ${tokens.bodyBg} ${hatch}px ${hatch * 2}px)`,
    };
  },
};

type Props = {
  /** the picture to draw, when one has been uploaded */
  src?: string;
  /**
   * what the slot is for, printed on the hatched ground while it is empty — name it the way the
   * field is named and give the size it expects, ex `bannerImage · 1920×480`
   */
  placeholder: string;
  height: number;
  /** a frame standing on its own draws its own edge; one filling a bordered card does not */
  bordered?: boolean;
  className?: string;
};

/**
 * One picture at a fixed height, or the hatched slot waiting for it. Used by every mock-up that
 * has to show what an image field will look like once it is filled — the social card, the banner
 * of the rendered page, the thumbnails of its gallery.
 */
const ImageFrame = ({
  src, placeholder, height, bordered = false, className,
}: Props) => (
  <div className={className} css={classes.frame(height, bordered)}>
    {src
      ? (
        <Box
          alt=""
          component="img"
          css={classes.image}
          src={src}
        />
      )
      : <span css={classes.placeholder}>{placeholder}</span>}
  </div>
);

export default ImageFrame;
