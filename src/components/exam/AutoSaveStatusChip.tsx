import { Chip, Tooltip } from '@mui/material';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import SaveIcon from '@mui/icons-material/Save';
import type { AutoSaveStatus } from '../../features/exam/examSlice';

interface AutoSaveStatusProps {
  status: AutoSaveStatus;
  online: boolean;
}

const labelMap: Record<AutoSaveStatus, { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'error' }> = {
  idle: { label: 'Ready', color: 'default' },
  saving: { label: 'Saving...', color: 'primary' },
  saved: { label: 'Saved', color: 'success' },
  error: { label: 'Save failed', color: 'error' },
};

export const AutoSaveStatusChip = ({ status, online }: AutoSaveStatusProps) => {
  const { label, color } = labelMap[status];
  const icon = !online ? <CloudOffIcon fontSize="small" /> : status === 'saving' ? <SaveIcon fontSize="small" /> : <CloudDoneIcon fontSize="small" />;
  const tip = !online
    ? 'You are offline. Answers will be saved locally until you reconnect.'
    : status === 'saved'
    ? 'All your answers are saved'
    : status === 'saving'
    ? 'Saving your answers...'
    : 'Auto-save ready';

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
