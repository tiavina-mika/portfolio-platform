'use client';

import { useTranslations } from 'next-intl';

import HamburgerMenuSvgMobile from './HamburgerMenuSvgMobile';

type Props = {
  open: boolean;
  onClick: () => void;
  /** id of the menu this button opens */
  'aria-controls'?: string;
};

/**
 * The burger button of the mobile bar. Its name follows the state ("Menu" / "Close menu").
 */
const AnimatedHamburgerMenu = ({ open, onClick, 'aria-controls': ariaControls }: Props) => {
  const t = useTranslations('NavBar');

  return (
    <button
      aria-controls={ariaControls}
      aria-expanded={open}
      aria-label={open ? t('closeMenu') : t('menu')}
      className="flex flex-col items-center justify-center self-stretch"
      onClick={onClick}
      type="button"
    >
      <HamburgerMenuSvgMobile open={open} />
    </button>
  );
};

export default AnimatedHamburgerMenu;
