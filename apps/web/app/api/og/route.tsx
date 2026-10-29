import fs from 'fs';
import { join } from 'path';

import { ImageResponse } from 'next/og';

import { APP_NAME } from '@/utils/constants';

const cwd = join(process.cwd(), 'components');
const publicCwd = join(process.cwd(), 'public');

const loadFile = (relPath: string, path = cwd): Buffer => {
  return fs.readFileSync(join(path, relPath));
};

const loadDataUrl = (
  relPath: string,
  mimeType: string,
  path?: string
): string => {
  const fileData = loadFile(relPath, path);
  const base64Data = fileData.toString('base64');

  return `data:${mimeType};base64,${base64Data}`;
};

/**
 * A heuristic for choosing a font size to fill a box (assuming perfectly even line wrapping)
 * @returns a size in pixels to roughly fill the box
 */
const maximizeFontSize = ({
  text,
  width,
  height,
}: {
  text: string;
  width: number;
  height: number;
}): number => {
  let lines = 1;
  let size = Math.min(width / text.length, height);

  while (size * (lines + 1) < height) {
    lines += 1;
    size = Math.min(width / (text.length / lines), height);
  }
  return size;
};

/**
 * inspired by
 * @see https://wiscaksono.com/articles/generate-dynamic-open-graph-with-nextjs?fxck=true
 * @see https://github.com/loganzartman/loga.nz/blob/e2fdb725558b8d6e3012acd81bfee363c33adf6b/src/lib/generate-og-image.tsx
 * we use route to generate dynamic open graph images instead of the opengraph-image.tsx
 */
export const GET = (request: Request) => {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get('title') || APP_NAME;
  const imageSearchParams = searchParams.get('image');
  const backgroundColor = searchParams.get('background') || '#F5E7E7';
  const textColor = searchParams.get('color') || '#000000';
  const image = imageSearchParams?.split('url=')[1] || imageSearchParams;

  const width = 1200;
  const height = 630;
  const titleFontSize = `${maximizeFontSize({
    text: title,
    width: width - 200,
    height: height / 1.5,
  })}px`;

  return new ImageResponse(
    (
      <div
        style={{
          background: backgroundColor,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '100px',
          gap: '12px',
          position: 'relative',
        }}
      >
        {/* logo */}
        {}
        <img
          alt=""
          height="40"
          src={loadDataUrl('images/logo.svg', 'image/svg+xml', publicCwd)}
          width="100"
        />
        {/* title */}
        <h1
          style={{
            fontFamily: 'font-serif',
            fontSize: titleFontSize,
            textWrap: 'balance',
            lineHeight: '1.0',
            wordBreak: 'break-word',
            display: 'block',
            color: textColor,
          }}
        >
          {title}
        </h1>

        {/* image */}
        {image && (
          <img
            alt={`${title} ${APP_NAME}`}
            src={image}
            style={{ position: 'absolute', bottom: -15, right: -30 }}
            width={width / 3}
          />
        )}
        {}
      </div>
    ),
    {
      width,
      height,
      fonts: [
        {
          name: 'font-serif',
          data: loadFile('fonts/Calibre-Bold.otf'),
          weight: 600,
          style: 'normal',
        },
      ],
    }
  );
};
