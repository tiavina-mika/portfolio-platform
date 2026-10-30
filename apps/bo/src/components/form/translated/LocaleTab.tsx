import {
  lighten, Stack, Theme, Tooltip, Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FaThumbtack } from 'react-icons/fa';

import { DEFAULT_LOCALE } from '@/constants/_core/app.constants';
import {
  TRANSLATION_TAB_CODE_FONT_SIZE, TRANSLATION_TAB_DOT_SIZE, TRANSLATION_TAB_LABEL_GAP,
  TRANSLATION_TAB_PIN_ICON_SIZE, TRANSLATION_TAB_TOOLTIP_GAP, TRANSLATION_TAB_TOOLTIP_STATE_LIGHTEN,
} from '@/constants/_core/ui/entity.constants';
import { FONT_FAMILY_MONO } from '@/constants/_core/ui/ui.constants';
import { TranslationState } from '@/types/_core/setting.type';
import { getMissingTranslationColor } from '@/utils/_core/theme/styles.utils';

const classes = {
  /*
   * the locale code is what the strip is scanned by — mono, so the codes keep one advance width
   * whatever letters they hold. It follows the tone of the tab it belongs to.
   */
  code: {
    fontFamily: FONT_FAMILY_MONO,
    fontSize: TRANSLATION_TAB_CODE_FONT_SIZE,
    fontWeight: 600,
    lineHeight: 1,
    color: 'inherit',
  },
  dot: (state: TranslationState) => (theme: Theme) => ({
    width: TRANSLATION_TAB_DOT_SIZE,
    height: TRANSLATION_TAB_DOT_SIZE,
    borderRadius: '50%',
    backgroundColor: state === 'missing'
      ? getMissingTranslationColor(theme)
      : theme.palette.primary.main,
  }),
  // the default locale is pinned: it is the one the other translations are written against
  pin: (theme: Theme) => ({
    display: 'flex',
    color: theme.palette.primary.main,
  }),
  tooltip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: TRANSLATION_TAB_TOOLTIP_GAP,
  },
  tooltipState: (state?: TranslationState) => (theme: Theme) => ({
    color: state === 'missing'
      ? theme.palette.warning.main
      : lighten(theme.palette.primary.main, TRANSLATION_TAB_TOOLTIP_STATE_LIGHTEN),
  }),
};

type Props = {
  label: string;
  locale: string;
  // left out when the caller has no values to judge the translation by — the dot is then not drawn
  state?: TranslationState;
};

const LocaleTab = ({
  label, locale, state,
}: Props) => {
  const {
    t,
  } = useTranslation();

  const isDefault = locale === DEFAULT_LOCALE;
  const stateLabel = [
    isDefault && t('translationState.default'),
    state && t(`translationState.${state}`),
  ].filter(Boolean).join(' · ');

  const tooltip = (
    <span css={classes.tooltip}>
      {label}
      {stateLabel && <span css={classes.tooltipState(state)}>{stateLabel}</span>}
    </span>
  );

  return (
    // the name is only spelled out here: the strip itself carries the codes, which fit a phone too
    <Tooltip disableTouchListener title={tooltip}>
      <Stack
        component="span"
        direction="row"
        sx={{
          alignItems: 'center',
          gap: `${TRANSLATION_TAB_LABEL_GAP}px`,
          /*
           * the theme lets every Stack wrap; a tab label must not — on a phone the three slots
           * share the width, and the pin would drop under the code instead of standing beside it
           */
          flexWrap: 'nowrap',
        }}
      >
        <Typography component="span" css={classes.code}>
          {locale.toUpperCase()}
        </Typography>
        {state && <span css={classes.dot(state)} />}
        {isDefault && (
          <span css={classes.pin}>
            <FaThumbtack size={TRANSLATION_TAB_PIN_ICON_SIZE} />
          </span>
        )}
      </Stack>
    </Tooltip>
  );
};

export default LocaleTab;
