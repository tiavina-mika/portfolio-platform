import { Outlet } from '@tanstack/react-router';

const classes = {
  content: {
    maxWidth: 1000,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
};
const CMSFormLayout = () => {
  return (
    <div className="stretchSelf">
      <div className="flexColumn" css={classes.content}>
        <Outlet />
      </div>
    </div>
  );
};

export default CMSFormLayout;
