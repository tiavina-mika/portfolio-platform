import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheckSquare } from 'react-icons/fi';

import Dialog from '@/components/Dialog';
import { ICON_BUTTON_SMALL_ICON_SIZE } from '@/constants/_core/ui/ui.constants';
import { useToggle } from '@/hooks/_core/useToggle';

type Props = {
  onConfirm: () => void;
  disabled?: boolean;
};

/**
 * Clears a whole list's queue at once — the "mark all as read" every notification centre offers,
 * and what an operator otherwise had to do by ticking rows a page at a time.
 *
 * It asks before acting: `seen` is shared by the whole team, so this empties the queue for
 * everyone, not just for the person clicking. That is exactly what makes it worth having and
 * exactly what makes an accidental click expensive.
 */
const MarkAllAsSeenButton = ({ onConfirm, disabled = false }: Props) => {
  const { t } = useTranslation();
  const { open, toggle } = useToggle();

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
    toggle();
  };

  const handleConfirm = (): void => {
    onConfirm();
    toggle();
  };

  return (
    <>
      <Tooltip title={t('markAllAsSeen')}>
        {/* a disabled button hosts no tooltip of its own, so the span carries the pointer events */}
        <span>
          <IconButton aria-label="markAllAsSeen" disabled={disabled} onClick={handleClick}>
            <FiCheckSquare size={ICON_BUTTON_SMALL_ICON_SIZE} />
          </IconButton>
        </span>
      </Tooltip>
      <Dialog
        description={t('markAllAsSeenConfirm')}
        maxWidth="xs"
        onPrimaryButtonAction={handleConfirm}
        open={open}
        title={t('markAllAsSeen')}
        toggle={toggle}
      />
    </>
  );
};

export default MarkAllAsSeenButton;
