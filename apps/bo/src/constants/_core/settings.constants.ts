import { SettingsSection, SettingsSectionEnum } from '@/types/_core/setting.type';

/*
 * the sections that edit the public website rather than the reader's own back-office preferences.
 * They are the only ones backed by a form: everything a back-office section changes is a local
 * preference that applies the moment it is picked, so those have nothing to save.
 */
export const WEBSITE_SETTINGS_SECTIONS: SettingsSection[] = [
  SettingsSectionEnum.DETAILS,
  SettingsSectionEnum.IMAGES,
];

export const DEFAULT_SETTINGS_SECTION: SettingsSection = SettingsSectionEnum.LANGUAGES;

// the form each website section submits — the page head's save button acts on the open one
export const APP_CONTENTS_FORM_ID = 'app-contents-form';
export const APP_MAIN_IMAGES_FORM_ID = 'app-main-images-form';
