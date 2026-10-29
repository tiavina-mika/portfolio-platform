import { Grid } from '@mui/material';

import Layout from '@/components/layouts/Layout';
import { ISelectOption } from '@/types/app.type';
import { PREVIEW_PAGE_GRID } from '@/utils/constants';

import UserInfo from './UserInfos';

type Props<T extends Parse.Object, K extends ISelectOption[]> = {
  object: T;
  keys: K;
};
const UsersForEntity = <T extends Parse.Object, K extends ISelectOption[]>({
  object, keys,
}: Props<T, K>) => {
  return (
    <Grid
      size={PREVIEW_PAGE_GRID.left}
    >
      <Grid container gap={2}>
        {keys.map((key) => {
          const user = object.get
            ? object.get(key.value)
            : (object as any)[key.value];

          if (!user) return null;
          return (
            (
              <Grid
                key={key.value}
                size={{
                  lg: 3,
                }}
              >
                <Layout cardTitle={key.label}>
                  <UserInfo direction="row" user={user} />
                </Layout>
              </Grid>
            )
          );
        })}
      </Grid>
    </Grid>
  );
};

export default UsersForEntity;
