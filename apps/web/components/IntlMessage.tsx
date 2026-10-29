import { useTranslations } from 'next-intl';

type Paths<Schema, Path extends string = ''> = Schema extends string
  ? Path
  : Schema extends object
    ? {
      [K in keyof Schema & string]: Paths<
        Schema[K],
          `${Path}${Path extends '' ? '' : '.'}${K}`
      >;
    }[keyof Schema & string]
    : never;

interface IProps {
  /** Message key */
  // eslint-disable-next-line no-undef
  path: Paths<IntlMessages>;
}

export const IntlMessage = ({ path: key }: IProps) => {
  const translate = useTranslations();

  return translate(key);
};
