import { OgCard as OgCardContent, OgCardLayoutEnum } from '@/types/og.type';
import {
  LOGO, OG_CARD_COLORS, OG_CARD_RULE_SPACING, OG_IMAGE_SIZE,
} from '@/utils/constants';
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

const LOGO_HEIGHT = 48;
const LOGO_WIDTH = (LOGO_HEIGHT * 133) / 32;

const Brand = () => (
  <svg height={LOGO_HEIGHT} viewBox={LOGO.viewBox.horizontal} width={LOGO_WIDTH}>
    <path d={LOGO.leftBracket} fill={OG_CARD_COLORS.text} />
    <rect {...LOGO.center} fill={OG_CARD_COLORS.text} />
    <path d={LOGO.rightBracket} fill={OG_CARD_COLORS.brand} />
    <path d={LOGO.wordmark} fill={OG_CARD_COLORS.text} transform={LOGO.wordmarkTransform} />
  </svg>
);

/**
 * The share card a link preview shows (1200×630), rendered to PNG by the OG image route.
 * Written for the image renderer: flex layout and inline styles only, fonts named as the route
 * registers them. The thin vertical rules and the orange base are the only decoration the brand allows
 * on its visuals. Every text stays inside the central 630px square, so a square crop (WhatsApp
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
  const rulesCount = Math.floor(OG_IMAGE_SIZE.width / OG_CARD_RULE_SPACING);

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
        fontFamily: 'Instrument Sans',
        position: 'relative',
      }}
    >
      {Array.from({ length: rulesCount }, (_, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: (index + 1) * OG_CARD_RULE_SPACING,
            width: 1,
            backgroundColor: OG_CARD_COLORS.rule,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 12,
          backgroundColor: OG_CARD_COLORS.brand,
        }}
      />
      {isCentered
        ? <Brand />
        : (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',
          }}
          >
            {chip ? <Chip label={chip} /> : <span />}
            <Brand />
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
              fontFamily: 'Bricolage Grotesque',
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
