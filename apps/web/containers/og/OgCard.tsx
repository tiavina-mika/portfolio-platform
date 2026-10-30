import { OgCard as OgCardContent, OgCardLayoutEnum } from '@/types/og.type';
import { APP_NAME, OG_CARD_COLORS, OG_IMAGE_SIZE } from '@/utils/constants';
import { normalizeOgCard } from '@/utils/og.utils';

type ChipProps = {
  label: string;
};

const Chip = ({ label }: ChipProps) => (
  <span
    style={{
      fontSize: 26,
      fontWeight: 600,
      backgroundColor: OG_CARD_COLORS.chipBackground,
      color: OG_CARD_COLORS.chipText,
      padding: '8px 22px',
      borderRadius: 999,
    }}
  >
    {label}
  </span>
);

/**
 * The share card a link preview shows (1200×630), rendered to PNG by the OG image route.
 * Written for the image renderer: flex layout and inline styles only, fonts named as the route
 * registers them. Every text stays inside the central 630px square, so a square crop (WhatsApp
 * thumbnail) still reads.
 *
 * CASE 1 (centered: home, contact, blog, content pages): brand on top, chip, title, subtitle.
 * CASE 2 (left: article, project): chip and brand on one row, then the title and the subtitle.
 */
const OgCard = (card: OgCardContent) => {
  const {
    layout, chip, title, subtitle,
  } = normalizeOgCard(card);
  const isCentered = layout === OgCardLayoutEnum.CENTERED;
  const titleSize = isCentered ? 68 : 72;
  const brand = (
    <span style={{ fontSize: 30, fontWeight: 700, color: OG_CARD_COLORS.text }}>
      {APP_NAME}
    </span>
  );

  return (
    <div
      style={{
        ...OG_IMAGE_SIZE,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: isCentered ? 'center' : 'flex-start',
        textAlign: isCentered ? 'center' : 'left',
        padding: '56px 72px',
        boxSizing: 'border-box',
        backgroundColor: OG_CARD_COLORS.background,
        color: OG_CARD_COLORS.text,
        fontFamily: 'Basier',
      }}
    >
      {isCentered
        ? brand
        : (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',
          }}
          >
            {chip ? <Chip label={chip} /> : <span />}
            {brand}
          </div>
        )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          alignItems: isCentered ? 'center' : 'flex-start',
          width: isCentered ? 640 : '100%',
        }}
      >
        {isCentered && chip && <Chip label={chip} />}

        {title && (
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -0.03 * titleSize,
              textWrap: 'balance',
              maxWidth: isCentered ? 640 : 980,
            }}
          >
            {title}
          </div>
        )}

        {subtitle && (
          <div
            style={{
              fontSize: 30,
              fontWeight: 400,
              lineHeight: 1.4,
              textWrap: 'balance',
              color: OG_CARD_COLORS.subtitle,
              maxWidth: isCentered ? 640 : 900,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      <span />
    </div>
  );
};

export default OgCard;
