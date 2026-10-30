import { Button, Chip, Link } from '@mui/material';
import { COUNTRIES, SUPPORT_PHONE_OPERATOR_LABELS } from '@shared/constants';
import { buildSupportPhoneContacts, getPhoneDialUrl } from '@shared/utils';
import { useTranslation } from 'react-i18next';
import {
  FiCreditCard, FiExternalLink, FiInfo, FiLifeBuoy,
} from 'react-icons/fi';

import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import { DEFAULT_SUPPORT_PHONES, SUPPORT_EMAIL } from '@/constants/_core/app.constants';
import {
  ABOUT_CARD_ICON_SIZE, ABOUT_MAX_WIDTH, ABOUT_WEBSITE_BUTTON_ICON_SIZE, CONTENT_GAP,
} from '@/constants/_core/ui/page.constants';
import AboutInfoCard, { type AboutInfoRow } from '@/containers/_core/about/AboutInfoCard';
import { formatDate } from '@/utils/_core/date.utils';
import { getAppEnvironment, getServerHost, getWebsiteUrl } from '@/utils/_core/utils';

const supportPhones = buildSupportPhoneContacts({
  yas: import.meta.env.VITE_SUPPORT_PHONE_YAS || DEFAULT_SUPPORT_PHONES.yas,
  airtel: import.meta.env.VITE_SUPPORT_PHONE_AIRTEL || DEFAULT_SUPPORT_PHONES.airtel,
  orange: import.meta.env.VITE_SUPPORT_PHONE_ORANGE || DEFAULT_SUPPORT_PHONES.orange,
});

const classes = {
  column: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: CONTENT_GAP,
    width: '100%',
    maxWidth: ABOUT_MAX_WIDTH,
  },
};

const About = () => {
  const {
    t, i18n,
  } = useTranslation();

  const title = t('about.title');
  // the countries the platform runs in, named in the language of the back-office
  const countryNames = new Intl.DisplayNames([i18n.language], { type: 'region' });
  const countries = Object.keys(COUNTRIES).map((code) => countryNames.of(code) ?? code).join(', ');
  const environment = getAppEnvironment();
  // production is the one environment where a mistake touches real riders, so it is flagged
  const environmentColor = environment === 'production'
    ? 'error'
    : 'default';
  const environmentLabel = t(`about.environments.${environment}`);
  const version = import.meta.env.VITE_APP_VERSION;
  const websiteUrl = getWebsiteUrl();

  const detailsRows: AboutInfoRow[] = [
    { label: t('about.name'), value: t('about.appName') },
    { label: t('about.version'), value: version, isMono: true },
    { label: t('about.updatedAt'), value: formatDate(import.meta.env.VITE_APP_BUILD_TIME) },
    {
      label: t('about.environment'),
      value: <Chip color={environmentColor} label={environmentLabel} />,
    },
    { label: t('about.server'), value: getServerHost(), isMono: true },
    { label: t('about.countries'), value: countries },
  ];

  const supportRows: AboutInfoRow[] = [
    {
      label: t('about.supportEmail'),
      value: <Link href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</Link>,
      isStacked: true,
    },
    ...supportPhones.map(({ operator, phoneNumber }) => ({
      label: t('about.supportPhone', { operator: SUPPORT_PHONE_OPERATOR_LABELS[operator] }),
      value: (
        <Link color="inherit" href={getPhoneDialUrl(phoneNumber)} underline="hover">
          {phoneNumber}
        </Link>
      ),
      isStacked: true,
    })),
  ];

  const paymentRows: AboutInfoRow[] = supportPhones.map(({ operator, phoneNumber }) => ({
    label: SUPPORT_PHONE_OPERATOR_LABELS[operator],
    value: phoneNumber,
    isMono: true,
  }));

  return (
    <Layout
      isCard={false}
      pretitle={t('about.pretitle')}
      actions={websiteUrl && (
        <Button
          component="a"
          href={websiteUrl}
          rel="noreferrer"
          startIcon={<FiExternalLink size={ABOUT_WEBSITE_BUTTON_ICON_SIZE} />}
          target="_blank"
          variant="outlined"
        >
          {t('about.website')}
        </Button>
      )}
      title={(
        <>
          {title}
          <Chip color={environmentColor} label={environmentLabel} />
          <Chip label={`v${version}`} />
        </>
      )}
    >
      <Head title={title} />
      <div css={classes.column}>
        <AboutInfoCard
          icon={<FiInfo size={ABOUT_CARD_ICON_SIZE} />}
          rows={detailsRows}
          title={t('about.details')}
        />
        <AboutInfoCard
          icon={<FiLifeBuoy size={ABOUT_CARD_ICON_SIZE} />}
          rows={supportRows}
          title={t('about.support')}
        />
        <AboutInfoCard
          icon={<FiCreditCard size={ABOUT_CARD_ICON_SIZE} />}
          rows={paymentRows}
          title={t('about.payments')}
        />
      </div>
    </Layout>
  );
};

export default About;
