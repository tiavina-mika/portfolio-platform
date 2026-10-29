import { Outlet } from '@tanstack/react-router';

import { CMS_FORM_MAX_WIDTH, CMS_FORM_WIDE_MAX_WIDTH } from '@/constants/_core/ui.constants';

const classes = {
  content: (wide: boolean) => ({
    maxWidth: wide
      ? CMS_FORM_WIDE_MAX_WIDTH
      : CMS_FORM_MAX_WIDTH,
    marginLeft: 'auto',
    marginRight: 'auto',
  }),
};

type Props = {
  /*
   * a form laid out in several columns (the page form's summary, section and preview) needs more
   * than the width a single column of fields is capped at
   */
  wide?: boolean;
};

const CMSFormLayout = ({ wide = false }: Props) => {
  return (
    <div className="stretchSelf">
      <div className="flexColumn" css={classes.content(wide)}>
        <Outlet />
      </div>
    </div>
  );
};

export default CMSFormLayout;
