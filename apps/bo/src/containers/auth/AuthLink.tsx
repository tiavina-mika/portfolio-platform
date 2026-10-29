import { cx } from '@emotion/css';
import Typography from '@mui/material/Typography';
import { MouseEvent } from 'react';

import Link from '@/components/Link';
import { getLinkStyles } from '@/utils/theme.utils';

type Props = {
  url?: string;
  text: string;
  label?: string;
  onClick?: () => void;
  className?: string;
  align?: 'center' | 'left' | 'right';
};

const getRowAlignClassName = (align: Props['align']) => {
  switch (align) {
    case 'center':
      return 'justifyCenter';
    case 'right':
      return 'justifyEnd';
    case 'left':
    default:
      return 'justifyStart';
  }
};

const AuthLink = ({
  url, text, label, onClick, className, align = 'center',
}: Props) => {
  if (!onClick && !url) return null;

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    onClick?.();
  };

  return (
    <div className={cx('flexRow flex1 stretchSelf center', className, getRowAlignClassName(align))}>
      {/* text */}
      {label && (
        <Typography className="textWhite">
          {label}&nbsp;
        </Typography>
      )}

      {/* ------- button ------- */}
      {!!onClick && (
        <button className="transparentButton" type="button" onClick={handleClick}>
          <Typography css={getLinkStyles}>
            {text}
          </Typography>
        </button>
      )}

      {/* ------- link ------- */}
      {url && (
        <Link to={url}>
          {text}
        </Link>
      )}
    </div>
  );
};

export default AuthLink;
