import Image, { ImageProps } from 'next/image';

type Props = {
  size?: number;
  src: string;
  alt?: string;
  className?: string;
} & Omit<ImageProps, 'alt'>;

const NextIcon = ({
  src,
  className,
  size = 24,
  alt = 'icon',
  ...props
}: Props) => (
  <Image
    {...props}
    alt={alt}
    className={className}
    height={size}
    src={src}
    width={size}
  />
);

export default NextIcon;
