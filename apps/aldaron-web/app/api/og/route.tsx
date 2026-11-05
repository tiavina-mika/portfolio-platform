import fs from 'fs';
import { join } from 'path';

import { ImageResponse } from 'next/og';

import OgCard from '@/containers/og/OgCard';
import { OG_IMAGE_SIZE } from '@/utils/constants';
import { parseOgCardSearchParams } from '@/utils/og.utils';

const publicCwd = join(process.cwd(), 'public');

const loadFile = (relPath: string): Buffer => fs.readFileSync(join(publicCwd, relPath));

// read once per server process: the same files serve every card
const fonts = [
  { name: 'Basier', data: loadFile('fonts/BasierCircle/BasierCircle-Regular.ttf'), weight: 400 as const },
  { name: 'Basier', data: loadFile('fonts/BasierCircle/BasierCircle-SemiBold.ttf'), weight: 600 as const },
  { name: 'Basier', data: loadFile('fonts/BasierCircle/BasierCircle-Bold.ttf'), weight: 700 as const },
].map((font) => ({ ...font, style: 'normal' as const }));

/**
 * The share card of a page, as a PNG. A route rather than `opengraph-image.tsx` files: the pages
 * have translated paths, which the file convention does not follow, and one route serves every
 * page and every language. The page passes the texts already translated (see `getSocialImages`);
 * the route only cuts them to what fits and never fetches anything, so it cannot be turned into a
 * proxy.
 */
export const GET = (request: Request) => {
  const { searchParams } = new URL(request.url);
  const card = parseOgCardSearchParams(searchParams);

  return new ImageResponse(<OgCard {...card} />, { ...OG_IMAGE_SIZE, fonts });
};
