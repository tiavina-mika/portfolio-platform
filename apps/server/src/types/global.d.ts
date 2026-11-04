
// global.d.ts
declare global {
  var sessionTokenForTest: string | undefined;
  var IS_TEST: boolean;
}

export {}; // This ensures the file is treated as a module
