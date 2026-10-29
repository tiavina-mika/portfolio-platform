/* eslint-disable @cspell/spellchecker */
import { darken, styled } from '@mui/material';

type Props = {
  size?: number;
  form?: 'square' | 'circle';
};

export const StyledCheckbox = styled('span', { shouldForwardProp: prop => prop !== 'size' && prop !== 'form' })<Props>(({
  theme, size,
}) => ({
  borderRadius: '50%',
  width: size,
  height: size,

  boxShadow:
    'inset 0 0 0 1px rgba(0, 0, 0,.2), inset 0 -1px 0 rgba(0, 0, 0,.1)',

  backgroundColor: '#f5f8fa',

  backgroundImage:
    'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',

  '.Mui-focusVisible &': {
    outline: '2px auto rgba(19,124,189,.6)',
    outlineOffset: 2,
  },

  'input:hover ~ &': {
    backgroundColor: '#ebf1f5',

    ...theme.applyStyles('dark', {
      backgroundColor: '#30404d',
    }),
  },

  'input:disabled ~ &': {
    boxShadow: 'none',
    background: 'rgba(206,217,224,.5)',

    ...theme.applyStyles('dark', {
      background: 'rgba(57,75,89,.5)',
    }),
  },

  ...theme.applyStyles('dark', {
    boxShadow: '0 0 0 1px rgb(16 22 26 / 40%)',
    backgroundColor: '#394b59',
    backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.05),hsla(0,0%,100%,0))',
  }),

  variants: [{
    props: {
      form: 'square',
    },

    style: {
      borderRadius: 3,
    },
  }],
}));

export const StyledCheckedCheckbox = styled(StyledCheckbox, { shouldForwardProp: prop => prop !== 'size' && prop !== 'form' })<Props>(({
  theme, size,
}) => ({
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',

  '&:before': {
    display: 'block',
    width: size,
    height: size,
    backgroundImage:

      'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3E%3Cpath' +
      ' fill-rule=\'evenodd\' clip-rule=\'evenodd\' d=\'M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 ' +

      '1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z\' fill=\'%23fff\'/%3E%3C/svg%3E")',
    content: '""',
  },

  'input:hover ~ &': { backgroundColor: darken(theme.palette.primary.main, 0.5) },

  variants: [{
    props: {
      form: 'square',
    },

    style: {
      borderRadius: 3,
    },
  }],
}));
