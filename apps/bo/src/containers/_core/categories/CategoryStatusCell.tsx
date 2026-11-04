import Typography from '@mui/material/Typography';

import StatusDot from '@/components/StatusDot';
import { ICategory } from '@/types/_core/category.type';
import {
  getCategoryStatus, getCategoryStatusColor, getTranslatedCategoryStatusLabel,
} from '@/utils/_core/cms.utils';

type Props = {
  category: ICategory;
};

/**
 * Whether the category is in use, in the same tinted-dot language every other list uses for a
 * state. A filled chip repeated down a column turns the list into a wall of color with no row
 * standing out from the others, which is the one thing a status column is there for.
 */
const CategoryStatusCell = ({ category }: Props) => {
  const status = getCategoryStatus(category);

  return (
    <Typography component="span" variant="subtitle1">
      <StatusDot
        color={getCategoryStatusColor(status)}
        label={getTranslatedCategoryStatusLabel(status)}
      />
    </Typography>
  );
};

export default CategoryStatusCell;
