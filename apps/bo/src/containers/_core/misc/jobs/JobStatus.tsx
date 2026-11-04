import { cx } from '@emotion/css';
import {
  Chip, LinearProgress, Stack, Table, TableBody, TableCell, TableRow, Theme, Typography, useTheme,
} from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { IJobStatusAttributes } from '@/types/_core/utils.type';

const classes = {
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
};

const transformIsoStrToDate = (dateStr: string) => {
  if (typeof dateStr === 'string') {
    return new Date(dateStr);
  }

  return dateStr;
};

const formatToDateTime = (date: string) => {
  return dayjs(transformIsoStrToDate(date)).format('DD/MM/YYYY - HH:mm:ss');
};

interface IDurationInput {
  startDate: string;
  endDate: string;
  responseType?: 'value' | 'text';
}
const getDuration = <T extends 'value' | 'text', R = T extends 'text' ? string : number>({
  startDate, endDate, responseType = 'value',
}: IDurationInput): R => {
  let duration;
  const start = transformIsoStrToDate(startDate);
  const end = transformIsoStrToDate(endDate);

  duration = dayjs(end).diff(start, 'seconds');
  if (responseType === 'value') return duration as R;

  if (duration < 1) {
    // less than 1s
    duration = dayjs(end).diff(start, 'milliseconds');
    return `${duration}ms` as R;
  }

  if (duration > 60) {
    // more than 1mn
    let minutes = +duration / 60;
    const seconds = duration % 60;

    if (minutes > 60) {
      // more than 1h
      const hours = +minutes / 60;

      minutes %= 60;
      return `${hours}h ${minutes}mn ${seconds}s` as R;
    }
    return `${minutes}mn ${seconds}s` as R;
  }

  return `${duration}s` as R;
};

const getDurationColor = (seconds: number, theme: Theme) => {
  // less than 1mn
  if (seconds < 60) {
    return theme.palette.success.main;
  }

  // 1mn to 15mn
  if (seconds >= 60 && seconds <= (15 * 60)) {
    return theme.palette.warning.main;
  }
  // more than 1h
  if (seconds > 3600) {
    return theme.palette.error.main;
  }

  return theme.palette.info.main;
};

type Props = {
  jobStatus: IJobStatusAttributes;
  className?: string;
};
const JobStatus = ({
  jobStatus, className,
}: Props) => {
  const theme = useTheme();
  const {
    t,
  } = useTranslation();

  if (!jobStatus) return null;
  const {
    name, status, startDate, endDate, message, count, success, error,
  } = jobStatus;

  const seconds = getDuration<'value'>({ startDate, endDate });
  const durationTxt = getDuration<'text'>({ startDate, endDate, responseType: 'text' });

  return (
    <div className={cx('flexColumn', className)}>
      <Stack
        direction="row"
        spacing={3}
        sx={{
          alignItems: 'center',
        }}
      >
        <Typography variant="h5">{name}</Typography>
        { }
        <Chip
          label={status}
          color={status === 'succeeded'
            ? 'success'
            : status === 'running'
              ? 'warning'
              : 'error'}
        />
      </Stack>
      <Table css={{ marginTop: 12 }}>
        <TableBody>
          <TableRow>
            <TableCell component="th" scope="row">{t('startDate')}</TableCell>
            <TableCell>{formatToDateTime(startDate)}</TableCell>
          </TableRow>
          {endDate && (
            <TableRow>
              <TableCell>{t('endDate')}</TableCell>
              <TableCell>{endDate && formatToDateTime(endDate)}</TableCell>
            </TableRow>
          )}
          {durationTxt && (
            <TableRow>
              <TableCell>{t('duration')}</TableCell>
              <TableCell>
                <Typography css={{ fontStyle: 'italic', color: getDurationColor(seconds, theme) }}>
                  {durationTxt}
                </Typography>
              </TableCell>
            </TableRow>
          )}
          {message && (
            <TableRow>
              <TableCell>{t('message')}</TableCell>
              <TableCell>{ message }</TableCell>
            </TableRow>
          )}
          {success != null && (
            <TableRow>
              <TableCell>{t('success')} &nbsp; ({success} / {count})</TableCell>
              <TableCell css={(theme: Theme) => ({ color: theme.palette.success.main })}>
                <LinearProgress
                  css={classes.progressBar}
                  value={(success * 100) / count}
                  variant="determinate"
                />
              </TableCell>
            </TableRow>
          )}
          {error != null && (
            <TableRow>
              <TableCell>{t('error')} &nbsp; ({error} / {count})</TableCell>
              <TableCell css={(theme: Theme) => ({ color: theme.palette.error.main })}>
                <LinearProgress
                  color="error"
                  css={classes.progressBar}
                  value={(error * 100) / count}
                  variant="determinate"
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default JobStatus;
