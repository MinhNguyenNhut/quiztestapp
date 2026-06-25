import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export interface AppAlertProps {
   open: boolean;
   message: string;
   severity?: 'success' | 'error' | 'warning' | 'info';
   autoHideDuration?: number;
   onClose: () => void;
}

export default function AppAlert({
   open,
   message,
   severity = 'info',
   autoHideDuration = 3000,
   onClose,
}: AppAlertProps) {
   return (
      <Snackbar
         open={open}
         autoHideDuration={autoHideDuration}
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
            sx={{ width: '100%' }}
         >
            {message}
         </Alert>
      </Snackbar>
   );
}
