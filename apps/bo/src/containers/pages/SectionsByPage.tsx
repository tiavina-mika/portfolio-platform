import {
  IconButton,
  Table, TableBody, TableCell, TableHead, TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { FiEdit2 } from 'react-icons/fi';

import BooleanIcons from '@/components/BooleanIcons';
import { goToEditPageSection } from '@/redux/actions/pageSection.action';
import { IPageSection } from '@/types/page.type';
import { Locale } from '@/types/setting.type';
import { getTranslatedField } from '@/utils/settings.utils';


type Props = {
  pageId: string;
  sections: IPageSection[];
  locale: Locale;
};
const SectionsByPage = ({ pageId, sections = [], locale }: Props) => {
  const { t } = useTranslation(['cms', 'common']);
  const navigate = useNavigate();

  const goToEdition = (id: string) => {
    navigate(goToEditPageSection(pageId, id));
  };

  if (sections.length === 0) {
    return <Typography>{t('cms:noSectionsForThisPage')}</Typography>;
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>{t('cms:title')}</TableCell>
          <TableCell>{t('common:description')}</TableCell>
          <TableCell>{t('cms:numberOfBlocks')}</TableCell>
          <TableCell>{t('common:active')}</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sections.map((section: IPageSection) => (
          <TableRow key={section.id}>
            <TableCell>
              {getTranslatedField(section.get('translated'), locale, 'title')}
            </TableCell>
            <TableCell>
              {getTranslatedField(section.get('translated'), locale, 'description')}
            </TableCell>
            <TableCell>{section.get('blocks')?.length || 0}</TableCell>
            <TableCell>
              <BooleanIcons value={section.get('active')} />
            </TableCell>
            <TableCell>
              <Tooltip title={t('common:edit')}>
                <IconButton onClick={() => goToEdition(section.id)}>
                  <FiEdit2 size={18} />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SectionsByPage;
