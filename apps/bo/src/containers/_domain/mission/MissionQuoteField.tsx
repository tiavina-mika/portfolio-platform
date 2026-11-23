import { useEffect, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import SelectField from '@/components/form/fields/SelectField';
import { MISSION_QUOTE_PICKER_LIMIT } from '@/constants/_domain/mission.constants';
import { QUOTE_COLLECTION } from '@/constants/_domain/quote.constants';
import { useProtect } from '@/hooks/_core/useProtect';
import { searchAcceptedClientQuotes } from '@/redux/actions/_domain/quote.action';
import { ISelectOption } from '@/types/_core/app.type';
import { IMissionFormValues, IMissionQuote } from '@/types/_domain/mission.type';
import { IQuote } from '@/types/_domain/quote.type';

type Props = {
  // the quote of the mission edited (or the one it is created from), shown before any load
  initialQuote?: IMissionQuote | null;
  // set when the quote cannot change (the mission started): read-only, saying why
  lockedHelperText?: string;
};

const toMissionQuote = ({
  id, number, version, title,
}: IQuote): IMissionQuote => ({
  id, number, version, title,
});

/**
 * The accepted quote the mission carries out, picked among the accepted quotes of its client. Optional:
 * a mission with no quote stays possible. The list follows the client picked; an account that may not
 * read the quotes only sees the quote already set.
 */
const MissionQuoteField = ({ initialQuote, lockedHelperText }: Props) => {
  const { t } = useTranslation(['project']);
  const dispatch = useDispatch();
  const { canFind } = useProtect(QUOTE_COLLECTION);
  const { setValue } = useFormContext<IMissionFormValues>();
  const clientId = useWatch<IMissionFormValues, 'client'>({ name: 'client' });
  const isLocked = !!lockedHelperText;

  const [quotes, setQuotes] = useState<IMissionQuote[]>(initialQuote ? [initialQuote] : []);

  useEffect(() => {
    if (isLocked || !canFind || !clientId) return;

    dispatch(searchAcceptedClientQuotes(clientId, MISSION_QUOTE_PICKER_LIMIT, (found: IQuote[]) => {
      const options = found.map(toMissionQuote);

      setQuotes(options);
      // a quote of the client picked before is no quote of this one
      const currentQuote = initialQuote && options.some((quote) => quote.id === initialQuote.id)
        ? initialQuote.id
        : null;

      setValue('quote', currentQuote, { shouldDirty: true });
    }));
  }, [clientId, isLocked, canFind, dispatch, setValue, initialQuote]);

  const options = useMemo((): ISelectOption[] => quotes.map((quote) => ({
    label: t('project:mission.quoteOption', { number: quote.number, title: quote.title }),
    value: quote.id,
  })), [quotes, t]);

  return (
    <SelectField
      isClearable
      helperText={lockedHelperText ?? t('project:mission.quoteHelper')}
      isDisabled={isLocked || !canFind || !clientId}
      label={t('project:mission.quote')}
      name="quote"
      options={options}
      placeholder={t('project:mission.noQuote')}
    />
  );
};

export default MissionQuoteField;
