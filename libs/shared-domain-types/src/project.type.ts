import type { ISEOFields } from '@shared/types';

export interface IProjectTranslatedFields extends ISEOFields {
  description?: string;
  title?: string;
  name?: string;
  content?: string;
  societyDescription?: string;
}

export interface IProjectUrl {
  url: string;
}
