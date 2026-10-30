import {
  Box, ButtonBase, IconButton, Paper, alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  FiCalendar, FiChevronDown, FiChevronLeft, FiChevronRight, FiX,
} from 'react-icons/fi';

import {
  FONT_SIZE_BODY, FONT_SIZE_META, INPUT_ADORNMENT_INSET, INPUT_FONT_SIZE, INPUT_HEIGHT,
  INPUT_PADDING_X, RADIUS,
} from '@/constants/_core/ui/ui.constants';
import { getInputFocusRing } from '@/utils/_core/theme/styles.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

type Props = {
  value?: (Date | null)[];
  onChange: (value: (Date | null)[]) => void;
  hasError?: boolean;
  // when only a start date is picked, close the range with today instead of leaving it open-ended
  endDefaultsToToday?: boolean;
};

const POPOVER_WIDTH = 320;
const YEARS_PER_PAGE = 12;

const sameDay = (a: Date | Dayjs | null, b: Date | Dayjs | null) => !!a && !!b && dayjs(a).isSame(dayjs(b), 'day');

const isInRangeExclusive = (d: Dayjs, start: Date | null, end: Date | null) =>
  !!start && !!end && d.isAfter(dayjs(start), 'day') && d.isBefore(dayjs(end), 'day');

const formatDMY = (d: Date | null) => (d ? dayjs(d).format('DD/MM/YYYY') : '');

const DateRangeInput = ({
  value = [null, null], onChange, hasError, endDefaultsToToday,
}: Props) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [start, end] = value;
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'days' | 'years'>('days');
  const [draft, setDraft] = useState({ start, end });
  const [view, setView] = useState(() => {
    const base = start ? dayjs(start) : dayjs();

    return { year: base.year(), month: base.month() };
  });
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const rangeBackground = alpha(theme.palette.primary.main, 0.12);
  const tokens = getDesignTokens(theme);

  const getBorderColor = () => {
    if (hasError) return theme.palette.error.main;
    if (open) return theme.palette.primary.main;

    return tokens.borderInput;
  };

  useEffect(() => {
    if (open) {
      setDraft({ start, end });
      setMode('days');
    }
  }, [open, start, end]);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (e: MouseEvent) => {
      const isInsideTrigger = triggerRef.current?.contains(e.target as Node);
      const isInsidePopover = popoverRef.current?.contains(e.target as Node);

      if (isInsideTrigger || isInsidePopover) return;

      if (endDefaultsToToday && start && !end) {
        onChange([start, dayjs().toDate()]);
      }
      setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, start, end, endDefaultsToToday, onChange]);

  const labelText = start && end
    ? sameDay(start, end)
      ? formatDMY(start)
      : `${formatDMY(start)} – ${formatDMY(end)}`
    : start
      ? formatDMY(start)
      : null;

  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const left = Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - 16);

      setPopoverPos({ top: rect.bottom + 8, left: Math.max(left, 8) });
    }
    setOpen((o) => !o);
  };

  const clear = () => {
    onChange([null, null]);
    setOpen(false);
  };

  const onPickDay = (d: Dayjs) => {
    if (!draft.start || (draft.start && draft.end)) {
      const next = { start: d.toDate(), end: null };

      setDraft(next);
      onChange([next.start, next.end]);
    } else {
      const picked = d.toDate();
      const next = d.isBefore(dayjs(draft.start), 'day')
        ? { start: picked, end: draft.start }
        : { start: draft.start, end: picked };

      setDraft(next);
      onChange([next.start, next.end]);
      setOpen(false);
    }
  };

  const navMonth = (delta: number) => {
    setView((v) => {
      const next = dayjs(new Date(v.year, v.month)).add(delta, 'month');

      return { year: next.year(), month: next.month() };
    });
  };

  const navYearsPage = (delta: number) => {
    setView((v) => ({ ...v, year: v.year + (delta * YEARS_PER_PAGE) }));
  };

  const pickYear = (year: number) => {
    setView((v) => ({ ...v, year }));
    setMode('days');
  };

  const yearsPageStart = view.year - Math.floor(YEARS_PER_PAGE / 2);
  const years = Array.from({ length: YEARS_PER_PAGE }, (_, i) => yearsPageStart + i);

  const firstOfMonth = dayjs(new Date(view.year, view.month, 1));
  const startWeekday = (firstOfMonth.day() + 6) % 7;
  const daysInMonth = firstOfMonth.daysInMonth();
  const cells: (Dayjs | null)[] = [];

  for (let i = 0; i < startWeekday; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(dayjs(new Date(view.year, view.month, d)));
  while (cells.length % 7 !== 0) cells.push(null);

  const weekdayLabels = Array.from({ length: 7 }, (_, i) => dayjs().day(i + 1).format('dd').charAt(0).toUpperCase());
  const today = dayjs().startOf('day');

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <ButtonBase
        disableRipple
        /* the class is what lets the list filter panel compress the trigger onto its control row */
        className="DateRangeInput-trigger"
        onClick={handleToggle}
        ref={triggerRef}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          width: '100%',
          height: INPUT_HEIGHT,
          // text keeps the field inset, the trailing glyphs sit at the wider icon inset
          pl: `${INPUT_PADDING_X}px`,
          pr: `${INPUT_ADORNMENT_INSET}px`,
          borderRadius: `${RADIUS}px`,
          bgcolor: 'background.paper',
          justifyContent: 'flex-start',
          border: `1px solid ${getBorderColor()}`,
          // the trigger is a field, so it opens with the same primary outline + halo as one
          boxShadow: open && !hasError ? getInputFocusRing(theme) : 'none',
          transition: theme.transitions.create(['border-color', 'box-shadow'], { duration: 150 }),
          '&:hover': { borderColor: hasError ? theme.palette.error.main : tokens.textMuted },
        }}
      >
        <Box
          sx={{
            flex: 1,
            fontSize: INPUT_FONT_SIZE,
            color: labelText ? 'text.primary' : 'text.secondary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textAlign: 'left',
          }}
        >
          {labelText || t('search')}
        </Box>
        {labelText && (
          <Box
            component="span"
            onClick={(e) => {
              e.stopPropagation(); clear();
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary',
              cursor: 'pointer',
              '&:hover': { color: 'text.primary' },
            }}
          >
            <FiX size={16} />
          </Box>
        )}
        <FiCalendar color={open ? theme.palette.primary.main : theme.palette.text.secondary} size={18} />
      </ButtonBase>

      {open && createPortal(
        <Paper
          elevation={8}
          ref={popoverRef}
          sx={{
            position: 'fixed',
            top: popoverPos.top,
            left: popoverPos.left,
            zIndex: 1300,
            width: { xs: `min(92vw, ${POPOVER_WIDTH}px)`, sm: POPOVER_WIDTH },
            borderRadius: 0.5,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: '8px 16px 8px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, px: 1 }}>
              <ButtonBase
                disableRipple
                onClick={() => setMode((m) => (m === 'days' ? 'years' : 'days'))}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: FONT_SIZE_BODY,
                  fontWeight: 500,
                  color: 'text.primary',
                }}
              >
                {mode === 'days' ? `${firstOfMonth.format('MMMM')} ${view.year}` : `${years[0]} – ${years[years.length - 1]}`}
                <FiChevronDown
                  color={theme.palette.text.secondary}
                  style={{ transform: mode === 'years' ? 'rotate(180deg)' : undefined, transition: 'transform 120ms' }}
                />
              </ButtonBase>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={() => (mode === 'days' ? navMonth(-1) : navYearsPage(-1))} size="small">
                  <FiChevronLeft color={theme.palette.text.secondary} size={20} />
                </IconButton>
                <IconButton onClick={() => (mode === 'days' ? navMonth(1) : navYearsPage(1))} size="small">
                  <FiChevronRight color={theme.palette.text.secondary} size={20} />
                </IconButton>
              </Box>
            </Box>

            {mode === 'years' ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, pb: 1 }}>
                {years.map((y) => {
                  const isSelectedYear = y === view.year;

                  return (
                    <ButtonBase
                      disableRipple
                      key={y}
                      onClick={() => pickYear(y)}
                      sx={{
                        py: 1,
                        borderRadius: 1,
                        fontSize: FONT_SIZE_META,
                        color: isSelectedYear ? theme.palette.primary.contrastText : 'text.primary',
                        bgcolor: isSelectedYear ? 'primary.main' : 'transparent',
                        fontWeight: isSelectedYear ? 600 : 400,
                        '&:hover': { bgcolor: isSelectedYear ? 'primary.main' : 'action.hover' },
                      }}
                    >
                      {y}
                    </ButtonBase>
                  );
                })}
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 1 }}>
                  {weekdayLabels.map((w, i) => (
                    <Box
                      key={i}
                      sx={{ textAlign: 'center', fontSize: FONT_SIZE_META, color: 'text.secondary', py: 1 }}
                    >
                      {w}
                    </Box>
                  ))}
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                  {cells.map((d, i) => {
                    if (!d) return <Box key={i} sx={{ aspectRatio: '1', opacity: 0 }} />;

                    const isStart = sameDay(d.toDate(), draft.start);
                    const isEnd = sameDay(d.toDate(), draft.end);
                    const isSelected = isStart || isEnd;
                    const isToday = d.isSame(today, 'day');
                    const isInRange = isInRangeExclusive(d, draft.start, draft.end);
                    const isRangeStart = isStart && !!draft.end;
                    const isRangeEnd = isEnd && !!draft.start;
                    const isStripVisible = isInRange || isRangeStart || isRangeEnd;

                    return (
                      <Box
                        key={i}
                        onClick={() => onPickDay(d)}
                        sx={{
                          aspectRatio: '1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          cursor: 'pointer',
                          '&::before': {

                            content: '""',
                            position: 'absolute',
                            top: '8px',
                            bottom: '8px',
                            left: isRangeStart ? '50%' : 0,
                            right: isRangeEnd ? '50%' : 0,
                            background: isStripVisible ? rangeBackground : 'transparent',
                            zIndex: 1,
                          },
                          '&:hover > div': {
                            bgcolor: isSelected ? 'primary.main' : 'action.hover',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2,
                            position: 'relative',
                            fontSize: FONT_SIZE_META,
                            color: isSelected ? theme.palette.primary.contrastText : 'text.primary',
                            bgcolor: isSelected ? 'primary.main' : 'transparent',
                            fontWeight: isSelected ? 500 : 400,
                            border: isToday && !isSelected ? `1px solid ${alpha(theme.palette.text.primary, 0.3)}` : 'none',
                            transition: 'background 120ms',
                          }}
                        >
                          {d.date()}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </>
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 1, pb: 2 }}>
            <ButtonBase
              onClick={clear}
              sx={{
                fontSize: FONT_SIZE_BODY,
                fontWeight: 500,
                color: 'primary.main',
                px: 2,
                py: 1,
                borderRadius: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                '&:hover': { bgcolor: rangeBackground },
              }}
            >
              {t('reset')}
            </ButtonBase>
          </Box>
        </Paper>,
        document.body
      )}
    </Box>
  );
};

export default DateRangeInput;
