'use client';

import ReactYouTube from 'react-youtube';

import { getYoutubeVideoId } from '@/utils/app.utils';

type YouTubeProps = {
  src: string;
};
const YouTube = ({ src }: YouTubeProps) => {
  return (
    <ReactYouTube
      iframeClassName="relative w-full"
      opts={{ width: 500, height: 500 }}
      videoId={getYoutubeVideoId(src)}
    />
  );
};

export default YouTube;
