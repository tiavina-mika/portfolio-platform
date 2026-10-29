import type { DefaultMUIColorType } from '@/types/_core/app.type';
import type { IUser } from '@/types/_core/user.type';
import type { DateType } from '@/types/_core/utils.type';

/** One dated event on a record's history rail, already named by the caller. */
export interface IHistoryEvent {
  key: string;
  label: string;
  date?: DateType;
  /** the account behind it, when there is one */
  user?: IUser;
  /** the tone of its dot — the rail is scanned for colour before any label is read */
  color?: DefaultMUIColorType;
}
