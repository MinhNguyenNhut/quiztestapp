import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import type { AlertSeverity } from '../../../hooks/useAlert';
interface AppAlertProps {
  open: boolean;
  message: string;
  severity: AlertSeverity;
  onClose: () => void;
}

export default function AppAlert({
  open,
  message,
  severity,
  onClose,
}: AppAlertProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Alert
        severity={severity}
        variant="filled"
        onClose={onClose}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
