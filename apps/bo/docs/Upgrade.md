# Tanstack router before upgrade
## navigate
- navigate({ to: PATH_NAMES.profile });
  to:
- navigate({ to: PATH_NAMES.profile } as any);

Or
const goToProfile = (): any => ({ to: PATH_NAMES.profile });

## Link component
Update the Link component types

# MUI 7
- Grid2 to Grid
- Tabs TabIndicatorProps props to slotProps={{ indicator: { sx: { display: 'none' } } }}
  
# Parse
- remove @types/parse package
  - yarn remove @types/parse
- Parse.initialize needs appId and javascriptKey
  - Parse.initialize(import.meta.env.VITE_PARSE_APP_ID, 'xxx');
- Parse.Object type instead of Attributes
  - import Parse from 'parse';
  - Remove extending Attributes in types
- in vite.config.ts add nodePolyfills
  - import { nodePolyfills } from 'vite-plugin-node-polyfills'
  - add nodePolyfills() in plugins array
  - This to avoid the error `Uncaught TypeError: Emitter is not a constructor`