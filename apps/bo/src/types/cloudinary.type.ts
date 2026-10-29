/* eslint-disable @cspell/spellchecker */
/* eslint-disable @typescript-eslint/naming-convention */
/**
 * types copied from /node_modules/cloudinary/index.d.ts in the server
 * only the necessary types are copied and used here
 * @see https://cloudinary.com/documentation/image_upload_api_reference#upload
 */
type StreamingProfiles =
    (string & Record<string, any>) |
    '4k' |
    'full_hd' |
    'hd' |
    'sd' |
    'full_hd_wifi' |
    'full_hd_lean' |
    'hd_lean';
type ModerationKind = (string & Record<string, any>) | 'manual' | 'webpurify' | 'aws_rek' | 'metascan';
type AccessMode = (string & Record<string, any>) | 'public' | 'authenticated';
type CropMode =
| (string & Record<string, any>) |
'scale' |
'fit' |
'limit' |
'mfit' |
'fill' |
'lfill' |
'pad' |
'lpad' |
'mpad' |
'crop' |
'thumb' |
'imagga_crop' |
'imagga_scale';
type Gravity =
| (string & Record<string, any>) |
'north_west' |
'north' |
'north_east' |
'west' |
'center' |
'east' |
'south_west' |
'south' |
'south_east' |
'xy_center' |
'face' |
'face:center' |
'face:auto' |
'faces' |
'faces:center' |
'faces:auto' |
'body' |
'body:face' |
'adv_face' |
'adv_faces' |
'adv_eyes' |
'custom' |
'custom:face' |
'custom:faces' |
'custom:adv_face' |
'custom:adv_faces' |
'auto' |
'auto:adv_face' |
'auto:adv_faces' |
'auto:adv_eyes' |
'auto:body' |
'auto:face' |
'auto:faces' |
'auto:custom_no_override' |
'auto:none' |
'liquid' |
'ocr_text';
type Angle =
  number |
  (string & Record<string, any>) |
  (number | string)[] |
  'auto_right' |
  'auto_left' |
  'ignore' |
  'vflip' |
  'hflip';
type ImageEffect =
| (string & Record<string, any>) |
'hue' |
'red' |
'green' |
'blue' |
'negate' |
'brightness' |
'auto_brightness' |
'brightness_hsb' |
'sepia' |
'grayscale' |
'blackwhite' |
'saturation' |
'colorize' |
'replace_color' |
'simulate_colorblind' |
'assist_colorblind' |
'recolor' |
'tint' |
'contrast' |
'auto_contrast' |
'auto_color' |
'vibrance' |
'noise' |
'ordered_dither' |
'pixelate_faces' |
'pixelate_region' |
'pixelate' |
'unsharp_mask' |
'sharpen' |
'blur_faces' |
'blur_region' |
'blur' |
'tilt_shift' |
'gradient_fade' |
'vignette' |
'anti_removal' |
'overlay' |
'mask' |
'multiply' |
'displace' |
'shear' |
'distort' |
'trim' |
'make_transparent' |
'shadow' |
'viesus_correct' |
'fill_light' |
'gamma' |
'improve';

type VideoEffect =
(string & Record<string, any>) |
'accelerate' |
'reverse' |
'boomerang' |
'loop' |
'make_transparent' |
'transition';
type AudioCodec = (string & Record<string, any>) | 'none' | 'aac' | 'vorbis' | 'mp3';
type AudioFrequency =
  string |
  (number & Record<string, any>) |
  8000 |
  11025 |
  16000 |
  22050 |
  32000 |
  37800 |
  44056 |
  44100 |
  47250 |
  48000 |
  88200 |
  96000 |
  176400 |
  192000;

/** **************************** Flags ************************************ */
type ImageFlags =
| (string & Record<string, any>) |
string[] |
'any_format' |
'attachment' |
'apng' |
'awebp' |
'clip' |
'clip_evenodd' |
'cutter' |
'force_strip' |
'getinfo' |
'ignore_aspect_ratio' |
'immutable_cache' |
'keep_attribution' |
'keep_iptc' |
'layer_apply' |
'lossy' |
'preserve_transparency' |
'png8' |
'png32' |
'progressive' |
'rasterize' |
'region_relative' |
'relative' |
'replace_image' |
'sanitize' |
'strip_profile' |
'text_no_trim' |
'no_overflow' |
'text_disallow_overflow' |
'tiff8_lzw' |
'tiled';
type VideoFlags =
| (string & Record<string, any>) |
string[] |
'animated' |
'awebp' |
'attachment' |
'streaming_attachment' |
'hlsv3' |
'keep_dar' |
'splice' |
'layer_apply' |
'no_stream' |
'mono' |
'relative' |
'truncate_ts' |
'waveform';
type ColorSpace = (string & Record<string, any>) | 'srgb' | 'no_cmyk' | 'keep_cmyk';
type DeliveryType =
| (string & Record<string, any>) |
'upload' |
'private' |
'authenticated' |
'fetch' |
'multi' |
'text' |
'asset' |
'list' |
'facebook' |
'twitter' |
'twitter_name' |
'instagram' |
'gravatar' |
'youtube' |
'hulu' |
'vimeo' |
'animoto' |
'worldstarhiphop' |
'dailymotion';

/** **************************** URL ************************************ */
type ImageFormat =
| (string & Record<string, any>) |
'gif' |
'png' |
'jpg' |
'bmp' |
'ico' |
'pdf' |
'tiff' |
'eps' |
'jpc' |
'jp2' |
'psd' |
'webp' |
'zip' |
'svg' |
'webm' |
'wdp' |
'hpx' |
'djvu' |
'ai' |
'flif' |
'bpg' |
'miff' |
'tga' |
'heic';
type VideoFormat =
| (string & Record<string, any>) |
'auto' |
'flv' |
'm3u8' |
'ts' |
'mov' |
'mkv' |
'mp4' |
'mpd' |
'ogv' |
'webm';

export interface ICommonTransformationOptions {

  transformation?: TransformationOptions;
  raw_transformation?: string;
  crop?: CropMode;
  width?: number | string;
  height?: number | string;
  size?: string;
  aspect_ratio?: number | string;
  gravity?: Gravity;
  x?: number | string;
  y?: number | string;
  zoom?: number | string;
  effect?: string | (number | string)[];
  background?: string;
  angle?: Angle;
  radius?: number | string;
  overlay?: string | object; // might be Record<any, any>
  custom_function?: string | {
    function_type: (string & Record<string, any>) | 'wasm' | 'remote'; source: string;
  };
  variables?: (string | object)[]; // might be Record<any, any>
  if?: string;
  else?: string;
  end_if?: string;
  dpr?: number | string;
  quality?: number | string;
  delay?: number | string;

  [futureKey: string]: any;
}

interface VideoTransformationOptions extends ICommonTransformationOptions {
  audio_codec?: AudioCodec;
  audio_frequency?: AudioFrequency;
  video_codec?: string | Record<string, any>; // might be Record<any, any>
  bit_rate?: number | string;
  fps?: string | (number | string)[];
  keyframe_interval?: string;
  offset?: string;
  start_offset?: number | string;
  end_offset?: number | string;
  duration?: number | string;
  streaming_profile?: StreamingProfiles;
  video_sampling?: number | string;
  format?: VideoFormat;
  fetch_format?: VideoFormat;
  effect?: string | (number | string)[] | VideoEffect;
  flags?: VideoFlags;

  [futureKey: string]: any;
}

export interface ImageTransformationOptions extends ICommonTransformationOptions {
  underlay?: string | Record<string, any>; // might be Record<any, any>
  color?: string;
  color_space?: ColorSpace;
  opacity?: number | string;
  border?: string;
  default_image?: string;
  density?: number | string;
  format?: ImageFormat;
  fetch_format?: ImageFormat;
  effect?: string | (number | string)[] | ImageEffect;
  page?: number | string;
  flags?: ImageFlags | string;

  [futureKey: string]: any;
}

type TransformationOptions =
  string |
  string[] |
  VideoTransformationOptions |
  ImageTransformationOptions |
  Record<string, any> | // might be Record<any, any>
  ImageTransformationOptions[] |
  VideoTransformationOptions[];


export interface ResourceOptions {
  type?: string;
  resource_type?: string;
}

export interface UpdateApiOptions extends ResourceOptions {
  access_control?: string[];
  auto_tagging?: number;
  background_removal?: string;
  categorization?: string;
  context?: boolean | string;
  custom_coordinates?: string;
  detection?: string;
  face_coordinates?: string;
  headers?: string;
  notification_url?: string;
  ocr?: string;
  raw_convert?: string;
  similarity_search?: string;
  tags?: string | string[];
  moderation_status?: string;
  unsafe_update?: object; // might be Record<any, any>
  allowed_for_strict?: boolean;
  asset_folder?: string;
  unique_display_name?: boolean;
  display_name?: string;

  [futureKey: string]: any;
}

export interface PublishApiOptions extends ResourceOptions {
  invalidate?: boolean;
  overwrite?: boolean;

  [futureKey: string]: any;
}

export interface ResourceApiOptions extends ResourceOptions {
  transformation?: TransformationOptions;
  transformations?: TransformationOptions;
  keep_original?: boolean;
  next_cursor?: boolean | string;
  public_ids?: string[];
  prefix?: string;
  all?: boolean;
  max_results?: number;
  tags?: boolean;
  tag?: string;
  context?: boolean;
  direction?: number | string;
  moderations?: boolean;
  start_at?: string;
  exif?: boolean;
  colors?: boolean;
  derived_next_cursor?: string;
  faces?: boolean;
  image_metadata?: boolean;
  media_metadata?: boolean;
  pages?: boolean;
  coordinates?: boolean;
  phash?: boolean;
  cinemagraph_analysis?: boolean;
  accessibility_analysis?: boolean;
  related?: boolean;

  [futureKey: string]: any;
}

export interface UploadApiOptions {
  access_mode?: AccessMode;
  allowed_formats?: VideoFormat[] | ImageFormat[];
  async?: boolean;
  backup?: boolean;
  callback?: string;
  colors?: boolean;
  discard_original_filename?: boolean;
  eager?: TransformationOptions;
  eager_async?: boolean;
  eager_notification_url?: string;
  eval?: string;
  exif?: boolean;
  faces?: boolean;
  filename_override?: string;
  folder?: string;
  format?: VideoFormat | ImageFormat;
  image_metadata?: boolean;
  media_metadata?: boolean;
  invalidate?: boolean;
  moderation?: ModerationKind;
  notification_url?: string;
  overwrite?: boolean;
  phash?: boolean;
  proxy?: string;
  public_id?: string;
  quality_analysis?: boolean;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  responsive_breakpoints?: Record<any, any>;
  return_delete_token?: boolean;
  timestamp?: number;
  transformation?: TransformationOptions;
  type?: DeliveryType;
  unique_filename?: boolean;
  upload_preset?: string;
  use_filename?: boolean;
  chunk_size?: number;
  disable_promises?: boolean;
  oauth_token?: string;
  use_asset_folder_as_public_id_prefix?: boolean;
  // modified because not used often
  regions?: Record<string, [any, any, ...any[]]>;

  [futureKey: string]: any;
}

// ---------- Response Types ---------- //
export interface UploadApiResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: 'image' | 'video' | 'raw' | 'auto';
  created_at: string;
  tags: string[];
  pages: number;
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  access_mode: string;
  original_filename: string;
  responsive_breakpoints?: Record<any, any>;
  moderation: string[];
  access_control: string[];
  // won't change since it's response, we need to discuss documentation team about it before implementing.
  context: object;
  // won't change since it's response, we need to discuss documentation team about it before implementing.
  metadata: object;
  colors?: [string, number][];

  [futureKey: string]: any;
}

export interface UploadApiErrorResponse {
  message: string;
  name: string;
  http_code: number;

  [futureKey: string]: any;
}
