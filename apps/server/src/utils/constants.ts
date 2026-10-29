/**
 * change this to your ipv4 ip address if you are using LAN network for example
 * NOTE: this should be the same as the client hostname (browser url)
 */
// export const LOCAL_NETWORK_HOSTNAME = '192.168.88.10';
export const LOCAL_NETWORK_HOSTNAME = 'localhost';

export const OWNER_EMAILS = (process.env.OWNERS_EMAILS || '').split(',');

export const APP_NAME = 'Portfolio';
export const IS_LOCAL = process.env.NODE_ENV === 'development';
export const IS_PROD = process.env.NODE_ENV === 'production';
export const IS_PREPROD = process.env.NODE_ENV === 'preProduction';

export const ADMIN_EMAIL_SENDER = process.env.ADMIN_EMAIL_SENDER;

export const FORCE_PROD = false; // test the prod env in local
export const FORCE_PREPROD = false; // test the prod env in local
export const USE_MASTER_KEY = { useMasterKey: true };
export const WITHOUT_CASCADE_SAVE = { cascadeSave: false };
export const USE_MASTER_KEY_WITHOUT_CASCADE_SAVE = { useMasterKey: true, cascadeSave: false };
export const USE_READ_PREFERENCE = { readPreference: 'SECONDARY' };

export const NOTIFICATION_PROPERTIES = ['from', 'to', 'seen'];
export const HIGHEST_LEVEL_ROLES = ['Owner', 'Administrator']; // the first role is the highest level, the order is important
export const DEFAULT_ROLES = ['Manager'];

/**
 * NOTE: it is also defined in /config/copyBuilds.js
 * so if changed here, change it there too
 */
export const BO_BUILD_FOLDERS = {
  preprod: 'clientBuild/bo/preprod',
  prod: 'clientBuild/bo/prod',
};

export const BO_BUILD_FOLDER = (process.env.NODE_ENV === 'production' || FORCE_PROD) ? BO_BUILD_FOLDERS.prod : BO_BUILD_FOLDERS.preprod;
export const LOCALES = ['fr', 'mg', 'en'] as const;
export const MAX_FILES_UPLOAD = 10;

export const LOG_TOPIC = {
  PARSE_TRIGGER: 'PARSE_TRIGGER',
  PARSE_FUNCTION: 'PARSE_FUNCTION',
  SERVICE: 'SERVICE',
  CONTROLLER: 'CONTROLLER',
};

export const DISABLE_USER_ACCOUNT_CONFIRMATION = true;
