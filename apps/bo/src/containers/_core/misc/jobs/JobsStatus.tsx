import { Alert, Stack, type Theme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import Loading from '@/components/Loading';
import JobStatus from '@/containers/_core/misc/jobs/JobStatus';
import { fetchJobStatus } from '@/services/_core/app.service';
import { IJobStatusAttributes } from '@/types/_core/utils.type';


const classes = {
  job: (theme: Theme) => ({
    width: '100%',
    [theme.breakpoints.up('sm')]: {},
  }),
};

const JobsStatus = () => {
  const [status, setStatus] = useState<IJobStatusAttributes[]>([]);

  const {
    t,
  } = useTranslation();

  useEffect(() => {
    // pool the job status every 2 seconds
    const intervalId = setInterval(async () => {
      const response = await fetchJobStatus();

      setStatus(response);
    }, 2000);

    return () => {
      clearInterval(intervalId);
      setStatus([]);
    };
  }, []);

  return (
    <>
      <Head title={t('misc.jobsStatus')} />
      <Loading loading={!status.length} />
      <Layout
        isCard={false}
        title={t('misc.jobsPageTitle', { hour: 12 })}
      >
        <Alert css={classes.job} severity="warning" variant="filled">
          {t('misc.jobsPageWarningMessage')}
        </Alert>
        {status.length > 0 && (
          <Layout css={{ marginTop: 24 }}>
            <div className="flexColumn stretchSelf center" css={{ gap: 50 }}>
              <Stack
                className="stretchSelf"
                spacing={8}
                sx={{
                  alignItems: 'center',
                }}
              >
                {status.map((jobStatus: IJobStatusAttributes) => (
                  <JobStatus
                    css={classes.job}
                    jobStatus={jobStatus}
                    key={jobStatus.objectId}
                  />
                ))}
              </Stack>
            </div>
          </Layout>
        )}
      </Layout>
    </>
  );
};

export default JobsStatus;
