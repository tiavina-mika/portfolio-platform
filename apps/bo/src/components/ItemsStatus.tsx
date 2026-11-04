import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import BooleanIcons from '@/components/BooleanIcons';
import Items from '@/components/Items';
import { ISelectOption } from '@/types/_core/app.type';
import { displayDate } from '@/utils/_core/date.utils';

type Props = {
  entity: Record<string, any>;
  items?: ISelectOption<string | ReactNode>[];
};

const ItemsStatus = ({
  entity, items = [],
}: Props) => {
  const {
    t,
  } = useTranslation();

  /*
   * How this record stands with the back-office: whether anyone has dealt with it, when it was
   * first picked up, and — once it has been through more than one pair of hands — when it was last
   * looked at and how often.
   *
   * `seenAt` names the FIRST opening and is never rewritten, which is why the last two rows are
   * needed at all; they only earn a line once there is a second visit to report. Who did the
   * opening is named in the record's own event history, alongside every other dated event.
   */
  const seenItems: ISelectOption<string | ReactNode>[] = entity.seen === undefined
    ? []
    : [
      {
        label: t('seen'),
        value: <BooleanIcons value={!!entity.seen} />,
      },
      ...(entity.seenAt
        ? [{
          label: t('seenAt'),
          value: displayDate(entity.seenAt),
        }]
        : []),
      ...(entity.seenCount > 1
        ? [
          {
            label: t('lastSeenAt'),
            value: displayDate(entity.lastSeenAt),
          },
          {
            label: t('opened'),
            value: t('timesCount', { count: entity.seenCount }),
          },
        ]
        : []),
    ];

  const statusItems: ISelectOption<ReactNode>[] = [
    {
      label: t('deleted'),
      value: <BooleanIcons value={entity.deleted} />,
    },
    ...seenItems,
  ];

  return <Items fullWidth items={[...statusItems, ...items]} />;
};

export default ItemsStatus;
