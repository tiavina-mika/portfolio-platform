/* eslint-disable import/no-named-as-default-member */
import i18n, { type TOptions } from 'i18next';

class TranslatedString extends String {
  private readonly restArgs: (TOptions | string)[];

  constructor(private readonly key: string, ...restArgs: (TOptions | string)[]) {
    /*
     * if we used something else than an empty string here,
     * we would see the string being transformed to an array of chars
     * (seen in IntelliJ debugger)
     */
    super('');

    this.restArgs = restArgs;
  }

  toString(): string {
    // If restArgs[0] is an object, treat it as options, otherwise undefined
    const options = this.restArgs[0] && typeof this.restArgs[0] === 'object' ? this.restArgs[0] : undefined;

    return i18n.t(this.key, options);
  }
}

/**
 * Use this for localization of zod messages.
 * The function has to be named `t` because it mimics the `t` function from `i18next`
 * thus our IDE provides code completion and static analysis of translation keys.
 */
export const t = (
  key: string,
  options: {
    path: string | string[];
  } | Record<string, unknown> = {}
): {
  message: string; path?: string[];
} => {
  const message: string = new TranslatedString(key, options) as unknown as string;
  const {
    path,
  } = options;

  if (path === undefined) return { message };

  return {
    message,
    path: typeof path === 'string'
      ? [path]
      : (path as string[]),
  };
};
