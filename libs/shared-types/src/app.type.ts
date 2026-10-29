export type Locale = 'fr' | 'mg' | 'en';

export interface ISEOFields {
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string;
}

export interface IFileCloud {
  url: string;
  publicId: string;
}
