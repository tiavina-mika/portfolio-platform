declare module 'parse-server/lib/cloud-code/Parse.Cloud.js' {
  import type { Cloud } from 'parse';

  const ParseCloud: typeof Cloud;

  export default ParseCloud;
}
