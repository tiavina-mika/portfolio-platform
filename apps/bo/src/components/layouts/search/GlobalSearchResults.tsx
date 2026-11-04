import {
  Box, CircularProgress, Divider, Stack, Typography, useTheme,
} from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import type { GlobalSearchEntityKey, IGlobalSearchResults } from '@/types/_core/globalSearch.type';

import { goToPreview } from '@/redux/actions/_core/util.action';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { getGlobalSearchEntityConfig, IGlobalSearchEntityConfig } from '@/utils/_core/globalSearch.utils';


type Props = {
  results: IGlobalSearchResults;
  loading: boolean;
  query: string;
  onSelect: () => void;
};

const GlobalSearchResults = ({
  results, loading, query, onSelect,
}: Props) => {
  const { t } = useTranslation(['common', 'cms', 'user', 'project']);
  const theme = useTheme();
  const locale = useSelector(getSettingsLocaleSelector);
  const navigate = useNavigate();
  const config = getGlobalSearchEntityConfig(t, locale);

  const handleSelect = (entityConfig: IGlobalSearchEntityConfig, id: string) => {
    navigate(goToPreview(entityConfig.path, id) as any);
    onSelect();
  };

  if (loading) {
    return (
      <Box className="flexCenter" sx={{ p: 3 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  const entries = Object.entries(results) as [GlobalSearchEntityKey, Record<string, any>[]][];

  if (entries.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          {t('common:noFound', { value: query })}
        </Typography>
      </Box>
    );
  }

  return (
    <Stack sx={{ py: 1 }}>
      {entries.map(([key, items], index) => {
        const entityConfig = config[key];
        const Icon = entityConfig.icon;

        return (
          <Box key={key}>
            {index > 0 && <Divider />}
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                px: 2,
                py: 1,
              }}
            >
              <Icon color={theme.palette.text.secondary} size={14} />
              <Typography
                variant="overline"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {entityConfig.label}
              </Typography>
            </Stack>
            {items.map((item) => (
              <Box
                className="cursorPointer"
                key={item.id}
                onClick={() => handleSelect(entityConfig, item.id)}
                sx={{ px: 2, py: 1, '&:hover': { bgcolor: 'action.hover' } }}
              >
                <Typography noWrap variant="body2">{entityConfig.getTitle(item)}</Typography>
                {entityConfig.getSubtitle(item) && (
                  <Typography
                    noWrap
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    {entityConfig.getSubtitle(item)}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        );
      })}
    </Stack>
  );
};

export default GlobalSearchResults;
