import Button from '@mui/material/Button';
import { FiPlus } from 'react-icons/fi';

import { PAGE_HEAD_ACTION_ICON_SIZE } from '@/constants/_core/ui/page.constants';

type Props = {
  label: string;
  onClick: () => void;
};

/**
 * The one action a list page is opened to perform: it stands in the page head, at the end of the
 * row, as the only filled button on the screen. It is named rather than drawn as a bare glyph —
 * "what does the + create here" is a question the reader should never have to open a page to
 * answer.
 */
const CreateButton = ({
  label, onClick,
}: Props) => (
  <Button
    onClick={onClick}
    startIcon={<FiPlus size={PAGE_HEAD_ACTION_ICON_SIZE} />}
    variant="contained"
  >
    {label}
  </Button>
);

export default CreateButton;
