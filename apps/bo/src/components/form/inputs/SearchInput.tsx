
import { type Theme, styled } from '@mui/material';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSearch } from 'react-icons/fi';

type StyledSearchInputProps = {
  theme?: Theme;
  width: number | string;
};
const StyledSearchInput = styled('div', { shouldForwardProp: prop => prop !== 'width' })<StyledSearchInputProps>(
  ({
    theme, width,
  }) => ({
    padding: '0.5px 4px',
    width,
    border: 'none',
    borderRadius: 6,
    backgroundColor: theme.palette.background.default,
    [theme.breakpoints.down('md')]: { width: '100%' },

    ...theme.applyStyles('light', {
      border: '1px solid #BDBDBD',
      backgroundColor: 'none',
    }),
  })
);

type Props = {
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  // name is use to identify to use in search (ex: filters.user, filters.text, ...), by default it's text
  name?: string;
  withDivider?: boolean;
  width?: number | string;
};

const SearchInput = ({
  onChange, placeholder, width = '18vw', withDivider = false, name = 'text',
}: Props) => {
  const {
    t,
  } = useTranslation();
  const [value, setValue] = useState<string>('');

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setValue(event.target.value);
    onChange(name, event.target.value);
  };

  return (
    <StyledSearchInput className="flexRow center" width={width}>
      <IconButton aria-label="search" sx={{ p: '10px' }} type="button">
        <FiSearch />
      </IconButton>
      {withDivider && <Divider orientation="vertical" sx={{ height: 28, m: 0.5 }} />}
      <InputBase
        onChange={handleChange}
        placeholder={placeholder ?? t('search')}
        sx={{ ml: 0, flex: 1, fontSize: 14 }}
        value={value}
      />
    </StyledSearchInput>
  );
};

export default SearchInput;
