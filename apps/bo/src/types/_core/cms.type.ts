/**
 * The five parts a CMS record (a page, an article) is written in, and the order the form walks
 * through them. They are sections rather than wizard steps: a record is rarely written front to
 * back, and an editor coming back to fix a meta description should not have to walk past the
 * content to reach it. Nothing in one section gates what follows it.
 */
export enum CmsFormSectionEnum {
  CONTENT = 'content',
  SEO = 'seo',
  IMAGES = 'images',
  CATEGORY = 'category',
  SETTINGS = 'settings'
}

/** How full one section of a CMS form is, and how many of its fields are currently refused. */
export interface ICmsFormSectionProgress {
  filled: number;
  total: number;
  errors: number;
}

/**
 * What one CMS form is made of, section by section — the one description the summary rail, the
 * footer bar and the progress counter are all drawn from, so a page and an article share the same
 * workbench while each keeps its own fields.
 */
export interface ICmsFormSections {
  /** the sections, in the order the summary rail lists them */
  sections: CmsFormSectionEnum[];
  /*
   * the translated fields each section holds, named without their locale prefix. They are counted
   * on the language tab currently open rather than across every locale: an editor filling the
   * English version wants to know what is missing in English
   */
  translatedFields: Record<CmsFormSectionEnum, string[]>;
  /** the fields of each section that are the same in every language */
  plainFields: Record<CmsFormSectionEnum, string[]>;
  /*
   * fields a section owns without counting them as answers — they only drive another field of the
   * section — but whose errors still belong to it on the rail's error badge
   */
  uncountedFields: Partial<Record<CmsFormSectionEnum, string[]>>;
  /** the i18n key naming each section, shared by the rail, the footer bar and the section card */
  labelKeys: Record<CmsFormSectionEnum, string>;
  /** the i18n key of the sentence saying which fields are actually required */
  requiredFieldsHelperKey: string;
}
