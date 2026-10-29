import { Button, type Theme } from '@mui/material';
import { green, grey, red } from '@mui/material/colors';

const classes = {
  separator: (theme: Theme) => ({
    width: 80,
    height: 1,
    backgroundColor: theme.palette.grey[500],
    marginTop: 16,
    marginBottom: 2,
  }),
  button: {
    height: 46,
    minWidth: 400,
    maxWidth: 450,
    borderRadius: 3,
    fontWeight: 500,
    boxShadow: 'none',
  },
  greenBtn: {
    backgroundColor: green[600],
    color: 'white',
    border: 'none',
    '&:hover': { backgroundColor: green[700] },
    '&:focus, &:active:focus': { backgroundColor: green[800] },
    '&:active': { backgroundColor: green[600] },
    '&:disabled, &:disabled:hover': {
      backgroundColor: green[600],
      opacity: 0.7,
      cursor: 'not-allowed',
    },
  },
  redBtn: {
    backgroundColor: red[600],
    color: 'white',
    border: 'none',
    '&:hover': { backgroundColor: red[700] },
    '&:focus, &:active:focus': { backgroundColor: red[800] },
    '&:active': { backgroundColor: red[600] },
    '&:disabled, &:disabled:hover': {
      backgroundColor: red[600],
      opacity: 0.7,
      cursor: 'not-allowed',
    },
  },
  greyNoShadow: {
    border: '1px solid ' + grey[600],
    backgroundColor: 'transparent',
    color: grey[700],
    '&:hover': { borderColor: grey[600] },
    '&:focus, &:active:focus': { borderColor: grey[600] },
    '&:active': { borderColor: grey[600] },
    '&:disabled, &:disabled:hover': {
      borderColor: grey[600],
      cursor: 'not-allowed',
    },
  },
  white: (theme: Theme) => ({
    backgroundColor: theme.palette.background.paper,
    border: '1px solid ' + theme.palette.divider,
    color: theme.palette.text.primary,
    '&:hover': {
      borderColor: theme.palette.divider,
      backgroundColor: theme.palette.background.paper,
    },
    '&:focus, &:active:focus': { borderColor: theme.palette.divider },
    '&:active': { borderColor: theme.palette.divider },
    '&:disabled, &:disabled:hover': {
      borderColor: theme.palette.divider,
      cursor: 'not-allowed',
    },
  }),
};

const getButtonStyle = (color: string) => {
  switch (color) {
    case 'green':
      return classes.greenBtn;
    case 'red':
      return classes.redBtn;
    case 'grey':
      return classes.greyNoShadow;
    case 'white':
      return classes.white;
    default:
      return classes.greenBtn;
  }
};

type Props = {
  color: string;
  label: string;
  action: () => void;
  withSeparator?: boolean;
};
const MiscButton = ({
  color,
  label,
  action,
  withSeparator = false,
}: Props) => {
  return (
    <div className="flexColumn center">
      <Button
        css={[classes.button, getButtonStyle(color)]}
        onClick={action}
        variant="contained"
      >
        {label}
      </Button>
      {withSeparator && <div css={classes.separator} />}
    </div>
  );
};


export default MiscButton;
