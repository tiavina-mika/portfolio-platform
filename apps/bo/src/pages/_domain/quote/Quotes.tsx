import { QuoteStatusEnum } from '@shared/domain-types';
import { getNextQuoteStatuses } from '@shared/domain-utils';
import { TargetEnum } from '@shared/types';
import { useNavigate } from '@tanstack/react-router';
import {
  type ReactNode, useCallback, useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiCheckCircle, FiClock, FiSend, FiXCircle,
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import CreateButton from '@/components/CreateButton';
import Head from '@/components/Head';
import PageHeader from '@/components/layouts/PageHeader';
import DatesCell from '@/components/table/DatesCell';
import ListWithSelection from '@/components/table/ListWithSelection';
import i18n from '@/config/i18n';
import { MENU_ITEM_ICON_SIZE } from '@/constants/_core/ui/ui.constants';
import {
  QUOTE_COLLECTION, QUOTE_STATUS_ACTION_LABEL_KEYS, QUOTE_TAB_OPTIONS,
} from '@/constants/_domain/quote.constants';
import QuoteAcceptDialog from '@/containers/_domain/quote/QuoteAcceptDialog';
import QuoteFormDialog from '@/containers/_domain/quote/QuoteFormDialog';
import QuoteStatusCell from '@/containers/_domain/quote/QuoteStatusCell';
import QuoteTitleCell from '@/containers/_domain/quote/QuoteTitleCell';
import SearchQuotes from '@/containers/_domain/quote/SearchQuotes';
import { useProtect } from '@/hooks/_core/useProtect';
import { goToHome } from '@/redux/actions/_core/app.action';
import { createOrUpdateQuote, loadQuotes, setQuoteStatus } from '@/redux/actions/_domain/quote.action';
import { getSettingsLocaleSelector, getSettingsWorkspaceSelector } from '@/redux/reducers/_core/settings.reducer';
import { getQuoteCountSelector, getQuoteQuotesSelector } from '@/redux/reducers/_domain/quote.reducer';
import { quotesRoute } from '@/routes/protected/_domain/quote.routes';
import { IQueriesInput, IRenderSearchProps, ITableHeadCell } from '@/types/_core/app.type';
import { IQuote, IQuoteFormValues } from '@/types/_domain/quote.type';
import { formatQuoteAmount } from '@/utils/_domain/quote.utils';
import { QuoteAcceptInput, QuotesRouteSearchParams } from '@/validations/_domain/quote.validation';

interface IData {
  quote: ReactNode;
  client: ReactNode;
  amount: ReactNode;
  dates: ReactNode;
  status: ReactNode;
  actions: ReactNode;
}

// the icon of the row action that moves a quote to each status it can reach
const STATUS_ACTION_ICONS: Partial<Record<QuoteStatusEnum, ReactNode>> = {
  [QuoteStatusEnum.SENT]: <FiSend aria-hidden size={MENU_ITEM_ICON_SIZE} />,
  [QuoteStatusEnum.ACCEPTED]: <FiCheckCircle aria-hidden size={MENU_ITEM_ICON_SIZE} />,
  [QuoteStatusEnum.REFUSED]: <FiXCircle aria-hidden size={MENU_ITEM_ICON_SIZE} />,
  [QuoteStatusEnum.EXPIRED]: <FiClock aria-hidden size={MENU_ITEM_ICON_SIZE} />,
};

// which quote, for whom, for how much, when, and where it stands
const headCells: ITableHeadCell<keyof IData>[] = [
  {
    id: 'quote',
    label: i18n.t('project:quote.quote'),
    width: 260,
    sortFields: [
      { id: 'number', label: i18n.t('project:quote.number') },
      { id: 'title', label: i18n.t('project:quote.title') },
    ],
  },
  {
    id: 'client',
    label: i18n.t('project:quote.client'),
    disableSorting: true,
  },
  {
    id: 'amount',
    label: i18n.t('project:quote.total'),
    sortFields: [{ id: 'totalAmount', label: i18n.t('project:quote.total') }],
  },
  {
    id: 'dates',
    label: `${i18n.t('common:createdAt')} / ${i18n.t('common:updatedAt')}`,
    sortFields: [
      { id: 'issuedAt', label: i18n.t('project:quote.issuedAt') },
      { id: 'createdAt', label: i18n.t('common:createdAt') },
      { id: 'updatedAt', label: i18n.t('common:updatedAt') },
    ],
  },
  {
    id: 'status',
    label: i18n.t('common:status'),
    disableSorting: true,
  },
  {
    id: 'actions',
    label: i18n.t('common:actions'),
    align: 'right',
  },
];

/**
 * The quotes Aldaron sends its clients: written as drafts, then sent, and recorded accepted, refused
 * or expired. Only a draft is edited; a quote is never deleted, it stays as history in its status.
 */
const Quotes = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation(['project', 'common']);
  const quotes = useSelector(getQuoteQuotesSelector);
  const count = useSelector(getQuoteCountSelector);
  const locale = useSelector(getSettingsLocaleSelector);
  const searchParams: QuotesRouteSearchParams = quotesRoute.useSearch();
  const { canCreate, canEdit } = useProtect(QUOTE_COLLECTION);
  const workspace = useSelector(getSettingsWorkspaceSelector);
  const navigate = useNavigate();

  // the quotes belong to Aldaron: switching to another workspace from this page leaves it
  useEffect(() => {
    if (workspace !== TargetEnum.AGENCY) navigate(goToHome());
  }, [workspace, navigate]);

  // the dialog is shared by "New quote" and "Edit": open on no quote to create one
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<IQuote | null>(null);
  const [acceptingQuote, setAcceptingQuote] = useState<IQuote | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openDialog = useCallback((quote: IQuote | null): void => {
    setSelectedQuote(quote);
    setIsDialogOpen(true);
  }, []);

  const closeDialog = (): void => {
    setIsDialogOpen(false);
    setSelectedQuote(null);
  };

  // closed once saved only: a refusal keeps what was typed on screen
  const handleSubmit = async (values: IQuoteFormValues): Promise<void> => {
    setIsSaving(true);
    const error = await dispatch(createOrUpdateQuote(values, selectedQuote));

    setIsSaving(false);
    if (!error) closeDialog();
  };

  // accepting asks how the client said yes first; the other moves apply at once
  const handleStatusChange = useCallback((quote: IQuote, status: QuoteStatusEnum): void => {
    if (status === QuoteStatusEnum.ACCEPTED) {
      setAcceptingQuote(quote);
      return;
    }

    dispatch(setQuoteStatus(quote, status));
  }, [dispatch]);

  const handleAccept = async (values: QuoteAcceptInput): Promise<void> => {
    if (!acceptingQuote) return;

    setIsSaving(true);
    const error = await dispatch(setQuoteStatus(acceptingQuote, QuoteStatusEnum.ACCEPTED, values));

    setIsSaving(false);
    if (!error) setAcceptingQuote(null);
  };

  const handleUpdateData = (queries: IQueriesInput): void => {
    dispatch(loadQuotes(queries));
  };

  const dataTable = useMemo((): IData[] => quotes.map((quote: IQuote) => {
    const data: Record<string, any> = {
      id: quote.id, // required even if not displayed
      quote: <QuoteTitleCell quote={quote} />,
      client: quote.client.name,
      amount: formatQuoteAmount(quote.totalAmount, quote.currency, locale),
      dates: <DatesCell createdAt={quote.createdAt} updatedAt={quote.updatedAt} />,
      status: <QuoteStatusCell quote={quote} />,
      actions: (
        <ActionsMenu
          label={quote.number}
          // only a draft is edited: what was sent to the client stays what is stored
          onEdit={canEdit && quote.status === QuoteStatusEnum.DRAFT ? () => openDialog(quote) : undefined}
          type="row"
          menus={getNextQuoteStatuses(quote.status).map((status) => ({
            onClick: () => handleStatusChange(quote, status),
            display: canEdit,
            label: t(QUOTE_STATUS_ACTION_LABEL_KEYS[status] ?? ''),
            icon: STATUS_ACTION_ICONS[status],
          }))}
        />
      ),
    };

    return data as IData;
  }), [quotes, canEdit, handleStatusChange, openDialog, locale, t]);

  return (
    <>
      <Head title={t('project:quote.quotes')} />
      <PageHeader
        title={t('project:quote.quotes')}
        actions={canCreate && (
          <CreateButton label={t('project:quote.createQuote')} onClick={() => openDialog(null)} />
        )}
      />
      <ListWithSelection<IData>
        canUpdate={canEdit}
        count={count}
        defaultFilters={searchParams}
        enableMultipleSelect={false}
        headCells={headCells}
        items={dataTable}
        onUpdateData={handleUpdateData}
        renderFilter={(props: IRenderSearchProps) => <SearchQuotes {...props} />}
        tabs={QUOTE_TAB_OPTIONS}
      />
      <QuoteFormDialog
        loading={isSaving}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        open={isDialogOpen}
        quote={selectedQuote}
      />
      {/* keyed on the quote, so the method picked for one quote is never carried to the next */}
      <QuoteAcceptDialog
        key={acceptingQuote?.id ?? 'none'}
        loading={isSaving}
        onClose={() => setAcceptingQuote(null)}
        onSubmit={handleAccept}
        quote={acceptingQuote}
      />
    </>
  );
};

export default Quotes;
