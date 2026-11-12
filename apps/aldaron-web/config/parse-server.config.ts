import Parse from 'parse/node';

let isInitialized = false;

export const getParseServer = () => {
  if (!isInitialized) {
    Parse.initialize(
      process.env.PARSE_APP_ID!,
      'xxx'
    );
    Parse.serverURL = `${process.env.SERVER_URL}/parse`;
    isInitialized = true;
  }

  return Parse;
};
