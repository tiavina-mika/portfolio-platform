import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'react-i18next';
import { FiCopy } from 'react-icons/fi';

import { PAGE_HEAD_PRETITLE_CONTROL_GAP } from '@/constants/_core/ui/page.constants';
import { ICON_BUTTON_SMALL_ICON_SIZE } from '@/constants/_core/ui/ui.constants';

const classes = {
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${PAGE_HEAD_PRETITLE_CONTROL_GAP}px`,
  },
};

type Props = {
  reference: string;
  onCopy: () => void;
};

/**
 * The label above a payment's heading, carrying its reference — the one thing an operator quotes to
 * a mobile money operator or to support, so it is copied from where it is read rather than from a
 * menu.
 */
const PaymentReferencePretitle = ({ reference, onCopy }: Props) => {
  const { t } = useTranslation(['user']);

  return (
    <Box component="span" css={classes.root}>
      {t('user:payments.payment')}
      {' · '}
      {reference}
      <Tooltip title={t('user:payments.copyReference')}>
        <IconButton aria-label={t('user:payments.copyReference')} onClick={onCopy} size="small">
          <FiCopy size={ICON_BUTTON_SMALL_ICON_SIZE} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default PaymentReferencePretitle;
