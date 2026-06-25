import { useState } from 'react';

export type AlertSeverity = 'success' | 'error' | 'warning' | 'info';

export function useAlert() {
   const [alert, setAlert] = useState({
      open: false,
      message: '',
      severity: 'info' as AlertSeverity,
   });

   const showAlert = (
      message: string,
      severity: AlertSeverity = 'info'
   ) => {
      setAlert({
         open: true,
         message,
         severity,
      });
   };

   const closeAlert = () => {
      setAlert((prev) => ({
         ...prev,
         open: false,
      }));
   };

   return {
      alert,
      showAlert,
      closeAlert,
   };
}
