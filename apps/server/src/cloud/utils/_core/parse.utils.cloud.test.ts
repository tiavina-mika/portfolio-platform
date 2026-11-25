import { TargetEnum } from '@shared/types';
import Parse from 'parse';
import {
  beforeAll, describe, expect, it, vi,
} from 'vitest';

import type { workspacesTargetQuery as WorkspacesTargetQuery } from './parse.utils.cloud';

// the cloud utils read `Parse` as the global Parse Server defines it
let workspacesTargetQuery: typeof WorkspacesTargetQuery;

beforeAll(async () => {
  vi.stubGlobal('Parse', Parse);
  ({ workspacesTargetQuery } = await import('./parse.utils.cloud'));
});

const narrow = (workspaces: TargetEnum[], field?: string) => (
  // the SDK's own typings and the global ones describe the same query class
  workspacesTargetQuery(new Parse.Query('Project') as unknown as Parse.Query, workspaces, field).toJSON().where
);

describe('the rows a reader limited to some workspaces may reach', () => {
  it('should leave the query alone when every workspace is open', () => {
    expect(narrow(Object.values(TargetEnum))).toEqual({});
  });

  it('should keep only the rows filed in the agency for a reader who opens the agency alone', () => {
    expect(narrow([TargetEnum.AGENCY], 'target')).toEqual({ target: TargetEnum.AGENCY });
  });

  it('should keep the portfolio rows, and the rows with no target, for a portfolio-only reader', () => {
    const where = narrow([TargetEnum.PORTFOLIO], 'target');

    expect(JSON.stringify(where)).toContain(`"target":"${TargetEnum.PORTFOLIO}"`);
    expect(JSON.stringify(where)).toContain('"$exists":false');
    expect(JSON.stringify(where)).not.toContain(`"target":"${TargetEnum.AGENCY}"`);
  });
});
