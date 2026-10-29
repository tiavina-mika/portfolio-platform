import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Typography } from '@mui/material';
import { useBlocker } from '@tanstack/react-router';
import { useId, useRef, useState } from 'react';
import { useForm, type FieldErrors, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import type { Theme } from '@mui/material/styles';

import Dialog from '@/components/Dialog';
import CardFormBlock from '@/components/form/CardFormBlock';
import ChoiceChipsField from '@/components/form/fields/ChoiceChipsField';
import RightsField from '@/components/form/fields/RightsField';
import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import SearchInput from '@/components/form/inputs/SearchInput';
import i18n, { locales } from '@/config/i18n';
import { DEFAULT_LOCALE } from '@/constants/_core/app.constants';
import {
  ROLE_SESSION_TIMEOUT_MAX_HOURS,
  ROLE_SESSION_TIMEOUT_MIN_HOURS,
  ROLE_SESSION_TIMEOUT_STEP_HOURS,
  SESSION_INACTIVITY_TIMEOUT_HOURS,
} from '@/constants/_core/auth.constants';
import { RIGHTS_FILTER_WIDTH, ROLE_FORM_NAV_WIDTH } from '@/constants/_core/ui/ui.constants';
import { CONTENT_GAP, FORM_WORKBENCH_BREAKPOINT } from '@/constants/_core/ui.constants';
import {
  defaultRights, getRightsEntities, RIGHTS_DISPLAY_ORDER, ROLE_FORM_SECTIONS, roleTranslatedFieldsObj,
  type RoleFormSection,
} from '@/constants/_core/user.constants';
import CmsFormToolbar from '@/containers/_core/cms/form/CmsFormToolbar';
import { useTranslatedValuesByTab } from '@/hooks/_core/useTranslatedValuesByTab';
import { getRoleCurrentUserRolesSelector } from '@/redux/reducers/_core/role.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { ISelectOption } from '@/types/_core/app.type';
import {
  IRightsItem, IRoleInput, IRole, UIRole, UIRoleEnum,
} from '@/types/_core/role.type';
import { getCountryOptions } from '@/utils/_core/country.utils';
import { fromNow } from '@/utils/_core/date.utils';
import { getRoleLabel, getSessionTimeoutHoursFromMinutes } from '@/utils/_core/role.utils';
import { formatTechnicalCode, getTranslatedFormTabErrors } from '@/utils/_core/utils';
import { roleCodec, roleSchema } from '@/validations/_core/role.validations';

import RoleFormNav, { type RoleFormNavItem } from './RoleFormNav';

const ROLE_TRANSLATED_FIELDS = roleTranslatedFieldsObj.map((field) => field.name);

// the fields each section holds, which is how a refused field is traced back to its section
const ACCESS_FIELDS = ['children', 'ui', 'countries', 'sessionTimeoutHours'];
const NAME_FIELD = 'name';

const classes = {
  workbench: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${CONTENT_GAP}px`,
  },
  // the summary beside the section being filled; stacked, the summary is a row above it
  layout: (theme: Theme) => ({
    display: 'grid',
    gridTemplateColumns: `${ROLE_FORM_NAV_WIDTH}px minmax(0, 1fr)`,
    gap: `${CONTENT_GAP}px`,
    alignItems: 'start',
    [theme.breakpoints.down(FORM_WORKBENCH_BREAKPOINT)]: {
      gridTemplateColumns: 'minmax(0, 1fr)',
    },
  }),
  section: (isLocked: boolean) => ({
    minWidth: 0,
    ...(isLocked && { opacity: 0.6, pointerEvents: 'none' as const }),
  }),
  identityFields: { display: 'flex', flexDirection: 'column' as const, gap: 16, maxWidth: 620 },
  accessFields: (theme: Theme) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: theme.spacing(2.25),
    maxWidth: 900,
    [theme.breakpoints.down('md')]: { gridTemplateColumns: 'minmax(0, 1fr)' },
  }),
  rightsToolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: 1.5,
  },
};

const getInitialValues = (selectedRole: IRole | null | undefined) => {
  if (selectedRole) {
    const rightsWithLabel = [];

    for (const rightOption of getRightsEntities()) {
      const savedRight = selectedRole.rights?.find(
        (right: IRightsItem): boolean => right.className === rightOption.className
      );

      // rights from database
      if (savedRight) {
        // add label
        const savedRightWithLabel = { ...savedRight, label: rightOption.label };

        rightsWithLabel.push(savedRightWithLabel);
        // collection not linked to a role / rights yet
      }
      else {
        // add label
        const notSavedRight = { ...rightOption, rights: defaultRights, label: rightOption.label };

        rightsWithLabel.push(notSavedRight);
      }
    }

    // roles created before the "label" field existed have no `translated` — fall back to `name`
    const translatedFields = selectedRole.translated
      ? roleCodec.encode(selectedRole.translated)
      : { [`${DEFAULT_LOCALE}:label`]: selectedRole.name };

    return {
      name: selectedRole.name,
      children: (selectedRole.children || []).map((role: IRole) => role.name),
      rights: rightsWithLabel,
      ui: selectedRole.ui || [],
      countries: selectedRole.countries ?? [],
      sessionTimeoutHours: getSessionTimeoutHoursFromMinutes(selectedRole.sessionTimeoutMinutes),
      ...translatedFields,
    };
  }

  return {
    name: '',
    children: [],
    countries: [],
    rights: getRightsEntities().map((className: Omit<IRightsItem, 'rights'>) => ({
      ...className,
      rights: defaultRights,
    })),
  };
};

// note that the value should be the same as the "right" in the menu list in SideBar.tsx
const uiOptions: ISelectOption<UIRole>[] = [
  { value: UIRoleEnum.MIGRATIONS, label: i18n.t('common:misc.migrations') },
  { value: UIRoleEnum.CRON, label: i18n.t('common:misc.cron') },
  { value: UIRoleEnum.TESTS, label: i18n.t('common:misc.tests') },
  { value: UIRoleEnum.STATISTICS, label: i18n.t('common:statistics') },
  { value: UIRoleEnum.IMPERSONATION, label: i18n.t('common:misc.impersonation') },
  { value: UIRoleEnum.FINANCE, label: i18n.t('common:finance') },
  { value: UIRoleEnum.BROADCAST, label: i18n.t('user:notifications.broadcast.broadcast') },
  { value: UIRoleEnum.STAFF, label: i18n.t('common:misc.staff') },
];

const getErrorCountBySection = (errors: FieldErrors): Record<RoleFormSection, number> => {
  const refusedFields = Object.keys(errors);

  return {
    identity: refusedFields.filter(
      (field) => field === NAME_FIELD || ROLE_TRANSLATED_FIELDS.some((name) => field.endsWith(`:${name}`))
    ).length,
    access: refusedFields.filter((field) => ACCESS_FIELDS.includes(field)).length,
    rights: 0,
  };
};

type Props = {
  selectedRole?: IRole | null;
  roles: IRole[];
  onSubmit: (values: IRoleInput) => void | Promise<void>;
  /** the signed-in admin may read this role but not write it: the form is shown locked */
  isReadOnly?: boolean;
};

const RoleForm = ({
  selectedRole, onSubmit, roles, isReadOnly = false,
}: Props) => {
  const {
    t,
  } = useTranslation(['common', 'user']);
  const formId = useId();
  const currentLocale = useSelector(getSettingsLocaleSelector);
  const [rightsSearch, setRightsSearch] = useState<string>('');
  const [section, setSection] = useState<RoleFormSection>(ROLE_FORM_SECTIONS[0]);

  // an admin cannot grant a resource right they do not hold themselves — see RightsMatrixInput
  const currentUserRoles = useSelector(getRoleCurrentUserRolesSelector);

  // get translated fields depending on the selected language (tabs)
  const {
    onTabChange, tab,
  } = useTranslatedValuesByTab();

  const form = useForm<IRoleInput>({
    mode: 'onBlur',
    /*
     * roleSchema's spread of the translated fields' loosely typed `z.ZodObject<any>` shape
     * degrades its own inferred TS type (see the comment on IRoleInput in role.type.ts) even
     * though the actual Zod runtime validation is correct — cast to the hand-fixed generic
     * rather than the schema's own (broken) inference
     */
    resolver: zodResolver(roleSchema) as unknown as Resolver<IRoleInput, any, IRoleInput>,
    defaultValues: getInitialValues(selectedRole),
  });

  const {
    getValues, setValue,
  } = form;
  const {
    errors, isDirty, isSubmitting,
  } = form.formState;
  // the values held back while the admin confirms that some child roles are being dropped
  const [pendingValues, setPendingValues] = useState<IRoleInput | null>(null);

  const [isConfirmingDrop, setIsConfirmingDrop] = useState<boolean>(false);

  /*
   * leaving with edits that were not saved loses them: the admin is asked first. A save in flight
   * is not a departure — the page navigates away on its own once the role is written.
   */
  const shouldBlock = isDirty && !isSubmitting && !isConfirmingDrop;
  const blocker = useBlocker({
    shouldBlockFn: () => shouldBlock,
    enableBeforeUnload: shouldBlock,
    withResolver: true,
  });

  /*
   * remembers the last "name" value *we* auto-generated from the label — used below to tell "still
   * our own auto-fill" apart from "the admin edited the name directly", the same technique used for
   * the translated slug in ArticleForm/PageFormStepOne
   */
  const lastAutoNameRef = useRef<string>('');

  const hierarchyOptions = roles
    .filter((role: IRole) => getValues().name !== role.name) // exclude the current role
    // the translated label is what an admin recognises a role by, the technical name stays the value
    .map((role: IRole) => ({ value: role.name, label: getRoleLabel(role, currentLocale) }));

  /*
   * auto-fill "name" from the default locale's "label" while the admin has not customized "name"
   * themselves — only during creation, "name" is locked (disabled) once the role is created
   */
  const handleLabelChange = (locale: string) => (value: string | number) => {
    if (locale !== DEFAULT_LOCALE || selectedRole) return;

    const currentName = getValues('name');

    if (currentName && currentName !== lastAutoNameRef.current) return;

    const formattedName = formatTechnicalCode(String(value));

    lastAutoNameRef.current = formattedName;
    setValue('name', formattedName, { shouldValidate: true });
  };

  // normalize whatever the admin types directly into "name" into an upper snake case technical name
  const handleNameChange = (value: string | number) => {
    setValue('name', formatTechnicalCode(String(value)), { shouldValidate: true });
  };

  /*
   * dropping a child role takes the privileges it inherited from this role away from its members:
   * the admin confirms it before it is saved, instead of finding out from a locked-out colleague
   */
  const handleSubmit = async (values: IRoleInput) => {
    const initialChildren = (selectedRole?.children || []).map((role: IRole) => role.name);
    const hasDroppedChildren = initialChildren.some((name: string) => !values.children.includes(name));

    if (hasDroppedChildren) {
      setPendingValues(values);
      return;
    }

    await onSubmit(values);
  };

  /*
   * only one section is drawn at a time, so a refused field in another one would stay out of sight:
   * the form opens the first section that holds one, on the language that holds it
   */
  const handleInvalid = (invalidFields: FieldErrors) => {
    const errorCounts = getErrorCountBySection(invalidFields);
    const firstSectionWithErrors = ROLE_FORM_SECTIONS.find((item) => errorCounts[item] > 0);

    if (firstSectionWithErrors) setSection(firstSectionWithErrors);

    const refusedLocales = getTranslatedFormTabErrors(invalidFields, ROLE_TRANSLATED_FIELDS);

    if (refusedLocales.length && !refusedLocales.includes(tab)) {
      onTabChange(refusedLocales[0] as typeof tab);
    }
  };

  const handleSave = form.handleSubmit(handleSubmit, handleInvalid);

  const rights = form.watch('rights') ?? [];
  const grantedRightsCount = rights.reduce(
    (count, item) => count + RIGHTS_DISPLAY_ORDER.filter((key) => item.rights[key]).length,
    0
  );
  const totalRightsCount = rights.length * RIGHTS_DISPLAY_ORDER.length;

  const handleCancelDrop = () => setPendingValues(null);

  const handleConfirmDrop = async () => {
    if (!pendingValues) return;

    setIsConfirmingDrop(true);
    await onSubmit(pendingValues);
    setIsConfirmingDrop(false);
  };

  const errorCounts = getErrorCountBySection(errors);
  const defaultLabel = (form.watch(`${DEFAULT_LOCALE}:label`) as string | undefined) ?? '';
  const navItems: RoleFormNavItem<RoleFormSection>[] = [
    {
      key: 'identity',
      title: t('user:role.identitySection'),
      summary: defaultLabel || '—',
      errorCount: errorCounts.identity,
    },
    {
      key: 'access',
      title: t('user:role.accessConfigSection'),
      summary: t('user:role.accessSummary', {
        children: form.watch('children')?.length ?? 0,
        menus: form.watch('ui')?.length ?? 0,
      }),
      errorCount: errorCounts.access,
    },
    {
      key: 'rights',
      title: t('user:role.resourceRights'),
      summary: t('user:role.rightsGrantedSummary', { granted: grantedRightsCount, total: totalRightsCount }),
      errorCount: errorCounts.rights,
    },
  ];

  const savedAt = selectedRole?.updatedAt;

  return (
    <>
      <Form
        form={form}
        formId={formId}
        onPrimaryButtonClick={handleSave}
        onSubmit={handleSubmit}
      >
        <Box css={classes.workbench}>
          {isReadOnly && (
            <Alert severity="warning">{t('user:role.readOnlyNotice')}</Alert>
          )}

          {/* the language the label is shown in, when the role was last written, and the save */}
          <CmsFormToolbar
            isSaveKept
            isSaveDisabled={isReadOnly}
            loading={isSubmitting}
            onSave={handleSave}
            onTabChange={onTabChange}
            savedAt={savedAt}
            tab={tab}
            translatedFields={ROLE_TRANSLATED_FIELDS}
            savedLabels={{
              savedAt: t('user:role.savedAt', { date: savedAt && fromNow(savedAt) }),
              neverSaved: t('user:role.neverSaved'),
            }}
          />

          <Box css={classes.layout}>
            <RoleFormNav activeKey={section} items={navItems} onChange={setSection} />

            <Box css={classes.section(isReadOnly)}>
              {/* identity: label (translated) + technical name */}
              {section === 'identity' && (
                <CardFormBlock
                  description={t('user:role.identitySectionDescription')}
                  title={t('user:role.identitySection')}
                >
                  <Box css={classes.identityFields}>
                    {locales.map((locale: string) => (
                      <div
                        key={locale}
                        css={{
                          display: locale === tab
                            ? 'block'
                            : 'none',
                        }}
                      >
                        <TextField
                          fullWidth
                          helperText={t('user:role.labelHelper')}
                          label={t('user:role.label')}
                          name={locale + ':label'}
                          onFieldChange={handleLabelChange(locale)}
                          required={locale === DEFAULT_LOCALE}
                          type="text"
                        />
                      </div>
                    ))}
                    <TextField
                      fullWidth
                      required
                      disabled={!!selectedRole}
                      helperText={t('user:role.nameHelper')}
                      label={t('common:name')}
                      name="name"
                      onFieldChange={handleNameChange}
                      type="text"
                    />
                  </Box>
                </CardFormBlock>
              )}

              {/* access configuration: role inheritance + visible menus + session timeout */}
              {section === 'access' && (
                <CardFormBlock
                  description={t('user:role.accessConfigSectionDescription')}
                  title={t('user:role.accessConfigSection')}
                >
                  <Box css={classes.accessFields}>
                    <SelectField
                      isMulti
                      helperText={t('user:role.roleHierarchyExplanation')}
                      label={t('user:role.childRoles')}
                      name="children"
                      options={hierarchyOptions}
                    />
                    <ChoiceChipsField
                      multiple
                      helperText={t('user:role.uiDescription')}
                      label={t('user:role.menu')}
                      name="ui"
                      options={uiOptions}
                    />
                    <SelectField
                      isMulti
                      helperText={t('user:role.countriesHelper')}
                      label={t('user:role.countries')}
                      name="countries"
                      options={getCountryOptions()}
                    />
                    <TextField
                      fullWidth
                      label={t('user:role.sessionTimeout')}
                      name="sessionTimeoutHours"
                      type="number"
                      helperText={t('user:role.sessionTimeoutHelper', {
                        min: ROLE_SESSION_TIMEOUT_MIN_HOURS,
                        max: ROLE_SESSION_TIMEOUT_MAX_HOURS,
                        step: ROLE_SESSION_TIMEOUT_STEP_HOURS,
                        default: SESSION_INACTIVITY_TIMEOUT_HOURS,
                      })}
                      slotProps={{
                        inputLabel: { shrink: true },
                        htmlInput: {
                          min: ROLE_SESSION_TIMEOUT_MIN_HOURS,
                          max: ROLE_SESSION_TIMEOUT_MAX_HOURS,
                          step: ROLE_SESSION_TIMEOUT_STEP_HOURS,
                        },
                      }}
                    />
                  </Box>
                </CardFormBlock>
              )}

              {/* resource rights: a grid on a desktop, one resource at a time on a narrower screen */}
              {section === 'rights' && (
                <CardFormBlock
                  description={t('user:role.resourceRightsDescription')}
                  title={t('user:role.resourceRights')}
                >
                  <Box css={classes.rightsToolbar}>
                    <SearchInput
                      name="entity"
                      onChange={(_name, text) => setRightsSearch(text)}
                      placeholder={t('user:role.searchEntityPlaceholder')}
                      width={RIGHTS_FILTER_WIDTH}
                    />
                    <Typography color="text.secondary" variant="body2">
                      {t('user:role.rightsGrantedSummary', {
                        granted: grantedRightsCount,
                        total: totalRightsCount,
                      })}
                    </Typography>
                  </Box>
                  <RightsField
                    currentUserRoles={currentUserRoles}
                    name="rights"
                    search={rightsSearch}
                  />
                </CardFormBlock>
              )}
            </Box>
          </Box>
        </Box>
      </Form>
      <Dialog
        buttonColor="error"
        description={t('user:role.confirmRemoveChildrenDescription')}
        onPrimaryButtonAction={handleConfirmDrop}
        open={!!pendingValues}
        primaryButtonText={t('user:role.confirmRemoveChildrenAction')}
        title={t('user:role.confirmRemoveChildrenTitle')}
        toggle={handleCancelDrop}
      />
      <Dialog
        buttonColor="error"
        description={t('user:role.unsavedChangesDescription')}
        onPrimaryButtonAction={blocker.proceed}
        open={blocker.status === 'blocked'}
        primaryButtonText={t('user:role.leaveWithoutSaving')}
        secondaryButtonText={t('user:role.stay')}
        title={t('common:unsavedChanges')}
        toggle={blocker.reset}
      />
    </>
  );
};

export default RoleForm;
