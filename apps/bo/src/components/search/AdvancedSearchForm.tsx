import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import { alpha } from '@mui/material/styles';
import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FiChevronDown } from 'react-icons/fi';
import { MdFilterList } from 'react-icons/md';
import { ZodType } from 'zod';

import type { Theme } from '@mui/material/styles';
import type { FieldValues, Resolver } from 'react-hook-form';

import ActiveFiltersBar from '@/components/search/ActiveFiltersBar';
import ListFiltersPanel from '@/components/search/ListFiltersPanel';
import {
  FILTER_COUNT_BADGE_ACTIVE_OPACITY, FILTER_COUNT_BADGE_FONT_SIZE, FILTER_COUNT_BADGE_PADDING_X,
  FILTER_COUNT_BADGE_RADIUS, LIST_FILTERS_MENU_OFFSET, LIST_FILTERS_MENU_WIDTH,
} from '@/constants/_core/ui/list.constants';
import {
  BUTTON_ICON_GAP, ICON_BUTTON_SMALL_ICON_SIZE, RESPONSIVE_BREAKPOINT,
} from '@/constants/_core/ui/ui.constants';
import { useBreakpoint } from '@/hooks/_core/useBreakpoint';
import { useListFilters } from '@/hooks/_core/useListFilters';
import { useToggle } from '@/hooks/_core/useToggle';
import { IAdvancedSearchOption, ListFiltersVariant } from '@/types/_core/app.type';
import { getActiveFilterChips, getFilledFilterValues } from '@/utils/_core/filter.utils';
import { getTintedBackground } from '@/utils/_core/theme/tokens.utils';

const FILTER_FORM_ID = 'form-filter';

/*
 * every filter is on screen at once, so an untouched field still reaches the resolver holding ''
 * (or, for a cleared range, [null, null]). Checking those against a schema written for the values
 * a filter actually carries would reject a panel the reader typed a single word into — so only the
 * filled fields are validated, and only they are handed to the submit handler.
 */
const getFilterResolver = <T extends FieldValues,>(schema: ZodType<any, any, any>): Resolver<T> => (
  (values, context, options) => zodResolver(schema)(getFilledFilterValues(values) as T, context, options)
);

const classes = {
  /*
   * the count belongs to the word it follows — "Filtres 3" is one label, not a label wearing a
   * notification badge — so it sits inline in the button rather than pinned to its corner, and
   * inverts onto the fill the trigger takes while its panel is open
   */
  countBadge: (isPanelOpen: boolean) => (theme: Theme) => ({
    marginLeft: BUTTON_ICON_GAP,
    padding: `0 ${FILTER_COUNT_BADGE_PADDING_X}px`,
    borderRadius: FILTER_COUNT_BADGE_RADIUS,
    fontSize: FILTER_COUNT_BADGE_FONT_SIZE,
    fontWeight: theme.typography.fontWeightBold,
    color: isPanelOpen
      ? theme.palette.primary.contrastText
      : theme.palette.primary.main,
    backgroundColor: isPanelOpen
      ? alpha(theme.palette.primary.contrastText, FILTER_COUNT_BADGE_ACTIVE_OPACITY)
      : getTintedBackground(theme, theme.palette.primary.main),
  }),
  // the chevron states which way the panel will move, so it turns with it
  chevron: (isPanelOpen: boolean) => (theme: Theme) => ({
    display: 'flex',
    transform: isPanelOpen
      ? 'rotate(180deg)'
      : 'none',
    transition: theme.transitions.create('transform', { duration: 150 }),
  }),
  /*
   * the menu hangs off the trigger and sets its own width, wide enough for the two columns of
   * fields it holds — it is a grid of controls, not a list of options sized by its longest label
   */
  menu: { width: LIST_FILTERS_MENU_WIDTH, maxWidth: '100%' },
};

type Props<T> = {
  onSubmit: (values: T) => void;
  onReset?: () => void;
  schema: ZodType<any, any, any>;
  fields?: IAdvancedSearchOption[];
};

/**
 * The filter set of a list, as a trigger in the toolbar plus the frame that trigger opens and the
 * strip of chips naming what it currently applies. Which frame that is depends on the room the
 * viewport gives (see ListFiltersVariant): a menu hanging off the trigger on a wide screen, the
 * band folded under the toolbar once that menu no longer clears the card, the card covered edge to
 * edge on touch. Only the trigger renders where this component stands — the band and the drawer
 * are portaled into the slots the list owns, since a page hands its filter form to the list as one
 * node of its toolbar.
 */
const AdvancedSearchForm = <T extends FieldValues,>({
  onSubmit, onReset, schema, fields = [],
}: Props<T>) => {
  const {
    t,
  } = useTranslation();
  const listFilters = useListFilters();
  // fallback for a filter form standing outside a list card, which then has no bands to render into
  const { open: isLocalPanelOpen, toggle: toggleLocalPanel } = useToggle();
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  /*
   * only the fields actually holding a value, kept apart from the form's own values (which retain
   * whatever was typed and then cleared) — this is what the chips and the count are derived from
   */
  const [appliedValues, setAppliedValues] = useState<Record<string, any>>({});

  const resolver = useMemo(() => getFilterResolver<T>(schema), [schema]);
  const form = useForm<T>({ resolver });

  const isTouch = useBreakpoint('sm');
  const isDesktopDown = useBreakpoint(RESPONSIVE_BREAKPOINT);

  const isPanelOpen = listFilters?.isPanelOpen ?? isLocalPanelOpen;
  const togglePanel = listFilters?.togglePanel ?? toggleLocalPanel;
  const activeFilterChips = getActiveFilterChips(fields, appliedValues);

  const variant: ListFiltersVariant = isTouch
    ? 'drawer'
    : isDesktopDown
      ? 'panel'
      : 'menu';

  /*
   * the three frames open in different places — off the trigger, under the toolbar, over the whole
   * card — so a resize that swaps one for another has to close it: the reader would otherwise find
   * the fields they were filling in somewhere they never put them
   */
  const previousVariant = useRef<ListFiltersVariant>(variant);

  useEffect(() => {
    if (previousVariant.current === variant) return;
    previousVariant.current = variant;

    if (isPanelOpen) togglePanel();
  }, [variant, isPanelOpen, togglePanel]);

  // the resolver has already dropped the fields left empty, so what lands here is what is applied
  const handleSubmit = async (values: T) => {
    await onSubmit(values);
    setAppliedValues(values);
    togglePanel();
  };

  const handleReset = () => {
    onReset?.();

    /*
     * inside a list, resetting the filters resets the list — the toolbar search boxes and the page
     * the reader is on go with them, which only the list itself can clear. It remounts this form
     * on its way, which is what clears the fields and the chips below them.
     */
    if (listFilters) {
      listFilters.resetFilters();
      return;
    }

    form.reset();
    setAppliedValues({});
    onSubmit({} as T);
  };

  const handleRemoveFilter = (name: string) => {
    const updatedValues = { ...appliedValues };

    delete updatedValues[name];

    form.resetField(name as any);
    setAppliedValues(updatedValues);
    onSubmit(updatedValues as T);
  };

  const panel = (
    <FormProvider {...form}>
      <Box
        noValidate
        autoComplete="off"
        component="form"
        id={FILTER_FORM_ID}
        onSubmit={form.handleSubmit(handleSubmit)}
        // the drawer pins its head and foot around a body that scrolls, so the form owns the frame
        sx={{ height: '100%' }}
      >
        <ListFiltersPanel
          activeCount={activeFilterChips.length}
          fields={fields}
          formId={FILTER_FORM_ID}
          onClose={togglePanel}
          onReset={handleReset}
          resultCount={listFilters?.resultCount ?? 0}
          variant={variant}
        />
      </Box>
    </FormProvider>
  );

  const chipbar = (
    <ActiveFiltersBar
      chips={activeFilterChips}
      onRemove={handleRemoveFilter}
      onReset={handleReset}
    />
  );

  /*
   * the band and the drawer belong to the list card, so they go to the slots it owns; the menu
   * belongs to the trigger, so it renders where the trigger stands. Outside a list card there is
   * no slot at all — the form then drops its panel right under itself.
   */
  const renderFilters = () => {
    if (variant === 'menu') {
      return (
        <Popover
          anchorEl={triggerRef.current}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          onClose={togglePanel}
          open={isPanelOpen}
          slotProps={{ paper: { sx: classes.menu } }}
          // a negative origin is what opens the gap between the trigger and the menu it hangs from
          transformOrigin={{ vertical: -LIST_FILTERS_MENU_OFFSET, horizontal: 'left' }}
        >
          {panel}
        </Popover>
      );
    }

    if (variant === 'drawer') {
      return listFilters?.overlaySlot && isPanelOpen
        ? createPortal(panel, listFilters.overlaySlot)
        : null;
    }

    return listFilters?.panelSlot
      ? createPortal(panel, listFilters.panelSlot)
      : isPanelOpen && panel;
  };

  return (
    <>
      <Button
        aria-expanded={isPanelOpen}
        /* the class is what lets the list toolbar give the trigger its own row on a narrow screen */
        className="ListFiltersTrigger-root"
        onClick={togglePanel}
        ref={triggerRef}
        startIcon={<MdFilterList />}
        endIcon={(
          <Box component="span" css={classes.chevron(isPanelOpen)}>
            <FiChevronDown size={ICON_BUTTON_SMALL_ICON_SIZE} />
          </Box>
        )}
        variant={isPanelOpen
          ? 'contained'
          : 'outlined'}
      >
        {t('filters')}
        <Box component="span" css={classes.countBadge(isPanelOpen)}>
          {activeFilterChips.length}
        </Box>
      </Button>
      {renderFilters()}
      {listFilters?.chipsSlot
        ? createPortal(chipbar, listFilters.chipsSlot)
        : chipbar}
    </>
  );
};

export default AdvancedSearchForm;
