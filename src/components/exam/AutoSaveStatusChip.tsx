import { Chip, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import SaveIcon from '@mui/icons-material/Save';
import type { AutoSaveStatus } from '../../features/exam/examSlice';

interface AutoSaveStatusProps {
  status: AutoSaveStatus;
  online: boolean;
}

export const AutoSaveStatusChip = ({ status, online }: AutoSaveStatusProps) => {
  const { t } = useTranslation();

  const getStatusConfig = (): { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'error' } => {
    switch (status) {
      case 'idle':
        return { label: t('common.ready'), color: 'default' };
      case 'saving':
        return { label: t('common.saving'), color: 'primary' };
      case 'saved':
        return { label: t('common.saved'), color: 'success' };
      case 'error':
        return { label: t('common.saveFailed'), color: 'error' };
      default:
        return { label: t('common.ready'), color: 'default' };
    }
  };

  const { label, color } = getStatusConfig();
  const icon = !online ? <CloudOffIcon fontSize="small" /> : status === 'saving' ? <SaveIcon fontSize="small" /> : <CloudDoneIcon fontSize="small" />;
  const tip = !online
    ? t('common.offlineMessage')
    : status === 'saved'
    ? t('common.allSavedMessage')
    : status === 'saving'
    ? t('common.savingAnswersMessage')
    : t('common.autoSaveReady');

  return (
    <Tooltip title={tip}>
      <Chip
        icon={icon}
        label={label}
        size="small"
        color={color}
        variant="outlined"
        sx={{ fontWeight: 500 }}
      />
    </Tooltip>
  );
};
