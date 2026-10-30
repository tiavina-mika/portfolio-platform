export type ButtonVariantType = 'contained' | 'outlined' | 'text';
export type TextSizeType = 'sm' | 'md' | 'lg' | 'xl';
export type TextVariantType = 'body-lg' | 'body' | 'body-strong' | 'small' | 'caption' | 'label';
export type TextFormatType = 'caps' | 'numbers' | 'mono';
export type TextClampType = 'none' | '1-line' | '3-lines';
export type SimplePaletteColorOptions = 'light' | 'dark' | 'main' | 'discret';
export type PaletteColor =
  | 'primary' |
  'secondary' |
  'error' |
  'info' |
  'success' |
  'warning';
export type ButtonPaletteColor = PaletteColor | 'default';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';
export type TitleLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type TitleSizeType = '4xl' | '3xl' | '2xl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs';
export type TitleWeightType = 'medium' | 'semibold' | 'bold' | 'extrabold';
export type TitleVariantType =
  | 'display-xl' | 'display-lg' | 'display-md' | 'title' | 'heading' | 'card-title';
export type TitleClampType = 'none' | '1-line' | '2-lines';
export type TitleToneType = 'default' | 'muted' | 'brand' | 'inverse';
export type TitleAlignType = 'start' | 'center' | 'end';
export type SectionTitleSizeType = Extract<TitleSizeType, '4xl' | '3xl' | '2xl'>;
export type SectionTitleGutterType = 'none' | 'md' | 'lg' | 'xl';
export type SectionDescriptionMeasureType = '65ch' | 'none';
