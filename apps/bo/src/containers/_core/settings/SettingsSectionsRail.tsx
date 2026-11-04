import {
  Box, Card, Typography, type Theme,
} from '@mui/material';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiFileText, FiGlobe, FiImage, FiSun,
} from 'react-icons/fi';

import type { ReactElement } from 'react';

import {
  SETTINGS_RAIL_GAP, SETTINGS_RAIL_GROUP_PADDING_BOTTOM, SETTINGS_RAIL_GROUP_PADDING_TOP,
  SETTINGS_RAIL_GROUP_PADDING_X, SETTINGS_RAIL_ICON_SIZE, SETTINGS_RAIL_ITEM_GAP,
  SETTINGS_RAIL_ITEM_HEIGHT, SETTINGS_RAIL_ITEM_PADDING_X, SETTINGS_RAIL_PADDING,
} from '@/constants/_core/ui/entity.constants';
import { RADIUS } from '@/constants/_core/ui/ui.constants';
import { SettingsSection, SettingsSectionEnum } from '@/types/_core/setting.type';
import { getAccentTextColor } from '@/utils/_core/theme/styles.utils';
import { getDesignTokens, getSoftTintedBackground } from '@/utils/_core/theme/tokens.utils';

type SectionItem = {
  value: SettingsSection;
  labelKey: string;
  icon: ReactElement;
};

type SectionGroup = {
  labelKey: string;
  sections: SectionItem[];
};

/*
 * the rail names each section under the surface it acts on: the first group changes how the
 * back-office looks for the person signed in, the second edits what the public website shows
 */
const groups: SectionGroup[] = [
  {
    labelKey: 'app.backOffice',
    sections: [
      {
        value: SettingsSectionEnum.LANGUAGES,
        labelKey: 'languages',
        icon: <FiGlobe size={SETTINGS_RAIL_ICON_SIZE} />,
      },
      {
        value: SettingsSectionEnum.APPEARANCE,
        labelKey: 'appearance',
        icon: <FiSun size={SETTINGS_RAIL_ICON_SIZE} />,
      },
    ],
  },
  {
    labelKey: 'app.website',
    sections: [
      {
        value: SettingsSectionEnum.DETAILS,
        labelKey: 'details',
        icon: <FiFileText size={SETTINGS_RAIL_ICON_SIZE} />,
      },
      {
        value: SettingsSectionEnum.IMAGES,
        labelKey: 'images',
        icon: <FiImage size={SETTINGS_RAIL_ICON_SIZE} />,
      },
    ],
  },
];

const classes = {
  card: {
    padding: SETTINGS_RAIL_PADDING,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: SETTINGS_RAIL_GAP,
  },
  /*
   * a group name is the head of the block under it, so it sits closer to its own first item than to
   * the last item of the group above — that offset is what separates two groups without a rule
   */
  group: (isFirst: boolean) => ({
    paddingTop: isFirst
      ? SETTINGS_RAIL_PADDING
      : SETTINGS_RAIL_GROUP_PADDING_TOP,
    paddingBottom: SETTINGS_RAIL_GROUP_PADDING_BOTTOM,
    paddingLeft: SETTINGS_RAIL_GROUP_PADDING_X,
    paddingRight: SETTINGS_RAIL_GROUP_PADDING_X,
  }),
  item: (isOpen: boolean) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      font: 'inherit',
      display: 'flex',
      alignItems: 'center',
      gap: `${SETTINGS_RAIL_ITEM_GAP}px`,
      height: SETTINGS_RAIL_ITEM_HEIGHT,
      padding: `0 ${SETTINGS_RAIL_ITEM_PADDING_X}px`,
      border: 'none',
      borderRadius: `${RADIUS}px`,
      textAlign: 'left' as const,
      cursor: 'pointer',
      transition: theme.transitions.create(['background-color', 'color'], {
        duration: theme.transitions.duration.shortest,
      }),
      /*
       * the open section is stated by the accent — in words and in a tint under them — because the
       * rail is what the page is navigated by, unlike the tab strips elsewhere in the app that only
       * scope what a card is showing and mark their open slot by raising it onto the surface
       */
      ...(isOpen
        ? {
          fontWeight: theme.typography.fontWeightBold,
          color: getAccentTextColor(theme),
          backgroundColor: getSoftTintedBackground(theme, theme.palette.primary.main),
        }
        : {
          fontWeight: theme.typography.fontWeightRegular,
          color: tokens.textSecondary,
          backgroundColor: 'transparent',
          '&:hover': { color: tokens.text, backgroundColor: tokens.surfaceSecondary },
        }),
    };
  },
};

type Props = {
  section: SettingsSection;
  onSectionChange: (value: SettingsSection) => void;
  className?: string;
};

/**
 * The list of settings sections, grouped by the surface they act on. It is what the settings page
 * is navigated by — only the picked section is drawn beside it.
 */
const SettingsSectionsRail = ({
  section, onSectionChange, className,
}: Props) => {
  const {
    t,
  } = useTranslation();

  return (
    <Card className={className} css={classes.card}>
      {groups.map((group: SectionGroup, groupIndex: number) => (
        <Fragment key={group.labelKey}>
          <Box css={classes.group(groupIndex === 0)}>
            <Typography variant="overline">{t(group.labelKey)}</Typography>
          </Box>
          {group.sections.map((item: SectionItem) => (
            <Box
              aria-current={item.value === section}
              component="button"
              css={classes.item(item.value === section)}
              key={item.value}
              onClick={() => onSectionChange(item.value)}
              type="button"
            >
              {item.icon}
              <span>{t(item.labelKey)}</span>
            </Box>
          ))}
        </Fragment>
      ))}
    </Card>
  );
};

export default SettingsSectionsRail;
